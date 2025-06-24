# **Documento de Requisitos: Sistema de Envio de Documentos Fiscais**

Versão: 1.1  
Data: 06/06/2025

## **Histórico de Revisões**

| Versão | Data | Autor | Descrição |
| ------ | ---- | ----- | --------- |
| 1.0 | 06/06/2025 | Ronaldo Junior | Documento inicial focado no fluxo de envio de e-mail |
| 1.1 | 06/06/2025 | Ronaldo Junior | Escopo expandido e adição de RNs e RNFs |

## **Índice**

1. [Introdução](#1-propósito)  
   1.1. [Propósito](#11-propósito)   
   1.2. [Público-alvo](#12-público-alvo)    
   1.3. [Escopo](#13-escopo)  
2. [Visão Geral do Produto](#2-visão-geral-do-produto)  
3. [Requisitos Funcionais](#3-requisitos-funcionais)    
   3.1. [Autenticação](#31-autenticação)       
   3.2. [Gerenciamento de Clientes](#32-gerenciamento-de-clientes)    
   3.3. [Envio de E-mail](#33-envio-de-e-mail)
4. [Regras de Negócio](#4-regras-de-negócio)  
5. [Requisitos Não Funcionais](#5-requisitos-não-funcionais)

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

## **3. Requisitos Funcionais**

### **3.1 Autenticação**

- [ ] **RF-12**: O sistema deve permitir que um novo usuário se cadastre fornecendo nome, email e senha.
- [ ] **RF-13**: O sistema deve permitir que um usuário existente faça login utilizando email e senha.
- [ ] **RF-14**: Após um login ou cadastro bem-sucedido, o sistema deve gerar e retornar um token de acesso (JWT) para autenticar as requisições subsequentes.

### **3.2 Gerenciamento de Clientes**

- [ ] **RF-15**: O sistema deve permitir que um usuário autenticado cadastre um novo cliente, fornecendo os seguintes atributos:
  - Cliente: nome, CNPJ.
  - Contador: nome do contador, email do contador.
- [ ] **RF-16**: O sistema deve permitir que o usuário visualize uma lista de todos os clientes que ele cadastrou.
- [ ] **RF-17**: O sistema deve permitir que o usuário edite as informações de um cliente ou contador existente.
- [ ] **RF-18**: O sistema deve permitir que o usuário remova o cadastro de um cliente.

### **3.3 Envio de E-mail**

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

## **4. Regras de Negócio**

* [x] **RN-01:** O arquivo anexado pelo usuário **deve**, obrigatoriamente, estar no formato **.zip**. O sistema deve validar a extensão do arquivo e rejeitar formatos diferentes.  
* [x] **RN-02:** O assunto do e-mail **deve** seguir o padrão: "Arquivos fiscais de '[nome do cliente]' ('[cnpj]') referente ao mês '[mês referente]'".  
* [ ] **RN-03:** O arquivo .zip anexado ao e-mail **deve** ser renomeado para o formato: "arquivos fiscais '[cliente]' do mês de '[mês referente]'.zip".  
* [ ] **RN-04:** É obrigatório selecionar um cliente da lista para que o envio do e-mail seja habilitado.  
* [ ] **RN-05:** Todo cliente cadastrado **deve** possuir um contador com um endereço de e-mail válido para ser o destinatário.  
* [ ] **RN-06:** O processo de envio só pode ser iniciado se houver um arquivo válido (.zip) anexado e um cliente selecionado.  
* [ ] **RN-07:** Os arquivos armazenados temporariamente para envio (mencionando S3/Tebi.io) **devem** ser excluídos permanentemente após 3 dias.  
* [ ] **RN-08:** O campo de mês de referência deve ser preenchido automaticamente com o mês anterior à data atual, mas **deve** permitir a alteração pelo usuário.  
* [ ] **RN-09:** Um usuário só poderá visualizar o histórico dos **seus próprios** envios.  
* [ ] **RN-10:** Na tela de envio, o usuário só poderá selecionar clientes que ele mesmo cadastrou.

## **5. Requisitos Não Funcionais**

* [ ] **RNF-01 (Desempenho):** O upload do arquivo e o disparo do e-mail devem ser concluídos em um tempo de resposta rápido, idealmente em menos de 5 segundos sob condições normais de rede.  
* [ ] **RNF-02 (Usabilidade):** A interface para anexar arquivos e selecionar clientes deve ser clara e intuitiva, minimizando a chance de erro do usuário.  
* [ ] **RNF-03 (Confiabilidade):** O sistema deve garantir a entrega dos e-mails utilizando um serviço externo confiável (como o Resend). Falhas na comunicação com o serviço devem ser tratadas de forma elegante, sem perda de dados.  
* [ ] **RNF-04 (Segurança):** Os arquivos fiscais anexados devem ser tratados de forma segura, com armazenamento temporário e exclusão automática após o período definido. O acesso à funcionalidade de envio deve ser restrito a usuários autenticados.  
* [ ] **RNF-05 (Disponibilidade):** O serviço de envio de e-mail deve estar disponível 99.9% do tempo.  
* [ ] **RNF-06 (Comunicação):** As notificações de sucesso e falha para o usuário devem ser exibidas em tempo real (via Socket.IO, conforme sugerido no diagrama), sem a necessidade de recarregar a página.