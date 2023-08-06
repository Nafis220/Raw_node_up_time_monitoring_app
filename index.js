// // dependencies
// const http = require("http");
// const { handleReqRes } = require("./helpers/handleReqRes");
// const environmentProperties = require("./helpers/environment.js");
// // const { SendTwilioSms } = require("./helpers/notifications");

const server = require("./lib/server");
const worker = require("./lib/worker");

// const { twilio } = require("./helpers/environment");
// require("dotenv/config");
// //*const { write, readFile, update, cut } = require("./lib/data");
// //module scaffolding
// const app = {};
// // configuration
// app.config = {
//   port: 3000,
// };
// //!Twilio to send what's app messages
// // const client = require("twilio")(twilio.accountSid, twilio.authToken);

// // client.messages
// //   .create({
// //     body: "You are just a fool",
// //     from: "whatsapp:+14155238886",
// //     to: "whatsapp:+8801766109573",
// //   })
// //   .then((message) => console.log(message.sid))
// //   .catch((error) => console.error(error));

// //!creating and writing in the data file
// // write("test", { name: "nafis Fuad", DOB: "15/6/2002" }, (error, data) => {
// //   if (error) {
// //     console.log(error);
// //   } else console.log(data);
// // });
// //!read the existing file
// // readFile("test", (data, error) => {
// //   console.log(data);
// // });

// //!Update the existing file
// // update("test", { name: "Alam", age: "60" }, (data, error) => {
// //   if (error === undefined) {
// //     console.log(data);
// //   } else console.log(error);
// // });
// //!Delete Existing File
// // cut("test", (error, data) => {
// //   if (error) {
// //     console.log(error);
// //   } else console.log(data);
// // });

// //! call notification component
// // SendTwilioSms("1766109573", "hello world", (err) => {
// //   console.log(err);
// // });

// // create server
// app.createServer = () => {
//   server = http.createServer(handleReqRes);
//   server.listen(app.config.port, () => {
//     console.log(`server listening on port ${environmentProperties.port}`);
//   });
// };

// // start the server
// app.createServer();
const app = {};
app.init = () => {
  server.init();
  worker.init();
};

app.init();

module.exports = app;
