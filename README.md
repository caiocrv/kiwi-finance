# Kiwi Finance API

![.NET 8](https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-ASP.NET_Core_Web_API-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/Entity_Framework_Core-8.0-6DB33F?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

API RESTful desenvolvida em **C# com .NET 8** para **gestão financeira pessoal**, com foco em **boas práticas de engenharia de software**, **arquitetura em camadas** e **separação de responsabilidades**.

> 💼 Projeto acadêmico voltado para o gerenciamento de receitas, despesas e emissão de saldo total por usuário autenticado.

## 1. Sobre o Projeto

O **Kiwi Finance API** é um backend RESTful criado para apoiar o controle financeiro pessoal. A aplicação permite o cadastro e autenticação de usuários, o registro de transações financeiras e a consolidação de um resumo com **total de receitas**, **total de despesas** e **saldo atual**.

O projeto foi estruturado com fins acadêmicos, priorizando organização, clareza arquitetural e boas práticas comuns em ambientes profissionais.

## 2. Arquitetura

O backend segue uma abordagem de **Arquitetura em Camadas (Clean Architecture / N-Tier)**, separando responsabilidades entre entrada HTTP, domínio, serviços e acesso a dados.

### Estrutura das Camadas

| Camada | Responsabilidade |
| --- | --- |
| `API` | Exposição dos endpoints, controllers e configuração da aplicação |
| `Core` | Entidades de domínio, contratos (interfaces) e DTOs |
| `Services` | Regras de negócio, autenticação e orquestração dos casos de uso |
| `Infrastructure` | Persistência, repositórios e contexto do banco com Entity Framework Core |

### Organizacao do Backend

```text
backend/
|-- KiwiFinance.API/             # Controllers, Program.cs e configuração da Web API
|-- KiwiFinance.Core/            # Entities, Interfaces e DTOs
|-- KiwiFinance.Services/        # Regras de negócio e autenticação JWT
|-- KiwiFinance.Infrastructure/  # Repositórios e DbContext
`-- KiwiFinance.sln              # Solução .NET
```

🏗️ Essa divisão facilita a manutenção, reduz acoplamento e torna a evolução do sistema mais previsível.

## 3. Tecnologias Utilizadas

- **C# com .NET 8** (`ASP.NET Core Web API`)
- **Entity Framework Core** como ORM
- **PostgreSQL** hospedado no **Supabase**
- **JWT (JSON Web Token)** para autenticação e autorização
- **BCrypt.Net-Next** para hash seguro de senhas
- **DotNetEnv** para carregamento de variáveis de ambiente via arquivo `.env`
- **Swagger / Swashbuckle** para documentação e teste dos endpoints

## 4. Principais Funcionalidades

- **Cadastro de usuários** com armazenamento de senha em hash utilizando `BCrypt`
- **Login de usuários** com emissão de token JWT
- **Registro de transações financeiras** do tipo receita ou despesa, vinculadas ao usuário e a uma categoria
- **Listagem de transações por usuário**
- **Resumo financeiro automático**, calculando:
  - total de receitas
  - total de despesas
  - saldo atual
- **Proteção de rotas sensíveis** com middleware de autenticação/autorização JWT
- **Documentação interativa com Swagger** para testes rápidos da API

## 5. Pre-requisitos

Antes de executar o projeto, tenha instalado na máquina:

- **.NET SDK 8.0**
- **Git**
- Uma IDE ou editor, como **Visual Studio**, **Visual Studio Code** ou similar
- Credenciais de acesso ao banco PostgreSQL no Supabase

## 6. Como Rodar o Projeto (Passo a Passo)

### 1. Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd kiwi-finance
```

### 2. Criar o arquivo `.env` na pasta da API

Entre na pasta da API:

```powershell
cd backend/KiwiFinance.API
```

Use o arquivo [`backend/.env.example`](./backend/.env.example) como base para criar o `.env` local:

```powershell
Copy-Item ..\.env.example .env
```

Depois, preencha as variáveis abaixo com os valores do seu ambiente:

```env
SUPABASE_CONNECTION=Host=db.xxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=SUA_SENHA_AQUI
JWT_SECRET=CHAVE_ALEATORIA_SEGURA
JWT_ISSUER=KiwiFinanceAPI
JWT_AUDIENCE=KiwiFinanceApp
```

### 3. Restaurar as dependências do projeto

```bash
dotnet restore
```

### 4. Iniciar o servidor da API

```bash
dotnet run
```

### 5. Acessar a documentacao Swagger

⚙️ Com a aplicação em execução, acesse:

```text
http://localhost:5000/swagger
```

Se a API iniciar em outra porta no seu ambiente, utilize a URL exibida no terminal pelo ASP.NET Core.


Desenvolvido para fins acadêmicos, com ênfase em arquitetura em camadas, autenticação segura e organização de backend em .NET.
