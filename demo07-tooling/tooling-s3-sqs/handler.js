"use strict";

const AWS = require("aws-sdk");

const host = process.env.LOCALSTACK_HOSTNAME || "localhost";
const edgePort = process.env.EDGE_PORT || "4566";

const s3config = {
  s3ForcePathStyle: true,
  endpoint: `http://${host}:${edgePort}`,
  accessKeyId: process.env.AWS_ACCESS_KEY || "test",
  secretAccessKey: process.env.AWS_SECRET_KEY || "test",
};

const S3 = new AWS.S3(s3config);

module.exports.hello = async (event) => {
  try {
    const allBuckets = await S3.listBuckets().promise();
    console.log("allBuckets", allBuckets);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          allBuckets,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.error("ERROR", error.stack);
    return {
      statusCode: 200,
      body: error.message || "Internal Server Error",
    };
  }
};
