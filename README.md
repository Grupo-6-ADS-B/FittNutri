# **FittNutri - Software para nutricionistas**

**💻 Sobre o Projeto**


A FittNutri é uma plataforma digital desenvolvida para revolucionar a forma como nutricionistas e pacientes interagem. Nossa missão é oferecer uma solução completa e gratuita que unifique todas as ferramentas essenciais para a prática clínica, eliminando a necessidade de múltiplos softwares pagos.

Com a FittNutri, você pode gerenciar consultas, acompanhar a evolução de pacientes, gerar relatórios visuais e manter uma comunicação contínua, tudo em um único lugar.

**💡 Motivação**

O mercado de saúde e bem-estar no Brasil está em plena expansão, mas os profissionais de nutrição, apesar de altamente qualificados, ainda enfrentam o desafio da fragmentação de ferramentas digitais. Eles precisam lidar com diversos softwares caros e desintegrados, o que compromete a produtividade e torna o trabalho inviável para muitos.


A FittNutri surge como uma resposta a esse problema. Em um cenário onde 73,2% dos nutricionistas ganham entre 1 e 5 salários mínimos, o custo de múltiplas licenças de software (que podem custar, em média, R$ 800 por ano cada) é um obstáculo real. Inspirados pelo crescimento das healthtechs no Brasil, criamos uma plataforma que não apenas integra funcionalidades, mas também democratiza o acesso à tecnologia, permitindo que os profissionais foquem no que realmente importa: o atendimento humanizado e eficiente de seus pacientes.

---

**💻 Tecnologias Utilizadas**

- **Frontend:** React, Html, css, javaScript;
- **Backend:** Node.js, Java;
- **Banco de Dados:** MySQL, MongoDB;
- **Outros:** Docker, AWS;
---

**🚀 Como Rodar o Projeto**

Siga estes passos para configurar e executar a aplicação em seu ambiente local.

**📋 Pré-requisitos**

Certifique-se de que você tem os seguintes softwares instalados:

- Node.js (versão 18.x ou superior)
- npm (versão 9.x ou superior)
- Git instalado

---

**⚙️ Instalação e Execução**

1. **Clone o repositório:**

```bash
git clone https://github.com/Grupo-6-ADS-B/Jane-Nutri.git
cd FittNutri
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto e adicione as variáveis necessárias (exemplo):

```env
# Variáveis de ambiente
DATABASE_URL="postgres://user:password@localhost:5432/FittNutri"
API_KEY="sua_chave_de_api"
```

4. **Execute as migrações do banco de dados (se aplicável):**

```bash
npx prisma migrate dev --name init
```

5. **Inicie o servidor local:**

```bash
npm run dev
```

O projeto estará disponível em http://localhost:5173.

---

Este projeto está sob a licença MIT.

---

**✉️ Contato**

Se você tiver alguma dúvida, entre em contato com **FittNutri** em [Fitnutri@gmail.com].

---

> Você pode adaptar as seções de "Tecnologias Utilizadas", "Como Rodar o Projeto" e "Contribuição" com as informações técnicas específicas do seu projeto.
