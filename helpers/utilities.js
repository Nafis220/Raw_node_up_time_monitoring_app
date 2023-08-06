// dependencies

const { createHmac } = require("crypto");

// module scaffolding
const utilities = {};
utilities.hash = (password) => {
  const hmac = createHmac("sha256", `${password}`);
  hmac.update("some data to hash");
  return hmac.digest("hex");
};
utilities.createTokenId = (characterLength) => {
  const acceptedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
  let token = "";

  for (let i = 0; i < characterLength; ++i) {
    const index = Math.floor(Math.random() * acceptedCharacters.length);

    token += acceptedCharacters.charAt(index);
  }

  return token;
};

module.exports = utilities;
