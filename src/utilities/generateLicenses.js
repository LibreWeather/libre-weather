const licenseList = require('license-list');
const fs = require('fs');
const path = require('path');

licenseList('.', { dev: true }).then((packages) => {
  let stripped = Object.keys(packages).map((key) => {
    const entry = packages[key];
    delete entry.path;
    delete entry.licenseFile;
    delete entry.author;
    delete entry.contributors;
    delete entry.maintainers;
    entry.license = Array.isArray(entry.license) ? entry.license[0].type : entry.license;
    delete entry.version;
    return entry;
  });

  // dedupe method from SO
  // https://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript#comment89772489_36744732
  stripped = stripped.filter(
    (object, index) => index === stripped.findIndex((obj) => JSON.stringify(obj) === JSON.stringify(object))
  );
  fs.writeFile(path.join(__dirname, '../assets/packages.json'), JSON.stringify(stripped), (err) => {
    if (err) throw err;
    console.log('Data written to file');

    process.exit(0);
  });
});
