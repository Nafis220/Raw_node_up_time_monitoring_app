const { readFile, write, update, cut } = require("../lib/data");
const { hash, createTokenId } = require("../helpers/utilities");
//* module scaffolding
const handler = {};
handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["GET", "POST", "DELETE", "PUT"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    const route = handler._token[requestProperties.method]
      ? handler._token[requestProperties.method]
      : false;

    route(requestProperties, callback);
  } else {
    callback(405, { error: "Method is not allowed" });
  }
};
//module scaffolding

handler._token = {};

//*creating an token
handler._token.POST = (requestProperties, callback) => {
  const parsedUserInfo = JSON.parse(requestProperties.body);
  const phone =
    typeof parsedUserInfo.phone === "string" &&
    parsedUserInfo.phone.length === 11
      ? parsedUserInfo.phone
      : null;
  const password =
    typeof parsedUserInfo.password === "string" &&
    parsedUserInfo.password.length >= 5
      ? parsedUserInfo.password
      : null;

  //Validating password and Token
  if (phone && password) {
    readFile("users", phone, (data) => {
      if (data) {
        const hashedPassword = hash(password);

        parsedData = JSON.parse(data);

        // match the given password with the password came from the file
        if (hashedPassword === parsedData.password) {
          // create token object
          const tokenId = createTokenId(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObj = { id: tokenId, expires, phone };

          write("token", tokenId, tokenObj, (error) => {
            if (!error) {
              callback(200, { message: "Token created successfully" });
            } else {
              callback(404, { error: "Failed to create token" });
            }
          });
        } else {
          callback(400, { error: "Request Denied" });
        }
      } else {
        callback(500, { message: "server Error" });
      }
    });
  }
};

//* getting token's info
handler._token.GET = (requestProperties, callback) => {
  const token =
    typeof requestProperties.queryString.token === "string" &&
    requestProperties.queryString.token.trim().length > 0
      ? requestProperties.queryString.token
      : false;

  if (token) {
    readFile("token", token, (data) => {
      if (data) {
        const parsedData = JSON.parse(data);
        callback(200, { parsedData });
      } else {
        callback(400, { error: "Failed to Open the file" });
      }
    });
  } else {
    callback(400, { error: "Request Denied" });
  }
};

//*Updating the token
handler._token.PUT = (requestProperties, callback) => {
  const parsedUserInfo = JSON.parse(requestProperties.body);
  const token =
    typeof parsedUserInfo.token === "string" ? parsedUserInfo.token : false;
  const extend =
    typeof parsedUserInfo.extend === "boolean" && parsedUserInfo.extend === true
      ? parsedUserInfo.extend
      : false;

  if (token && extend) {
    // read the correspondent file
    readFile("token", token, (data) => {
      const parsedData = JSON.parse(data);
      if (parsedData.expires < Date.now()) {
        const newToken = Date.now() * 60 * 60 * 1000;
        update(
          "token",
          token,
          { token, phone: parsedData.phone, expires: newToken },
          (error) => {
            if (!error) {
              callback(200, { message: "Updated Successfully" });
            } else {
              callback(500, { message: "Internal Server Error" });
            }
          }
        );
      } else {
        callback(callback(400, { message: "Already Updated" }));
      }
    });
  } else {
    callback(400, { message: "Invalid Resources" });
  }
};

handler._token.DELETE = (requestProperties, callback) => {
  const token =
    typeof requestProperties.queryString.token === "string"
      ? requestProperties.queryString.token
      : false;
  if (token) {
    cut("token", token, (error) => {
      if (!error) {
        callback(200, { message: "Delete Successful" });
      } else {
        callback(400, { message: error });
      }
    });
  } else {
    callback(404, { message: "User Not Found" });
  }
};

handler._token.verify = (tokenID, phone, callback) => {
  readFile("token", tokenID, (tokenData) => {
    if (tokenData) {
      const parsedTokenData = JSON.parse(tokenData);

      if (
        parsedTokenData.phone === phone &&
        parsedTokenData.expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
module.exports = handler;
