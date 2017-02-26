const fs = require('fs');
const JSONStream = require('JSONStream');

export default class OutputStream {
  constructor(fileName) {
    this._jsonwriter = JSONStream.stringify();
    this._file       = fs.createWriteStream(fileName);
    this._jsonwriter.pipe(this._file);
  }

  write(obj) {
    this._jsonwriter.write(JSON.parse(JSON.stringify(obj)));
  }

  end() {
    this._jsonwriter.end();
  }
}

export const saveFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
};

export const appendFile = (fileName, content) => {
  fs.appendFile(fileName, content, (err) => {
    if(err) {
        return console.log(err);
    }
    console.log("The file was appended!");
  });
};
