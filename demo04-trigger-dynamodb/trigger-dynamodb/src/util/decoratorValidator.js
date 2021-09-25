// fn = função que vai ser executada depois do decorator
// schema = qual o tipo do schema? (Joi Schema)
// argsType = o que você quer validar? body, queryStringParameters, headers, etc

const decoratorValidator = (fn, schema, argsType) => {
  return async function (event) {
    const data = JSON.parse(event[argsType]);

    // abort early: false = mostrar todos os erros juntos
    const { error, value } = await schema.validate(data, {
      abortEarly: false,
    });

    // atualiza a instancia de arguments
    event[argsType] = value;

    // next
    if (!error) return fn.apply(this, arguments);

    return {
      statusCode: 422, // unprocessable entity
      body: error.message,
    };
  };
};

module.exports = decoratorValidator;
