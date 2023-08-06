//* dependencies
const url = require("url");

const { StringDecoder } = require("string_decoder"); //?The node:string_decoder module provides an API for decoding Buffer objects into strings in a manner that preserves encoded multi-byte UTF-8 and UTF-16 characters.
const { notFoundHandler } = require("../handlers/notFoundHandler");
const route = require("../routes");
//* module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  //*request handing
  // getting the right path
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method;
  const queryString = parseUrl.query;
  const headersObject = req.headers;

  const chosenHandler = route[trimmedPath]
    ? route[trimmedPath]
    : notFoundHandler;
  const requestProperties = {
    path,
    trimmedPath,
    method,
    queryString,
    headersObject,
  };

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  //*request handling
  req.on("data", (buffer) => (realData += decoder.write(buffer)));
  req.on("end", () => {
    (realData += decoder.end()),
      (requestProperties.body = realData),
      //! choosing what function should be called based on the exact path
      chosenHandler(requestProperties, (statusCode, payload) => {
        typeof statusCode === "number" ? statusCode : 500,
          typeof payload === "object" ? payload : {};
        const stringPayload = JSON.stringify(payload);
        //*response handling

        res.writeHead(statusCode);
        res.end(stringPayload);
      });
  });
};

module.exports = handler;
