const Crawler = require('crawler');
const fetch = require('node-fetch');
const fs = require('fs');
const url = require('url');

//CONFIG
const maxConnections = 10;
const outputName = 'contacts.json';
const rateLimit = 1500;
const skipDuplicates = true;
const uri = 'http://localhost:8000';
const userAgent = 'DDW';
//USERS ARRAY
const users = [];
//SAVE FILE
const saveFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
};

const crawler = new Crawler({
  maxConnections,
  userAgent,
  rateLimit,
  skipDuplicates,
});

const personCb = (error, res, done) => {
  if (error) {
    console.log('USER ERROR', error);
  } else {
    const $ = res.$;
    const name = $('.name').text();
    const phone = $('.phone').text();
    const gender = $('.gender').text();
    const age = $('.age').text();

    const user = {
      name,
      phone,
      gender,
      age,
    };
    users.push(user);
  }
  done();
};

const cityCb = (error, res, done) => {
  if (error) {
    console.log('CITY ERROR', error);
  } else {
    var $ = res.$;

    const persons = $('.persons li a').toArray();
    persons.forEach(x => crawler.queue([{ uri: uri + x.attribs.href, callback: personCb }]));

    const cities = $('.cities li a').toArray();
    cities.forEach(x => crawler.queue([{ uri: uri + x.attribs.href, callback: cityCb }]));
  }
  done();
};

const hpCb = (error, res, done) => {
  if(error){
      console.log('HOMEPAGE ERROR', error);
  } else {
      var $ = res.$;
      const array = $('li a').toArray();
      array.forEach(x => crawler.queue([{ uri: uri + x.attribs.href, callback: cityCb }]));
  }
  done();
};

crawler.queue([{ uri, callback: hpCb }]);

crawler.on('drain', () => {
  saveFile(outputName, JSON.stringify(users));
});

crawler.on('request',(options) => {
  console.log(options);
  //saveFile(`contacts-${new Date().toString()}.json`, JSON.stringify(users));
});
