<h1 id="header" align="center">Very Useful Tools to Remember API</h1>
<p align="center">Very Useful Tools to Remember (VUTTR) - API simples para gerenciar um repositório de ferramentas com seus respectivos nomes, links, descrições e tags</p>

## Checklist da aplicação

Features implementadas e as que ficaram faltando para a "primeira entrega"

* [ ] Testes de integração
* [x] Testes de end-to-end
* [x] API HTTP REST
* [ ] AWS Cognito
* [x] AWS Lambda
* [x] AWS API Gateway
* [x] AWS DynamoDB
* [ ] Paginação
* [x] Executar o API Gateway e o Lambda Offline (melhor para a produtividade)
* [ ] Ligar Serverless com o DynamoDB local para evitar sujar (nos testes) o banco de dados implantado na cloud
* [x] Segregação de responsabilidades com Middy Framework
* [x] Serverless Framework
* [x] Validação de entradas com Zod
* [x] Tratamento de erros HTTP personalizado
* [x] Hexagonal Architecture
* [x] Repository Pattern
* [x] Documentação com OpenAPI (Swagger)
* [x] Migrations e Seeds

## Começando

#### Primeiros passos

~~~sh
# baixe o repositório do projeto
git clone https://github.com/marcusviniciusfa/very-useful-tools-to-remember.git
~~~

Instale as dependências com `npm install`

#### Deploy

Faça o deploy na AWS

~~~sh
# novos deploys não atualizam variáveis de ambiente geradas no primeiro deploy
npm run deploy

# após destruir a aplicação implantada um novo deploy irá gerar novas variáveis de ambiente
npm run destroy
~~~

#### Setup das variáveis de ambiente

Faça o setup das variáveis de ambiente que faltam. Ao fazer um primeiro deploy algumas variáveis de ambiente serão novas. Para lidar com isso de forma automatizada, basta executar o script abaixo para criar/modificar no arquivo de variáveis de ambiente (`.env.{stage}`). Esse script também modifica uma variável de ambiente no `swagger.json`.

~~~sh
npm run setup_envs
~~~

## Swagger

#### Servidor com Docker

~~~sh
# execute o container para servir a documentação
docker compose up
~~~

Todos os recursos da API estão documentados com o OpenAPI 3.0

Após [inserir as variáveis de ambiente](#inserir-variáveis-de-ambiente) procure no arquivo `.env.{stage}` na raiz do projeto e copie o valor da variável `AWS_API_GATEWAY_HTTP_BASE_URL`. Acesse a documentação e insira o valor no campo que possui o mesmo nome da variável.

http://localhost:8080/api/docs

## Testes

#### Integração

Nesta aplicação, os testes de integração verificam os casos de uso, que interagem com o domínio. Eles fazem uso de Stubs, Fakes (com inversão de dependência) e Spies para remover dependências.

~~~sh
npm run test:integration
~~~

#### End-to-end

Os testes end-to-end simulam o uso da API de ponta a ponta, fazendo as solicitações ao API Gateway e verificam o retorno. A tabela utilizado no Banco de Dados (DynamoDB) é preenchida e limpa por cada caso de teste, mantendo os testes isolados uns dos outros (o que evita que um teste influencie no resultado de outro).

~~~sh
# execute o api gateway e o lambda function offline
npm run start

# execute os testes na aplicação offline
# para executar os testes na aplicação online basta mudar a variável de ambiente no arquivo de testes
npm run test:e2e
~~~

## CLI para migrations

#### Criar tabela de tools

~~~sh
npm run migrations --create-table
~~~

#### Deletar tabela de tools

~~~sh
npm run migrations --delete-table
~~~

#### Inserir tools (seeds)

~~~sh
npm run migrations --insert-tools
~~~

#### Deletar tools (todos)

~~~sh
npm run migrations --delete-tools
~~~
