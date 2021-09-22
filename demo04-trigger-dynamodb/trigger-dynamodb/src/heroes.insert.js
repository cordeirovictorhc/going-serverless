const uuid = require("uuid");
const Joi = require("@hapi/joi");
const decoratorValidator = require("./util/decoratorValidator");

class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
    this.dynamodbTable = process.env.DYNAMODB_TABLE;
  }

  static validator() {
    return Joi.object({
      name: Joi.string().max(100).min(2).required(),
      power: Joi.string().max(20).required(),
    });
  }

  async insertItem(params) {
    return this.dynamoDbSvc.put(params).promise();
  }

  prepareData(data) {
    const params = {
      TableName: this.dynamodbTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString(),
      },
    };

    return params;
  }

  handleSuccess(data) {
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  }

  handleError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "Insert Error",
    };
  }

  async main(event) {
    try {
      const data = event.body;
      const dbParams = this.prepareData(data);

      await this.insertItem(dbParams);

      return this.handleSuccess(dbParams.Item);
    } catch (error) {
      console.log("ERROR:", error.stack);
      return this.handleError({ statusCode: 500 });
    }
  }
}

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const handler = new Handler({
  dynamoDbSvc: dynamoDB,
});

module.exports = decoratorValidator(
  handler.main.bind(handler), // fn
  Handler.validator(), // schema
  "body" // argsType
);
