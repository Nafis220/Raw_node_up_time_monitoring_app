const { readFile, write, update, cut } = require("../lib/data");
const { hash } = require("../helpers/utilities");
const handler = require("./tokenHandler");
//* module scaffolding

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["GET", "POST", "DELETE", "PUT"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    const route = handler._users[requestProperties.method]
      ? handler._users[requestProperties.method]
      : false;

    route(requestProperties, callback);
  } else {
    callback(405, { error: "Method is not allowed" });
  }
};
//module scaffolding

handler._users = {};

//*creating an user
handler._users.POST = (requestProperties, callback) => {
  const parsedUserInfo = JSON.parse(requestProperties.body);
  const firstName =
    typeof parsedUserInfo.firstName === "string"
      ? parsedUserInfo.firstName
      : null;
  const lastName =
    typeof parsedUserInfo.lastName === "string"
      ? parsedUserInfo.lastName
      : null;
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
  const isAssigned =
    typeof parsedUserInfo.isAssigned === "boolean"
      ? parsedUserInfo.isAssigned
      : null;

  if (firstName && lastName && phone && password && isAssigned) {
    const userData = {
      firstName,
      lastName,
      phone,
      password: hash(password),
      isAssigned,
    };

    //checking whether there the requested user is already registered
    readFile("users", parsedUserInfo.phone, (error) => {
      if (!error) {
        //create a new user
        write("users", parsedUserInfo.phone, userData, (error) => {
          if (error) {
            callback(404, { error: "failed to create user" });
          } else {
            callback(201, {
              message: `User created Successfully`,
            });
          }
        });
      } else {
        callback(404, { message: "user already exist" });
      }
    });
  } else {
    callback(404, { message: "Information is not valid" });
  }
};

//* getting user's info
handler._users.GET = (requestProperties, callback) => {
  //check the query is valid or not

  const phone =
    typeof requestProperties.queryString.phone === "string" &&
    requestProperties.queryString.phone.trim().length === 11
      ? requestProperties.queryString.phone
      : false;
  const token =
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;
  // authenticate user
  handler._token.verify(token, phone, (tokenID) => {
    if (tokenID) {
      // read the file
      readFile("users", phone, (data) => {
        if (data) {
          const parsedData = JSON.parse(data);
          delete parsedData.password;
          callback(200, { message: parsedData });
        } else {
          callback(404, { error: "Invalid Phone Number" });
        }
      });
    } else {
      callback(403, { error: "Authentication Failed" });
    }
  });
};

//*Updating the file
handler._users.PUT = (requestProperties, callback) => {
  const parsedUserInfo = JSON.parse(requestProperties.body);
  const phone =
    typeof parsedUserInfo.phone === "string" &&
    parsedUserInfo.phone.trim().length === 11
      ? parsedUserInfo.phone
      : false;
  const firstName =
    typeof parsedUserInfo.firstName === "string"
      ? parsedUserInfo.firstName
      : null;
  const lastName =
    typeof parsedUserInfo.lastName === "string"
      ? parsedUserInfo.lastName
      : null;

  const password =
    typeof parsedUserInfo.password === "string" &&
    parsedUserInfo.password.length >= 5
      ? parsedUserInfo.password
      : null;
  const token =
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;
  if (phone) {
    if (firstName || lastName || password) {
      readFile("users", phone, (data, error) => {
        if (data && !error) {
          const parsedData = JSON.parse(data);
          if (firstName) {
            parsedData.firstName = firstName;
          }
          if (lastName) {
            parsedData.lastName = lastName;
          }
          if (password) {
            parsedData.password = password;
          }

          // authenticate user
          handler._token.verify(token, phone, (tokenID) => {
            if (tokenID) {
              // update to the file
              update("users", phone, parsedData, (error) => {
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
  } else callback(400, { message: "phone number was not valid" });
};
handler._users.DELETE = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.queryString.phone === "string" &&
    requestProperties.queryString.phone.trim().length === 11
      ? requestProperties.queryString.phone
      : false;
  const token =
    typeof requestProperties.headersObject.token === "string"
      ? requestProperties.headersObject.token
      : false;

  if (phone) {
    // authenticate user
    handler._token.verify(token, phone, (tokenID) => {
      if (tokenID) {
        //Delete User
        cut("users", phone, (error) => {
          if (!error) {
            callback(200, { message: "Delete Successful" });
          } else {
            callback(400, { message: error });
          }
        });
      } else {
        callback(403, { error: "Authentication Failed" });
      }
    });
  } else {
    callback(404, { message: "User Not Found" });
  }
};
module.exports = handler;
