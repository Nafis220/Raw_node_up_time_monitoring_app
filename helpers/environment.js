//* module scaffolding
const environment = {};

environment.staging = {
  port: 3000,
  env: "staging",
  twilio: {
    accountSid: "AC4c964d143377125d2447211278fd7a2e",
    authToken: "da0c752138e8be5c5bd36f222fee3761",
    MyNumber: "17623394381",
  },
};
environment.production = {
  port: 5000,
  env: "production",
  twilio: {
    accountSid: "AC4c964d143377125d2447211278fd7a2e",
    authToken: "da0c752138e8be5c5bd36f222fee3761",
    MyNumber: "17623394381",
  },
};

//*determine which environment was passed
chosenEnvironment = typeof (process.env.NODE_ENV === "string")
  ? process.env.NODE_ENV
  : "staging";
//* export correspondent environment object properties to the index
environmentProperties =
  typeof environment[chosenEnvironment] === "object"
    ? environment[chosenEnvironment]
    : {};

module.exports = environmentProperties;
