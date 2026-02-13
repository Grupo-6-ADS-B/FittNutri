<!--
	PULL REQUEST TEMPLATE
	Use este modelo para descrever sua contribuição de forma clara e padronizada.
-->

## 📌 Título do Pull Request

Configuração do Spring Boot

---

### 🔧 Descrição

Adiciona a configuração inicial do Spring Boot ao projeto, incluindo ajustes no `application.properties` e conexão com o banco de dados H2.

---

### ✅ Alterações Realizadas

- Configuração do `application.properties`
- Adição do H2 Database em memória
- Ativação do console H2
- Configuração do JPA/Hibernate

---

### 📂 Arquivos Alterados

- `src/main/resources/application.properties`

---

### 🧪 Como Testar

1. Execute a aplicação:
	 ```bash
	 mvn spring-boot:run
	 ```

---

### ☑️ Checklist

- [x] O código segue as diretrizes do projeto
- [x] Realizei uma auto-revisão do meu código
- [x] Documentei minhas alterações, se necessário
- [ ] Adicionei testes que cobrem minhas alterações (se aplicável)
- [x] Não quebrei funcionalidades existentes

---

### ℹ️ Informações adicionais

Inclua qualquer informação relevante ou contexto extra para o revisor, se necessário.