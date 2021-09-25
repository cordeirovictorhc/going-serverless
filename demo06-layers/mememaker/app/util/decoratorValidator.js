const decoratorValidator = (fn, schema, argsType) => {
  return async function (event) {
    // JSON.parse() só funciona para BODY

    const data =
      argsType === "body" ? JSON.parse(event[argsType]) : event[argsType];

    const { error, value } = await schema.validate(data, { abortEarly: false });

    event[argsType] = value;

    if (!error) return fn.apply(this, arguments);

    return {
      statusCode: 422,
      body: error.message,
    };
  };
};

module.exports = decoratorValidator;
