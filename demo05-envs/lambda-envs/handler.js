"use strict";
const settings = require("./config/settings");
const axios = require("axios");
const cheerio = require("cheerio");
const uuid = require("uuid");

class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
  }

  async insertItem(item) {
    return dynamoDB.put(item).promise();
  }

  prepareInsertItem(commitMessage) {
    return {
      TableName: settings.dbTableName,
      Item: {
        commitMessage,
        id: uuid.v1(),
        createdAt: new Date().toISOString(),
      },
    };
  }

  async extractCommitMessage(html) {
    const $ = cheerio.load(html);
    const [commitMessage] = await $("#content").text().trim().split("\n");
    return commitMessage;
  }

  async fetchApi() {
    return axios.get(settings.commitMessageUrl);
  }

  async main(event) {
    try {
      console.log(
        "Process started at",
        new Date().toISOString(),
        JSON.stringify(event, null, 2)
      );

      const { data } = await this.fetchApi();
      const rawMessage = await this.extractCommitMessage(data);
      const preparedMessage = this.prepareInsertItem(rawMessage);
      await this.insertItem(preparedMessage);

      console.log(
        "Process finished at",
        new Date().toISOString(),
        JSON.stringify(event, null, 2)
      );
      return {
        statusCode: 200,
      };
    } catch (error) {
      console.log("ERROR", error.stack);
      console.log(
        "Process finished at",
        new Date().toISOString(),
        JSON.stringify(event, null, 2)
      );
      return {
        statusCode: 500,
        body: error.message || "Internal Server Error",
      };
    }
  }
}

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const handler = new Handler({
  dynamoDbSvc: dynamoDB,
});

module.exports.scheduler = handler.main.bind(handler);
