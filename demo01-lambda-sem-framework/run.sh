# 1º passo: Criar arquivos de políticas de segurança (https://docs.aws.amazon.com/pt_br/lambda/latest/dg/access-control-resource-based.html)
# 2º passo: Criar "roles" de segurança usando o IAM

# Cria IAM role
aws iam create-role \
  --role-name lambda-exemplo \
  --assume-role-policy-document file://./policy.json \
  | tee logs/role.log

# 3º passo: Criar arquivo com conteúdo e zipá-lo
zip function.zip index.js

# Criar Lambda function
# Role = Arn gerado no log de criação da role
aws lambda create-function \
  --function-name hello-cli \
  --zip-file fileb://./function.zip \
  --handler index.handler \
  --runtime nodejs12.x \
  --role arn:aws:iam::632432874210:role/lambda-exemplo \
  | tee logs/lambda-create.log

# 4º passo: Simular evento e executar lambda
aws lambda invoke \
  --function-name hello-cli \
  --log-type Tail \
  logs/lambda-exec.log

# Fez alguma alteração? Zipar de novo!

# Atualizar Lambda
aws lambda update-function-code \
  --zip-file fileb://./function.zip \
  --function-name hello-cli \
  --publish \
  | tee logs/lambda-update.log

# Executar e ver novo resultado

# Remover
aws lambda delete-function \
  --function-name hello-cli

aws iam delete-role \
  --role-name lambda-exemplo