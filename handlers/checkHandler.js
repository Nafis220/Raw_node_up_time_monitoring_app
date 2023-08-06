//dependencies
const { readFile, write, update, cut } = require("../lib/data");
const { hash, createTokenId } = require("../helpers/utilities");
const handler = require("./tokenHandler");

//* module scaffolding
handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["GET", "POST", "DELETE", "PUT"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    const route = handler._check[requestProperties.method]
      ? handler._check[requestProperties.method]
      : false;

    route(requestProperties, callback);
  } else {
    callback(405, { error: "Method is not allowed" });
  }
};
//module scaffolding
handler._check = {};

//*create an user
handler._check.POST = (requestProperties, callback) => {
  const parsedBody = JSON.parse(requestProperties.body);

  const protocol =
    typeof parsedBody.protocol === "string" &&
    ["http", "https"].indexOf(parsedBody.protocol) > -1
      ? parsedBody.protocol
      : false;

  const url =
    typeof parsedBody.url === "string" && parsedBody.url.length > -1
      ? parsedBody.url
      : false;

  const method =
    typeof parsedBody.method === "string" &&
    ["GET", "POST", "DELETE", "PUT"].indexOf(parsedBody.method) > -1
      ? parsedBody.method
      : false;
  const successCodes =
    typeof parsedBody.successCodes === "object" &&
    parsedBody.successCodes instanceof Array
      ? parsedBody.successCodes
      : false;
  const timeOutSeconds =
    typeof parsedBody.timeOutSeconds === "number" &&
    parsedBody.timeOutSeconds % 1 === 0 &&
    parsedBody.timeOutSeconds >= 1 &&
    parsedBody.timeOutSeconds <= 5
      ? parsedBody.timeOutSeconds
      : false;

  if (protocol && url && method && successCodes && timeOutSeconds) {
    const token = requestProperties.headersObject.token;
    if (token) {
      //Get token Object
      readFile("token", token, (data) => {
        if (data) {
          const parsedTokenData = JSON.parse(data);
          // Get user data according to the token phone
          readFile("users", parsedTokenData.phone, (data) => {
            if (data) {
              const parsedUserData = JSON.parse(data);
              // check tokens validity
              handler._token.verify(
                parsedTokenData.id,
                parsedTokenData.phone,
                (valid) => {
                  if (valid) {
                    const checkID = createTokenId(15);
                    const checkObj = {
                      userPhone: parsedUserData.phone,
                      checkID,
                      protocol,
                      url,
                      method,
                      successCodes,
                      timeOutSeconds,
                    };
                    const newParsedUserData =
                      typeof parsedUserData.checkId === "object" &&
                      parsedUserData.checkId instanceof Array
                        ? parsedUserData.checkId
                        : [];

                    if (newParsedUserData.length <= 5) {
                      parsedUserData.checkId = newParsedUserData;
                      parsedUserData.checkId.push(checkID);
                      write("check", checkID, checkObj, (error) => {
                        if (!error) {
                          // update the user's object with correspondent check id

                          update(
                            "users",
                            parsedUserData.phone,
                            parsedUserData,
                            (error) => {
                              if (!error) {
                                callback(200, {
                                  message: "Check Created successfully",
                                });
                              } else {
                                callback(500, {
                                  message: "Failed to update user's info",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, { message: "Failed creating check" });
                        }
                      });
                    } else {
                      callback(500, { message: "Max Length of check exceeds" });
                    }
                  } else {
                    callback(403, { message: "Token Invalid" });
                  }
                }
              );
            } else {
              callback(500, { message: "User was not found" });
            }
          });
        } else {
          callback(500, { message: "No such Token found" });
        }
      });
    } else {
      callback(400, { message: "Token was not found" });
    }
  } else {
    callback(400, { message: "Invalid Credentials" });
  }
};

//*Get user's info
handler._check.GET = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryString.id === "string" &&
    requestProperties.queryString.id.trim().length > 0
      ? requestProperties.queryString.id
      : false;

  if (id) {
    readFile("check", id, (data) => {
      const { token } = requestProperties.headersObject;
      if (data) {
        const { userPhone } = JSON.parse(data);

        handler._token.verify(token, userPhone, (valid) => {
          if (valid) {
            const parsedData = JSON.parse(data);
            callback(200, { parsedData });
          } else {
            callback(403, { error: "Authentication is invalid" });
          }
        });
      } else {
        callback(400, { error: "Failed to Open the file" });
      }
    });
  } else {
    callback(400, { error: "Request Denied" });
  }
};

//*update an user
handler._check.PUT = (requestProperties, callback) => {
  const parsedBody = JSON.parse(requestProperties.body);

  const id = typeof parsedBody.id === "string" ? parsedBody.id : false;

  const protocol =
    typeof parsedBody.protocol === "string" &&
    ["http", "https"].indexOf(parsedBody.protocol) > -1
      ? parsedBody.protocol
      : false;

  const url =
    typeof parsedBody.url === "string" && parsedBody.url.length > -1
      ? parsedBody.url
      : false;

  const method =
    typeof parsedBody.method === "string" &&
    ["GET", "POST", "DELETE", "PUT"].indexOf(parsedBody.method) > -1
      ? parsedBody.method
      : false;
  const successCodes =
    typeof parsedBody.successCodes === "object" &&
    parsedBody.successCodes instanceof Array
      ? parsedBody.successCodes
      : false;
  const timeOutSeconds =
    typeof parsedBody.timeOutSeconds === "number" &&
    parsedBody.timeOutSeconds % 1 === 0 &&
    parsedBody.timeOutSeconds >= 1 &&
    parsedBody.timeOutSeconds <= 5
      ? parsedBody.timeOutSeconds
      : false;
  const token =
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;
  if (id) {
    if (protocol || url || method || successCodes || timeOutSeconds) {
      readFile("check", id, (data) => {
        if (data) {
          const parsedData = JSON.parse(data);
          if (protocol) {
            parsedData.protocol = protocol;
          }
          if (url) {
            parsedData.url = url;
          }
          if (method) {
            parsedData.method = method;
          }
          if (successCodes) {
            parsedData.successCodes = successCodes;
          }
          if (timeOutSeconds) {
            parsedData.timeOutSeconds = timeOutSeconds;
          }

          // authenticate user

          handler._token.verify(token, parsedData.userPhone, (valid) => {
            if (valid) {
              // update to the file
              update("check", id, parsedData, (error) => {
                if (!error) {
                  callback(200, { message: "Updated Successfully" });
                } else {
                  callback(400, { message: error });
                }
              });
            } else {
              callback(403, { error: "Authentication Failed" });
            }
          });
        } else {
          callback(400, { message: error });
        }
      });
    } else callback(400, { message: "Invalid Data" });
  } else callback(400, { message: "Check ID was not valid" });
};

//* delete an user
handler._check.DELETE = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryString.id === "string" &&
    requestProperties.queryString.id.trim().length > 0
      ? requestProperties.queryString.id
      : false;

  const token =
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;

  if (id) {
    // read check object
    readFile("check", id, (data) => {
      if (data) {
        const parsedData = JSON.parse(data);
        handler._token.verify(token, parsedData.userPhone, (valid) => {
          if (valid) {
            //Delete User
            cut("check", id, (error) => {
              if (!error) {
                readFile("users", parsedData.userPhone, (data) => {
                  if (data) {
                    const parsedUserData = JSON.parse(data);
                    const checkArray =
                      typeof parsedUserData.checkId === "object" &&
                      parsedUserData.checkId instanceof Array
                        ? parsedUserData.checkId
                        : [];

                    if (checkArray.indexOf(id) > -1) {
                      checkArray.splice(checkArray.indexOf(id), 1);
                      parsedUserData.checkId = checkArray;

                      // update user check

                      update(
                        "users",
                        parsedData.userPhone,
                        parsedUserData,
                        (error) => {
                          if (!error) {
                            callback(200, { message: "Check Deleted" });
                          } else {
                            callback(500, { message: "Failed to update info" });
                          }
                        }
                      );
                    } else {
                      callback(500, {
                        message: "File Deleted but didn't get it in users file",
                      });
                    }
                  } else {
                    callback(500, { message: "User not found" });
                  }
                });
              } else {
                callback(400, { message: error });
              }
            });
          } else {
            callback(403, { error: "Authentication Failed" });
          }
        });
      } else {
        callback(500, { message: "Check is not found" });
      }
    });

    // authenticate user
  } else {
    callback(404, { message: "User Not Found" });
  }
};

module.exports = handler;
