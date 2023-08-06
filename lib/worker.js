//dependencies
const { SendTwilioSms } = require("../helpers/notifications");
const { list, readFile, update } = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");
// module scaffolding
const worker = {};

worker.getAllChecks = () => {
  list("check", (error, checks) => {
    if (!error && checks.length > 0) {
      checks.forEach((check) => {
        readFile("check", check, (data) => {
          if (data) {
            worker.ValidateCheckData(JSON.parse(data));
          } else {
            console.log({ error: "Failed to read file" });
          }
        });
      });
    } else {
      console.log(error);
    }
  });
};

// Validate whether the data is already checked or not
worker.ValidateCheckData = ({ ...originalCheckData }) => {
  if (originalCheckData.checkID) {
    originalCheckData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalCheckData.lastChecked =
      originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;
    worker.performCheck(originalCheckData);
  } else {
    console.log("Data was not valid");
  }
};

worker.performCheck = (originalCheckData) => {
  // initial check outcome
  let checkOutcome = { error: false, statusCode: false };

  let outcomeSetOrNot = false;
  // parse the hostname and full url from original data
  const parseUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );
  const hostName = parseUrl.hostname;
  const { path } = parseUrl;

  //create the request property
  const requestProperties = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeOutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestProperties, (res) => {
    const status = res.statusCode;

    checkOutcome.responseCode = status;
    if (!outcomeSetOrNot) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSetOrNot = true;
    }
  });
  req.on("error", (err) => {
    checkOutcome = { error: true, value: err };
    if (!outcomeSetOrNot) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSetOrNot = true;
    }
  });
  req.on("timeout", () => {
    checkOutcome = { error: true, value: "timeout" };
    if (!outcomeSetOrNot) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSetOrNot = true;
    }
  });
  // req send
  req.end();
};
worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
  const state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  const alertWanted = !!(originalCheckData.state !== state);

  const newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  update("check", newCheckData.checkID, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the checkdata to next process
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change!");
      }
    } else {
      console.log("Error trying to save check data of one of the checks!");
    }
  });
};
worker.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  SendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user!");
    }
  });
};
worker.loop = () => {
  setInterval(() => {
    worker.getAllChecks();
  }, 8000);
};

worker.init = () => {
  // get all the check at first
  worker.getAllChecks();
  // check if there any change in equal interval
  worker.loop();
};

module.exports = worker;
