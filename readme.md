# Serverless com AWS

- Não usar sua conta root para desenvolvimento pois tem acesso a tudo; criar subcontas usando **IAM**

## Limitações e Preços

- **Dependências**
  - Nem sempre seu ambiente local é igual ao ambiente de produção (AWS)
  - [AWS Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- **Idle Timeout / Cold Start**
  - VPC pode aumentar o tempo de Cold Start
  - O preço aumenta de acordo com o tempo de utilização de cada requisição (recomendado máx 10s cada)
  - [Cold Starts in AWS Lambda](https://mikhail.io/serverless/coldstarts/aws/)

# S3

Serviço de armazenamento

## Comandos

- `aws s3 ls [NOME DO BUCKET]`
  - Mostra o que tem dentro de um bucket
- `aws s3 cp [ARQUIVO] s3://[NOME DO BUCKET]`
  - Faz upload de arquivo em um bucket

# Lambda

Serviço para rodar aplicações serverless

- Ver alguns exemplos de utilização em `demo01.../run.sh`

# Serverless Framework

Serviço estável para trabalhar com multinuvens na AWS

- [Serverless Framework](https://www.serverless.com/)
- Ver alguns exemplos de utilização em `demo02.../run.sh`

## Demo03: Analizando imagens com Amazon Rekognition

- Iniciar serviço e instalar AWS SDK

```(bash)
npm init -y
npm i aws-sdk
```

- Invoke simulando request com arquivo local:
  - `sls invoke local -f img-analysis --path request.json`
- [Serverless Yaml Docs](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/)

## Demo05: Trabalhando com Multi-environments e schedulers (cron jobs)

- Invoke com opção de ambiente:
  - `sls invoke local -f commit-message-scheduler -s prod`

## Demo07.1: Tooling

- **Plugins**

  - [serverless-offline](https://www.npmjs.com/package/serverless-offline)
  - [serverless-mocha-plugin](https://www.npmjs.com/package/serverless-mocha-plugin)
    - Cria boilerplate de teste da função automaticamente
      - `sls create test -f hello`

# AWS Lambda Layers

- Executar nossos apps no runtime da AWS Lambda
- Ao criar um pacote especializado NodeJS, ele precisa estar dentro de uma pasta nodejs e lá estarão todas as dependências necessárias em outras lambdas
- Não é uma boa prática fazer deploy da layer e da aplicação ao mesmo tempo
- [AWS Layers prontas para uso](https://github.com/mthenw/awesome-layers)

- Invoke com Docker simulando ambiente AWS:
  - `sls invoke local --docker -f hello`
  - Necessário ter Docker instalado
- Ver exemplos de utilização em `demo06/`

# LocalStack

- [Cheat Sheet](https://lobster1234.github.io/2017/04/05/working-with-localstack-command-line/)
- `docker-compose up -d localstack`
- `docker logs CONTAINER_ID -f`
- `docker-compose up --build app`
