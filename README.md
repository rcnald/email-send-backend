# **Documento de Requisitos: Sistema de Envio de Documentos Fiscais**

Versão: 1.4  
Data: 23/07/2025

## **Histórico de Revisões**

| Versão | Data | Autor | Descrição |
| ------ | ---- | ----- | --------- |
| 1.0 | 06/06/2025 | Ronaldo Junior | Documento inicial focado no fluxo de envio de e-mail |
| 1.1 | 06/06/2025 | Ronaldo Junior | Escopo expandido e adição de RNs e RNFs |
| 1.3 | 11/06/2025 | Ronaldo Junior | Atualização dos Requisitos Funcionais e Regras de Negócio |
| 1.4 | 23/07/2025 | Ronaldo Junior | Reestruturação do documento: merge com documentação técnica, reorganização das seções para melhor experiência do desenvolvedor, padronização de comandos e configurações |

## **Índice**

1. [Introdução](#1-introdução)  
   1.1. [Propósito](#11-propósito)   
   1.2. [Público-alvo](#12-público-alvo)    
   1.3. [Escopo](#13-escopo)  
2. [Visão Geral do Produto](#2-visão-geral-do-produto)  
3. [Arquitetura e Tecnologias](#3-arquitetura-e-tecnologias)  
4. [Setup e Desenvolvimento](#4-setup-e-desenvolvimento)  
5. [Requisitos Funcionais](#5-requisitos-funcionais)    
   5.1. [Autenticação](#51-autenticação)       
   5.2. [Gerenciamento de Clientes](#52-gerenciamento-de-clientes)    
   5.3. [Envio de E-mail](#53-envio-de-e-mail)
6. [Regras de Negócio](#6-regras-de-negócio)  
7. [Requisitos Não Funcionais](#7-requisitos-não-funcionais)
8. [Estrutura do Projeto](#8-estrutura-do-projeto)
9. [Configuração Detalhada](#9-configuração-detalhada)  
   9.1. [Docker Services](#91-docker-services)  
   9.2. [Variáveis de Ambiente](#92-variáveis-de-ambiente)  
   9.3. [Comandos de Desenvolvimento](#93-comandos-de-desenvolvimento)  
10. [Deploy](#10-deploy)

## **1. Introdução**

### **1.1 Propósito**

Este documento especifica os requisitos para o Sistema de Envio de Documentos Fiscais. Seu propósito é detalhar as funcionalidades, regras e características técnicas necessárias para que a equipe de desenvolvimento possa projetar, implementar e testar a solução de forma eficaz.

### **1.2 Público-alvo**

Este documento destina-se aos desenvolvedores, arquitetos de software e stakeholders do projeto, servindo como a fonte principal de verdade para o escopo e o comportamento esperado do sistema.

### **1.3 Escopo**

O escopo do projeto abrange o desenvolvimento de uma plataforma completa que inclui:

* **Autenticação de Usuários:** Permitir que usuários se cadastrem e façam login no sistema.  
* **Gerenciamento de Clientes:** Permitir que usuários autenticados cadastrem seus clientes e os respectivos contadores.  
* **Envio de E-mails:** Orquestrar o fluxo de anexo de documentos fiscais, composição e envio de e-mails para os contadores, com tratamento de sucesso e falha.

## **2. Visão Geral do Produto**

O sistema é uma plataforma web projetada para otimizar o processo de envio de documentos fiscais. Usuários poderão se cadastrar, gerenciar uma base de clientes e contadores, e então utilizar a ferramenta principal para enviar arquivos .zip de forma padronizada e automatizada. O sistema notificará o usuário em tempo real sobre o status de cada envio, garantindo transparência e confiabilidade no processo.

Desenvolvido com **Clean Architecture** e **DDD**, organizando o código em camadas: domínio (entidades + regras), aplicação (use cases) e infraestrutura (implementações). Utiliza padrões como **Repository**, **Dependency Injection** e **Factory**, com sistema robusto de tratamento de erros via tuplas `[error, result, warning]`.

## **3. Arquitetura e Tecnologias**

- **[Node.js](https://nodejs.org)** + **[TypeScript](https://typescriptlang.org)** - Runtime e tipagem estática
- **[Express](https://expressjs.com)** - Framework web minimalista
- **[Prisma](https://prisma.io)** - ORM moderno com type-safety
- **[PostgreSQL](https://postgresql.org)** - Banco de dados relacional
- **[MinIO](https://min.io)** - Storage S3-compatible (desenvolvimento)
- **[Tebi.io](https://tebi.io)** - S3-compatible storage (produção)
- **[Resend](https://resend.com)** - Serviço de email transacional
- **[Vitest](https://vitest.dev)** - Framework de testes rápido
- **[Zod](https://zod.dev)** - Validação de schemas TypeScript-first
- **[Swagger/OpenAPI](https://swagger.io)** - Documentação interativa da API
- **[Scalar](https://scalar.com)** - Interface moderna para documentação API

## **4. Setup e Desenvolvimento**

**Pré-requisitos:** [Node.js 18+](https://nodejs.org) e [Docker](https://docker.com) instalados no sistema.

### **1. Clone o repositório:**
```bash
git clone https://github.com/rcnald/email-send-backend
```

### **2. Acesse a pasta do projeto:**
```bash
cd email-send-backend
```

### **3. Instale as dependências:**
```bash
yarn install
# ou
npm install
```

### **4. Configure o ambiente:**
Crie um arquivo `.env` na raiz do projeto e configure as variáveis com base no `.env.example`. Emails só serão enviados quando `ENVIRONMENT=production`.

### **5. Inicialize os serviços:**
```bash
yarn setup
# ou
npm run setup
```

### **6. Inicie o servidor:**
```bash
yarn dev
# ou
npm run dev
```

A aplicação estará disponível em: [http://localhost:3333](http://localhost:3333)

## **5. Requisitos Funcionais**

### **5.1 Autenticação**

- [ ] **RF-12**: O sistema deve permitir que um novo usuário se cadastre fornecendo nome, email e senha.
- [ ] **RF-13**: O sistema deve permitir que um usuário existente faça login utilizando email e senha.
- [ ] **RF-14**: Após um login ou cadastro bem-sucedido, o sistema deve gerar e retornar um token de acesso (JWT) para autenticar as requisições subsequentes.

### **5.2 Gerenciamento de Clientes**

- [ ] **RF-15**: O sistema deve permitir que um usuário autenticado cadastre um novo cliente, fornecendo os seguintes atributos:
  - Cliente: nome, CNPJ.
  - Contador: nome do contador, email do contador.
- [x] **RF-16**: O sistema deve permitir que o usuário visualize uma lista de todos os clientes que ele cadastrou.
- [ ] **RF-17**: O sistema deve permitir que o usuário edite as informações de um cliente ou contador existente.
- [ ] **RF-18**: O sistema deve permitir que o usuário remova o cadastro de um cliente.

### **5.3 Envio de E-mail**

- [ ] **RF-01:** O sistema deve permitir que o usuário autenticado anexe um ou mais arquivos para envio.  
- [ ] **RF-02:** O sistema deve permitir que o usuário selecione um cliente (previamente cadastrado) para associar ao envio dos arquivos.  
- [ ] **RF-03:** Após a seleção do cliente, o sistema deve exibir automaticamente o e-mail do contador associado a ele.  
- [ ] **RF-04:** O sistema deve permitir que o usuário especifique o mês de referência dos documentos fiscais.  
- [ ] **RF-05:** O sistema deve permitir que o usuário envie os dados para o sistema enviar o  e-mail para o contador do cliente selecionado.  
- [ ] **RF-06:** O sistema deve permitir que o usuário salve um envio preparado como "standby" (rascunho) para enviar posteriormente.  
- [ ] **RF-07:** O sistema deve notificar o usuário com uma mensagem de confirmação instantânea (toast) após o disparo bem-sucedido do e-mail.  
- [ ] **RF-08:** O sistema deve exibir uma notificação detalhada ao usuário (via Socket.IO ou HTTP) informando o sucesso do envio e para qual destinatário foi enviado.  
- [ ] **RF-09:** Em caso de falha no envio, o sistema deve notificar o usuário, informando o motivo da falha.  
- [ ] **RF-10:** Se uma falha de envio persistir, o sistema deve sugerir o envio manual e fornecer um template de e-mail (com assunto e corpo) para o usuário copiar.  
- [ ] **RF-11:** O sistema deve manter um histórico de envios com seus respectivos status (ex: enviado, falhou, pendente, etc.).

## **6. Regras de Negócio**

* [x] **RN-01:** O arquivo anexado pelo usuário **deve**, obrigatoriamente, estar no formato **.zip**. O sistema deve validar a extensão do arquivo e rejeitar formatos diferentes.  
* [x] **RN-02:** O assunto do e-mail **deve** seguir o padrão: "Arquivos fiscais de '[nome do cliente]' ('[cnpj]') referente ao mês '[mês referente]'".  
* [x] **RN-03:** O arquivo .zip anexado ao e-mail **deve** ser renomeado para o formato: "arquivos-fiscais-[cliente]-do-mes-de-[mês referente]'.zip".  
* [ ] **RN-04:** É obrigatório selecionar um cliente da lista para que o envio do e-mail seja habilitado.  
* [x] **RN-05:** Todo cliente cadastrado **deve** possuir um contador com um endereço de e-mail válido para ser o destinatário.  
* [x] **RN-06:** O processo de envio só pode ser iniciado se houver um arquivo válido (.zip) anexado e um cliente selecionado.  
* [x] **RN-07:** Os arquivos armazenados temporariamente para envio (mencionando S3/Tebi.io) **devem** ser excluídos permanentemente após 3 dias.  
* [x] **RN-08:** O campo de mês de referência deve ser preenchido automaticamente com o mês anterior à data atual, mas **deve** permitir a alteração pelo usuário.  
* [ ] **RN-09:** Um usuário só poderá visualizar o histórico dos **seus próprios** envios.  
* [ ] **RN-10:** Na tela de envio, o usuário só poderá selecionar clientes que ele mesmo cadastrou.

## **7. Requisitos Não Funcionais**

* [ ] **RNF-01 (Desempenho):** O upload do arquivo e o disparo do e-mail devem ser concluídos em um tempo de resposta rápido, idealmente em menos de 5 segundos sob condições normais de rede.  
* [ ] **RNF-02 (Usabilidade):** A interface para anexar arquivos e selecionar clientes deve ser clara e intuitiva, minimizando a chance de erro do usuário.  
* [ ] **RNF-03 (Confiabilidade):** O sistema deve garantir a entrega dos e-mails utilizando um serviço externo confiável (como o Resend). Falhas na comunicação com o serviço devem ser tratadas de forma elegante, sem perda de dados.  
* [ ] **RNF-04 (Segurança):** Os arquivos fiscais anexados devem ser tratados de forma segura, com armazenamento temporário e exclusão automática após o período definido. O acesso à funcionalidade de envio deve ser restrito a usuários autenticados.  
* [ ] **RNF-05 (Disponibilidade):** O serviço de envio de e-mail deve estar disponível 99.9% do tempo.  
* [ ] **RNF-06 (Comunicação):** As notificações de sucesso e falha para o usuário devem ser exibidas em tempo real (via Socket.IO, conforme sugerido no diagrama), sem a necessidade de recarregar a página.

## **8. Estrutura do Projeto**

```
src/
├── core/                   # Tipos e utilitários base
├── domain/
│   ├── enterprise/         # Entidades e value objects
│   └── application/        # Use cases e interfaces
├── infra/
│   ├── database/          # Prisma e repositórios
│   ├── http/              # Controllers e rotas
│   ├── storage/           # Implementação S3
│   └── lib/               # Clientes externos
test/                      # Utilitários de teste
```

## **9. Configuração Detalhada**

### **9.1 Docker Services**
```yaml
# PostgreSQL - Banco de dados principal
- Porta: 5432
- User: docker
- Password: docker
- Database: email-send

# MinIO - S3-compatible storage
- API: http://localhost:9000
- Console: http://localhost:9001
- User: testuser
- Password: testpassword
```

### **9.2 Variáveis de Ambiente**
```bash
DATABASE_URL="postgresql://docker:docker@localhost:5432/email-send"

S3_URL="http://localhost:9000"
S3_BUCKET="attachments"
S3_ACCESS_KEY_ID="testuser"
S3_SECRET_KEY="testpassword"
S3_REGION="us-east-1"

ENVIRONMENT="development"  # development | test | production

RESEND_API_KEY="your-resend-key"  # Obrigatório apenas para production
```

### **9.3 Comandos de Desenvolvimento**

#### **Testes**

**1. Executar testes unitários:**
```bash
yarn test
# ou
npm test
```

**2. Executar testes E2E:**
```bash
yarn test:e2e
# ou
npm run test:e2e
```

**3. Executar linting:**
```bash
yarn lint
# ou
npm run lint
```

#### **Estrutura de Testes**
```
test/
├── in-memory-repositories/    # Repositórios fake
├── email/                     # Email sender fake
├── storage/                   # Storage fake
└── setup-test-environment.ts  # Setup de DI para testes
```

## **10. Deploy**

### **Comportamento por Ambiente**

**Desenvolvimento e Teste:**
```bash
ENVIRONMENT=development
```
Emails são simulados (fake sender) - não envia emails reais.

**Produção:**
```bash
ENVIRONMENT=production
```
Emails são enviados via Resend API.

### **Configuração de Produção**

**1. Defina o ambiente:**
```bash
ENVIRONMENT=production
```

**2. Configure o banco de dados:**
```bash
DATABASE_URL=<prod-database-url>
```

**3. Configure o storage S3:**
```bash
S3_URL=<prod-s3-endpoint>
S3_BUCKET=<prod-bucket>
S3_ACCESS_KEY_ID=<prod-access-key>
S3_SECRET_KEY=<prod-secret-key>
S3_REGION="global"
```

**4. Configure o serviço de email:**
```bash
RESEND_API_KEY=<prod-resend-key>
```
⚠️ **Obrigatório para production**

### **Build e Deploy**

**1. Build da aplicação:**
```bash
yarn build
# ou
npm run build
```

**2. Inicie o servidor:**
```bash
yarn start
# ou
npm start
```

---

