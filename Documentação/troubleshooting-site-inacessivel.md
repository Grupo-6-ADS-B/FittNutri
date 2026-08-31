# Troubleshooting — Site Inacessível após Destroy + Apply

> Documento gerado a partir de incidente real ocorrido em 26/04/2026.
> Cobre os dois cenários mais prováveis de indisponibilidade após um `terraform destroy + apply`:
> **502 Bad Gateway no Grafana** e **DNS_PROBE_FINISHED_NXDOMAIN no site principal**.

---

## Índice

1. [Diagnóstico rápido — por onde começar](#1-diagnóstico-rápido)
2. [Cenário A — 502 Bad Gateway no Grafana](#2-cenário-a--502-bad-gateway-no-grafana)
3. [Cenário B — Site principal com NXDOMAIN / DNS não resolve](#3-cenário-b--site-principal-com-nxdomain)
4. [Cenário C — Target unhealthy no ALB (app não subiu)](#4-cenário-c--target-unhealthy-no-alb)
5. [Checklist pós-deploy](#5-checklist-pós-deploy)

---

## 1. Diagnóstico rápido

Antes de qualquer coisa, rode esses três comandos em sequência para identificar onde está o problema:

```bash
# 1. ALB responde?
curl -I http://fittnutri-alb-prod-<ID>.us-east-1.elb.amazonaws.com
# Esperado: HTTP/1.1 301 Moved Permanently

# 2. DNS resolve globalmente?
nslookup fittnutri.site 8.8.8.8
# Esperado: 2 endereços IP do ALB

# 3. DNS resolve localmente?
nslookup fittnutri.site
# Se retornar NXDOMAIN mas o 8.8.8.8 retornar IPs → problema de cache local (Cenário B)
```

> O DNS do ALB muda a cada destroy+apply. Pegue o novo valor em:
> **AWS Console → EC2 → Load Balancers → Nome do DNS**

---

## 2. Cenário A — 502 Bad Gateway no Grafana

### Sintoma
- `https://fittnutri.site` carrega normalmente
- `https://fittnutri.site/grafana` retorna **502 Bad Gateway**

### Causa raiz
O ALB roteia `/grafana/*` diretamente para a EC2 de Monitoring na porta 3000.
O 502 acontece quando o container Grafana não está rodando ou o health check falha.

O health check do target group Grafana aponta para `/grafana/api/health`.
Se o Grafana não estiver configurado com `GF_SERVER_SERVE_FROM_SUB_PATH=true`,
ele serve em `/` e o health check em `/grafana/api/health` retorna 404 → ALB marca target unhealthy → 502.

### Diagnóstico

```bash
# 1. Verificar target group do Grafana no ALB
aws elbv2 describe-target-groups \
  --region us-east-1 \
  --query "TargetGroups[?contains(TargetGroupName,'grafana')].{Nome:TargetGroupName,ARN:TargetGroupArn}" \
  --output table

# 2. Verificar saúde do target (substituir ARN)
aws elbv2 describe-target-health \
  --region us-east-1 \
  --target-group-arn <ARN_DO_TARGET_GROUP_GRAFANA>
```

Se o target estiver `unhealthy`, o container não subiu corretamente.

### Verificar log da EC2 Monitoring via SSM

```bash
# 1. Pegar o Instance ID da EC2 Monitoring
aws ec2 describe-instances \
  --region us-east-1 \
  --filters "Name=tag:Role,Values=monitoring" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text

# 2. Conectar via SSM
aws ssm start-session --target <INSTANCE_ID> --region us-east-1

# 3. Dentro da sessão SSM, verificar o log de boot
sudo cat /var/log/user-data-monitoring.log

# 4. Ver se os containers estão rodando
sudo docker ps
```

### Solução — Subir containers manualmente via SSM

Se os containers não estiverem rodando, execute dentro da sessão SSM:

```bash
# Usar variáveis para evitar problemas de quebra de linha no terminal
V1=/etc/prometheus/prometheus.yml
V2=prom_data
V3=graf_data
IMG=prom/prometheus:latest
GIMG=grafana/grafana:latest
ENV=/etc/fittnutri/grafana.env
PROV=/etc/grafana/provisioning
DASH=/etc/grafana/dashboards

# Criar rede (se não existir)
sudo docker network create monitoring 2>/dev/null || true

# Subir Prometheus
sudo docker rm -f fittnutri-prometheus 2>/dev/null || true
sudo docker run -d --name fittnutri-prometheus --restart unless-stopped \
  --network monitoring -p 9090:9090 \
  -v $V1:/etc/prometheus/prometheus.yml:ro \
  -v $V2:/prometheus $IMG

# Subir Grafana
sudo docker rm -f fittnutri-grafana 2>/dev/null || true
sudo docker run -d --name fittnutri-grafana --restart unless-stopped \
  --network monitoring -p 3000:3000 \
  -v $V3:/var/lib/grafana \
  -v $PROV:/etc/grafana/provisioning:ro \
  -v $DASH:/etc/grafana/dashboards:ro \
  --env-file $ENV $GIMG

# Confirmar
sudo docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Aguarde ~60 segundos e teste `https://fittnutri.site/grafana`.

### Causa permanente (já corrigida no código)

O user-data do módulo monitoring (`terraform/modules/monitoring/user-data.sh.tpl`) tinha bugs:
- Variáveis `$var` não escapadas → Terraform interpretava como template variables → Bash recebia `$$` (PID do processo)
- `GF_SERVER_ROOT_URL` usava sintaxe INI (`%(protocol)s://%(domain)s/`) inválida como variável de ambiente

Correção aplicada no commit `2961cc7` na branch `claude-test`:
- Todas as variáveis shell escapadas com `$` → `$$` no template
- `GF_SERVER_ROOT_URL` corrigido para `https://${app_domain}/grafana/`
- Health check do ALB corrigido de `/api/health` para `/grafana/api/health`

---

## 3. Cenário B — Site principal com NXDOMAIN

### Sintoma
- Chrome mostra `DNS_PROBE_FINISHED_NXDOMAIN`
- `nslookup fittnutri.site` retorna "Nenhum registro disponível"
- Mas `nslookup fittnutri.site 8.8.8.8` resolve corretamente

### Causa raiz
Após `terraform destroy + apply`, o ALB é recriado com um **novo DNS name**.
O DNS do Namecheap precisa ser atualizado manualmente com o novo valor.
Mesmo após a atualização, o **roteador local** pode ter o DNS antigo cacheado.

### Passo 1 — Verificar/atualizar o Namecheap

1. Acesse o DNS do ALB no AWS Console:
   **EC2 → Load Balancers → fittnutri-alb-prod → Nome do DNS**

2. No Namecheap (**Advanced DNS** de `fittnutri.site`), atualize:

| Tipo | Host | Valor |
|------|------|-------|
| ALIAS Record | @ | `<novo-dns-alb>.us-east-1.elb.amazonaws.com.` |
| CNAME Record | www | `<novo-dns-alb>.us-east-1.elb.amazonaws.com.` |

> O ponto final (`.`) no valor é necessário em alguns provedores.

### Passo 2 — Confirmar que propagou globalmente

Acesse [https://dnschecker.org/#A/fittnutri.site](https://dnschecker.org/#A/fittnutri.site) e confirme que a maioria dos servidores retorna IPs.

Ou via linha de comando:
```bash
nslookup fittnutri.site 8.8.8.8
# Deve retornar 2 IPs do ALB
```

### Passo 3 — Resolver cache local

**Opção 1 — Reiniciar o roteador** (resolve para todos os dispositivos da rede):
- Desligar o roteador por 30 segundos e ligar novamente.

**Opção 2 — Mudar DNS do PC temporariamente**:
1. Painel de Controle → Central de Rede → Alterar configurações do adaptador
2. Clique direito na conexão → Propriedades → IPv4 → Propriedades
3. DNS preferencial: `8.8.8.8` | DNS alternativo: `8.8.4.4`

**Opção 3 — Limpar cache DNS do Windows** (CMD como Administrador):
```cmd
ipconfig /flushdns
```

**Opção 4 — Limpar cache DNS do Chrome**:
- Acesse `chrome://net-internals/#dns` → **Clear host cache**
- Acesse `chrome://net-internals/#sockets` → **Flush socket pools**

### Verificação final

```bash
# ALB responde diretamente (deve retornar 301)
curl -I http://<novo-dns-alb>.us-east-1.elb.amazonaws.com

# DNS local resolve
nslookup fittnutri.site

# Site acessível
curl -I https://fittnutri.site
```

---

## 4. Cenário C — Target unhealthy no ALB (app não subiu)

### Sintoma
- DNS resolve corretamente
- ALB responde no DNS direto
- Mas `https://fittnutri.site` retorna **502** ou **503**

### Causa
O user-data do compute EC2 faz um build completo Maven + Vite que leva **10 a 20 minutos**.
Durante esse período o target fica com status `initial` e depois `unhealthy` se o app não subir.

### Diagnóstico

```bash
# Ver status do target group da aplicação
aws elbv2 describe-target-health \
  --region us-east-1 \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --region us-east-1 \
    --query "TargetGroups[?contains(TargetGroupName,'app-tg')].TargetGroupArn" \
    --output text)
```

Status esperados:
- `initial` → ainda inicializando, aguarde
- `healthy` → app rodando normalmente
- `unhealthy` → app não subiu, verificar log

### Ver log de boot da EC2 App

```bash
# Pegar Instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --region us-east-1 \
  --filters "Name=tag:Role,Values=app" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

# Ver log de console (últimas 50 linhas)
aws ec2 get-console-output \
  --region us-east-1 \
  --instance-id $INSTANCE_ID \
  --output text | tail -50

# Ou conectar via SSM e verificar diretamente
aws ssm start-session --target $INSTANCE_ID --region us-east-1
# Dentro do SSM:
sudo cat /var/log/user-data.log
sudo docker ps
```

---

## 5. Checklist pós-deploy

Após qualquer `terraform apply`, siga essa ordem:

- [ ] **Certificado ACM** — Se `acm_certificate_arn = ""` no tfvars, o cert foi recriado. Acesse **ACM no console** e verifique se os CNAMEs de validação ainda são os mesmos. Se mudaram, atualize no Namecheap.
- [ ] **DNS do ALB** — Pegue o novo DNS do ALB e atualize o ALIAS record no Namecheap.
- [ ] **Aguardar propagação DNS** — Use `nslookup fittnutri.site 8.8.8.8` para confirmar.
- [ ] **Target group App** — Aguarde até 20 min e confirme status `healthy`.
- [ ] **Target group Grafana** — Aguarde até 5 min e confirme status `healthy`.
- [ ] **Testar site** — `https://fittnutri.site` deve carregar.
- [ ] **Testar Grafana** — `https://fittnutri.site/grafana` deve carregar.
- [ ] **Cache local** — Se outros dispositivos funcionam mas o seu não, reinicie o roteador.

---

> Última atualização: 26/04/2026
> Incidente original: 502 no Grafana + NXDOMAIN após destroy+apply com novo ALB
