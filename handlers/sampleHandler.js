//* module scaffolding
const handler = {};
handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties, "from here");
  callback(200, { message: "This is from sample route" });
};
module.exports = handler;
