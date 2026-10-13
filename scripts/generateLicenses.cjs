/* Writes src/assets/packages.json: name and license of every package the shipped app depends on. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
/* Only needed to serve dist/, not part of the app itself. */
const SERVER_ONLY = new Set(['serve']);

const readPackage = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));

/** Node's lookup: nearest node_modules/<name> walking up from the dependent package. */
const resolveDir = (name, fromDir) => {
  for (let dir = fromDir; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    if (dir === path.dirname(dir)) return null;
  }
};

const licenseOf = (pkg) => {
  const { license, licenses } = pkg;
  if (typeof license === 'string') return license;
  if (license?.type) return license.type;
  if (Array.isArray(licenses) && licenses[0]) return licenses[0].type ?? licenses[0];
  return 'UNKNOWN';
};

const app = readPackage(root);
const found = new Map([[app.name, app.license]]);
const seen = new Set();
const queue = Object.keys(app.dependencies ?? {})
  .filter((name) => !SERVER_ONLY.has(name))
  .map((name) => [name, root]);

while (queue.length) {
  const [name, fromDir] = queue.shift();
  const dir = resolveDir(name, fromDir);
  if (!dir || seen.has(dir)) continue;
  seen.add(dir);
  const pkg = readPackage(dir);
  if (!found.has(pkg.name)) found.set(pkg.name, licenseOf(pkg));
  Object.keys(pkg.dependencies ?? {}).forEach((dep) => queue.push([dep, dir]));
}

const packages = [...found].map(([name, license]) => ({ name, license }));
fs.writeFileSync(path.join(root, 'src/assets/packages.json'), JSON.stringify(packages));
console.log(`Wrote ${packages.length} packages`);
