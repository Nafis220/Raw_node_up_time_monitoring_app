const {
  open,
  writeFile,
  close,
  readFile,
  ftruncate,
  unlink,
  readdir,
} = require("fs");

const path = require("path");

//module scaffolding
const lib = {};
//Function to close files
const closeFile = (fileDescriptor, callback) => {
  close(fileDescriptor, (error) => {
    if (error) {
      return callback("Error closing the file");
    } else {
      callback();
    }
  });
};
//?joining the absolute path with the directory in which the file is located
lib.baseDir = path.join(__dirname, "/../.data/");

// *function to write file or to create and write file if not  exists
lib.write = (folderName, fileName, data, callback) => {
  open(
    `${lib.baseDir}/${folderName}/${fileName}.json`,
    "wx",
    (error, fileDescriptor) => {
      if (error) {
        return callback({ error: "Error occurred at file opening" });
      } else
        writeFile(fileDescriptor, JSON.stringify(data), (err) => {
          if (err) {
            callback({ error: "Failed to write in the file" });
          } else {
            callback();
          }

          closeFile(fileDescriptor, callback);
        });
    }
  );
};

//* Function to read file
lib.readFile = (folderName, fileName, callback) => {
  readFile(`${lib.baseDir}/${folderName}/${fileName}.json`, (error, data) => {
    if (!error && data) {
      callback(data.toString("utf-8"));
    } else callback();
  });
};

//*Function to update the file
lib.update = (folderName, fileName, data, callback) => {
  open(
    `${lib.baseDir}/${folderName}/${fileName}.json`,
    "r+",
    (error, fileDescriptor) => {
      if (!error && fileDescriptor) {
        ftruncate(fileDescriptor, (error) => {
          if (!error && fileDescriptor) {
            writeFile(fileDescriptor, JSON.stringify(data), (error) => {
              if (!error) {
                callback();
                closeFile(fileDescriptor, callback);
              } else callback("Failed to update the file");
            });
          } else callback("Failed truncating the file");
        });
      } else callback("Failed to open the file");
    }
  );
};

lib.cut = (folderName, fileName, callback) => {
  unlink(`${lib.baseDir}/${folderName}/${fileName}.json`, (error) => {
    if (error) {
      callback("the file may not exist");
    } else {
      callback();
    }
  });
};
lib.list = (folderName, callback) => {
  readdir(`${lib.baseDir}/${folderName}`, (error, filename) => {
    if (!error && filename.length >= 0) {
      const fileNames = [];
      filename.forEach((fileName) => {
        fileNames.push(fileName.replace(".json", ""));
      });
      callback(false, fileNames);
    } else {
      callback({ error: "failed to get files" });
    }
  });
};
module.exports = lib;
