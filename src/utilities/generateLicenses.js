const licenseList = require('license-list');
const fs = require('fs');
const path = require('path');

licenseList('.', { dev: true })
  .then((packages) => {
    fs.writeFile(path.join(__dirname, '../assets/packages.json'), JSON.stringify(packages), (err) => {
      if (err) throw err;
      console.log('Data written to file');

      process.exit(0);
    })
  })