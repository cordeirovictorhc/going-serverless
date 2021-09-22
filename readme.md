# Serverless com AWS

## Limitações e Preços

- **Dependências**
  - Nem sempre seu ambiente local é igual ao ambiente de produção (AWS)
  - [AWS Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- **Idle Timeout / Cold Start**
  - VPC pode aumentar o tempo de Cold Start
  - O preço aumenta de acordo com o tempo de utilização de cada requisição (recomendado máx 10s cada)
  - [Cold Starts in AWS Lambda](https://mikhail.io/serverless/coldstarts/aws/)

## Boas Práticas

- Não usar sua conta root para desenvolvimento pois tem acesso a tudo; criar subcontas usando **IAM**

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
