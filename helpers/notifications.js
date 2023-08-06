// dependencies
const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environment");
// module scaffolding
const notification = {};

notification.SendTwilioSms = (phone, msg, callback) => {
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11 ? phone : false;
  const userMessage =
    typeof msg === "string" && msg.trim().length <= 1600 ? msg : false;

  if (userPhone && userMessage) {
    const payload = {
      from: twilio.MyNumber,
      to: `+880${userPhone}`,
      body: userMessage,
    };
    const stringPayload = querystring.stringify(payload);

    //configure request details
    const requestDetails = {
      hostName: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // instantiate the req object
    const req = https.request(requestDetails, (res) => {
      // get the status code of the send request
      const status = res.statusCode;
      if (status === 200 || status === 201 || 301) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });
    req.on("error", (err) => {
      callback(err);
    });

    req.write(stringPayload);
    req.end();
  } else {
    callback("Given Parameters were missing or invalid");
  }
};
module.exports = notification;
