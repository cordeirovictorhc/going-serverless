"use strict";

const { exec } = require("child_process");
const { promisify } = require("util");

const shell = promisify(exec);

const decoratorValidator = require("./util/decoratorValidator");
const globalEnum = require("./util/globalEnum");
const Joi = require("@hapi/joi");
const axios = require("axios");
const {
  promises: { writeFile, readFile, unlink },
} = require("fs");

class Handler {
  constructor() {}

  static validator() {
    return Joi.object({
      image: Joi.string().uri().required(),
      topText: Joi.string().max(200).required(),
      bottomText: Joi.string().max(200).optional(),
    });
  }

  static generateImagePath() {
    // AWS permite usar pasta /tmp para salvar arquivos temporariamente; será deletada após terminar a execução

    /* const isLocal = process.env.IS_LOCAL;
    return `${isLocal ? "" : "/tmp/"}${new Date().getTime()}-out.png`; */

    return `/tmp/${new Date().getTime()}-out.png`;
  }

  static async saveImageLocally(imageUrl, imagePath) {
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const buffer = Buffer.from(data, "base64"); // além de salvar local, torna possível analisar a imagem com o GM

    return writeFile(imagePath, buffer);
  }

  static generateIdentifyCommand(imagePath) {
    const value = `
    gm identify \
    -verbose \
    ${imagePath}
    `;

    const cmd = value.split("\n").join(" ");
    return cmd;
  }

  static async getImageSize(imagePath) {
    const cmd = Handler.generateIdentifyCommand(imagePath);

    const { stdout } = await shell(cmd);

    /* 
      se o indexOf retornar -1 o ~ converte ele para 0, e 0 em JavaScript também é false. Se retornar qualquer coisa diferente de -1 no nosso exemplo, ele dará true e entra no filtro corretamente.
          
      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT
    */

    const [line] = stdout
      .trim()
      .split("\n")
      .filter((text) => ~text.indexOf("Geometry"));

    const [width, height] = line.trim().replace("Geometry:", "").split("x");

    return {
      width: Number(width),
      height: Number(height),
    };
  }

  static setParameters(options, dimensions, imagePath) {
    return {
      topText: options.topText,
      bottomText: options.bottomText || "",
      font: __dirname + "./resources/impact.ttf",
      fontSize: dimensions.width / 8,
      fontFill: "#FFF",
      textPos: "center",
      strokeColor: "#000",
      strokeWeight: 1,
      padding: 40,
      imagePath,
    };
  }

  static setTextPosition(dimensions, padding) {
    const top = Math.abs(dimensions.height / 2.1 - padding) * -1;

    const bottom = dimensions.height / 2.1 - padding;

    return {
      top,
      bottom,
    };
  }

  static async generateConvertCommand(options, finalPath) {
    const value = `
      gm convert
      '${options.imagePath}'
      -font '${options.font}'
      -pointsize ${options.fontSize}
      -fill '${options.fontFill}'
      -stroke '${options.strokeColor}'
      -strokewidth ${options.strokeWeight}
      -draw 'gravity ${options.textPos} text 0,${options.top}  "${options.topText}"'
      -draw 'gravity ${options.textPos} text 0,${options.bottom}  "${options.bottomText}"'
      ${finalPath}
    `;

    const final = value.split("\n").join(" ");

    const { stdout } = await shell(final);

    return stdout;
  }

  static async generateBase64(imagePath) {
    return readFile(imagePath, "base64");
  }

  async main(event) {
    try {
      const options = event.queryStringParameters;

      console.log("Downloading image...");

      const imagePath = Handler.generateImagePath();
      await Handler.saveImageLocally(options.image, imagePath);

      console.log("Getting image size...");
      
      const dimensions = await Handler.getImageSize(imagePath);

      const params = Handler.setParameters(options, dimensions, imagePath);

      const { top, bottom } = Handler.setTextPosition(
        dimensions,
        params.padding
      );

      const finalPath = Handler.generateImagePath();

      console.log("Generating meme...");

      const cmd = await Handler.generateConvertCommand(
        {
          ...params,
          top,
          bottom,
        },
        finalPath
      );

      console.log("Generating Base64..."); // Base64 é o binário de uma imagem

      const imageBuffer = await Handler.generateBase64(finalPath);

      console.log("Almost there...");

      // remove os arquivos gerados; não é necessário pois estamos usando a pasta /tmp mas é uma boa prática
      await Promise.all([unlink(imagePath), unlink(finalPath)]);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: `<img src='data:image/jpeg;base64,${imageBuffer}'></img>`,
      };
    } catch (error) {
      console.error(error.stack);
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
  }
}

const handler = new Handler();

module.exports = {
  mememaker: decoratorValidator(
    handler.main.bind(handler),
    Handler.validator(),
    globalEnum.ARG_TYPE.QUERYSTRING
  ),
};

/* 
    
const response = await shell(
  "gm identify -verbose ./app/resources/homer.jpg"
);

console.log({ response.stdout }); 

// stdout = logs que aparecem no terminal
// stderr = erros que aparecem no terminal
// stdin = input do usuario no terminal

*/
