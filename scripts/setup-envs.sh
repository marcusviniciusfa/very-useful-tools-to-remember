#!/bin/bash

API_GATEWAY="AWS_API_GATEWAY_HTTP_BASE_URL"
DYNAMODB="AWS_DYNAMODB_TABLE_NAME"
SWAGGER_PATH="./docker/swagger"
SWAGGER_FILE="swagger.json"
BACKUP_SWAGGER_FILE="swagger.bkp.json"

BACKUP_ENV_FILE=$(grep -v -e $API_GATEWAY -e $DYNAMODB .env.dev)

rm .env.dev

for env in $BACKUP_ENV_FILE
do
  echo $env >> .env.dev
done

BASE_URL=$(npx serverless info --verbose | grep "HttpApiUrl" | tr -d [:space:] | cut -f 2- -d ":")
TABLE_NAME=$(npx serverless print | grep "AWS_DYNAMODB_TABLE_NAME" | tr -d [:space:] | cut -f 2- -d ":")

mv $SWAGGER_PATH/$SWAGGER_FILE $SWAGGER_PATH/$BACKUP_SWAGGER_FILE
sed -E "s#\"{API_GATEWAY_HTTP_BASE_URL}\"|\"https://.*\.execute-api\.us-east-1\.amazonaws\.com\"#\"$BASE_URL\"#" $SWAGGER_PATH/$BACKUP_SWAGGER_FILE > $SWAGGER_PATH/$SWAGGER_FILE
rm $SWAGGER_PATH/$BACKUP_SWAGGER_FILE

echo -e "$API_GATEWAY=\"$BASE_URL\"\n$DYNAMODB=\"$TABLE_NAME\"" >> .env.dev

echo "successful environment variable setup! 🎉"
