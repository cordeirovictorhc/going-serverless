# Serverless com AWS

# Boas Práticas

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

- Ver alguns comandos em `demo01.../run.sh`
