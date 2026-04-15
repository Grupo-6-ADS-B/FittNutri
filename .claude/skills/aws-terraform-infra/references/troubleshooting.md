# Troubleshooting — Diagnóstico AWS CLI

## Setup Inicial

```bash
export AWS_PAGER=""
REGION="us-east-1"
```

## Inventário Completo de Recursos

Script para coletar estado completo da infra (útil antes de qualquer mudança):

```bash
VPC="vpc-ID_AQUI"

echo "=== SUBNETS ===" 
aws ec2 describe-subnets --region $REGION --filters "Name=vpc-id,Values=$VPC" \
  --query 'Subnets[*].{Name:Tags[?Key==`Name`].Value|[0],Id:SubnetId,AZ:AvailabilityZone,CIDR:CidrBlock,Public:MapPublicIpOnLaunch}' --output table

echo "=== SECURITY GROUPS ==="
aws ec2 describe-security-groups --region $REGION --filters "Name=vpc-id,Values=$VPC" \
  --query 'SecurityGroups[*].{Name:GroupName,Id:GroupId}' --output table

echo "=== VPC ENDPOINTS ==="
aws ec2 describe-vpc-endpoints --region $REGION --filters "Name=vpc-id,Values=$VPC" \
  --query 'VpcEndpoints[*].{Name:Tags[?Key==`Name`].Value|[0],Service:ServiceName,State:State}' --output table

echo "=== ROUTE TABLES (blackholes) ==="
aws ec2 describe-route-tables --region $REGION --filters "Name=vpc-id,Values=$VPC" \
  --query 'RouteTables[*].{Name:Tags[?Key==`Name`].Value|[0],Id:RouteTableId,Blackholes:Routes[?State==`blackhole`]}' --output json

echo "=== TARGET HEALTH ==="
for tg in $(aws elbv2 describe-target-groups --region $REGION --query 'TargetGroups[*].TargetGroupArn' --output text); do
  echo "--- $(echo $tg | rev | cut -d/ -f1 | rev) ---"
  aws elbv2 describe-target-health --region $REGION --target-group-arn $tg --output table
done

echo "=== ASG ==="
aws autoscaling describe-auto-scaling-groups --region $REGION \
  --query 'AutoScalingGroups[*].{Name:AutoScalingGroupName,Min:MinSize,Max:MaxSize,Desired:DesiredCapacity,Instances:Instances[*].InstanceId}' --output json
```

## Problemas Comuns

### 1. Instância não conecta ao SSM

**Sintoma**: `TargetNotConnected` ao tentar `aws ssm start-session`

**Diagnóstico**:
```bash
# Verificar se VPC Endpoints de SSM existem
aws ec2 describe-vpc-endpoints --region $REGION \
  --filters "Name=vpc-id,Values=$VPC" \
  --query 'VpcEndpoints[?contains(ServiceName,`ssm`)].{Service:ServiceName,State:State}' --output table
```

**Solução**: Precisa de 3 endpoints: `ssm`, `ssmmessages`, `ec2messages`. Todos com SG permitindo 443 do CIDR da VPC.

### 2. Docker pull falha no ECR

**Sintoma**: Timeout ao fazer `docker pull` de imagem ECR

**Diagnóstico**:
```bash
# Verificar endpoints ECR
aws ec2 describe-vpc-endpoints --region $REGION \
  --filters "Name=vpc-id,Values=$VPC" \
  --query 'VpcEndpoints[?contains(ServiceName,`ecr`)].{Service:ServiceName,State:State}' --output table
```

**Solução**: Precisa de `ecr.api`, `ecr.dkr`, `sts` (Interface) + `s3` (Gateway).

### 3. Health check do ALB falhando

**Diagnóstico**:
```bash
# Ver health atual
aws elbv2 describe-target-health --region $REGION --target-group-arn TG_ARN --output json

# Ver configuração do health check
aws elbv2 describe-target-groups --region $REGION \
  --target-group-arns TG_ARN \
  --query 'TargetGroups[0].{Path:HealthCheckPath,Port:HealthCheckPort,Protocol:HealthCheckProtocol}' --output table
```

**Causas comuns**:
- App depende de DB que está stopped → usar health check `/` em vez de `/actuator/health`
- SG não permite tráfego do ALB → verificar regra de ingress 8080 do SG do ALB
- Container não subiu → verificar logs via SSM

### 4. Cloud-init não executa

**Diagnóstico** (via SSM send-command):
```bash
CMD_ID=$(aws ssm send-command --region $REGION \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cloud-init status","cat /var/log/cloud-init-output.log | tail -50","docker ps"]' \
  --query 'Command.CommandId' --output text)

sleep 15

aws ssm get-command-invocation --region $REGION \
  --command-id $CMD_ID --instance-id $INSTANCE_ID \
  --query '{Status:Status,Output:StandardOutputContent,Error:StandardErrorContent}' --output json
```

### 5. Rota blackhole

**Sintoma**: Instâncias sem acesso à internet

**Diagnóstico**:
```bash
aws ec2 describe-route-tables --region $REGION \
  --filters "Name=vpc-id,Values=$VPC" \
  --query 'RouteTables[*].Routes[?State==`blackhole`]' --output json
```

**Solução**: NAT Gateway foi deletado. Remover a rota ou criar novo NAT/VPC Endpoints.

## Comandos Úteis do Dia a Dia

```bash
# Zerar ASG (economizar custos)
aws autoscaling update-auto-scaling-group --region $REGION \
  --auto-scaling-group-name ASG_NAME --min-size 0 --desired-capacity 0

# Subir ASG
aws autoscaling update-auto-scaling-group --region $REGION \
  --auto-scaling-group-name ASG_NAME --min-size 1 --desired-capacity 1

# Parar RDS
aws rds stop-db-instance --region $REGION --db-instance-identifier DB_NAME

# Ligar RDS
aws rds start-db-instance --region $REGION --db-instance-identifier DB_NAME

# Push para ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker tag IMAGE:TAG ACCOUNT.dkr.ecr.REGION.amazonaws.com/REPO:latest
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/REPO:latest

# Forçar nova instância no ASG (instance refresh)
aws autoscaling start-instance-refresh --region $REGION \
  --auto-scaling-group-name ASG_NAME \
  --preferences '{"MinHealthyPercentage":0}'
```