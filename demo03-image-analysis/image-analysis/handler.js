"use strict";
/* const {
  promises: { readFile },
} = require("fs"); */
const axios = require("axios");

class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  formatText(text, workingItems) {
    const prettyText = [];

    for (const name in text) {
      const label = text[name];
      const confidence = workingItems[name].Confidence;
      prettyText.push(`${confidence.toFixed(2)}% de chance de ser ${label}, `);
    }

    return prettyText.join("\n");
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "pt",
      Text: text,
    };

    const { TranslatedText } = await this.translatorSvc
      .translateText(params)
      .promise();

    return TranslatedText.split(" e ");
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc
      .detectLabels({
        Image: {
          Bytes: buffer,
        },
      })
      .promise();

    const workingItems = result.Labels.filter((label) => label.Confidence > 85);

    const names = workingItems.map((i) => i.Name).join(" and ");

    return { names, workingItems };
  }

  async getImageBuffer(imageUrl) {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "base64");

    return buffer;
  }

  async main(event) {
    try {
      // const imgBuffer = await readFile("./images/cat.jpeg");
      const { imageUrl } = event.queryStringParameters;

      console.log("Downloading image...");
      const buffer = await this.getImageBuffer(imageUrl);

      console.log("Detecting labels...");
      const { names, workingItems } = await this.detectImageLabels(buffer);

      console.log("Translating...");
      const translated = await this.translateText(names);

      console.log("Handling final object...");
      const response = this.formatText(translated, workingItems);

      return {
        statusCode: 200,
        body: `À imagem tem\n ${response}`,
      };
    } catch (error) {
      console.log("ERROR:", error.stack);
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
  }
}

// factory
const aws = require("aws-sdk");

const reko = new aws.Rekognition();
const translator = new aws.Translate();

const handler = new Handler({
  rekoSvc: reko,
  translatorSvc: translator,
});

// O contexto de this pode ser alterado dependendo de quem está chamando a função main, usamos o bind para garantir que serão usados os métodos da nova instância
module.exports.main = handler.main.bind(handler);
