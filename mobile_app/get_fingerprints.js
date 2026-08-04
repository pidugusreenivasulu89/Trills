const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const keytool = process.env.KEYTOOL || 'keytool';

const printHeader = (title) => {
  console.log(`\n=== ${title} ===`);
};

const runKeytool = (args) => {
  try {
    return execFileSync(keytool, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const message = error.stderr || error.stdout || error.message;
    return `Unable to read certificate: ${message}`;
  }
};

const pemToDer = (pem) => {
  const base64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
  return Buffer.from(base64, 'base64');
};

const facebookKeyHashFromDer = (der) => {
  return crypto.createHash('sha1').update(der).digest('base64');
};

const printFacebookKeyHash = (label, pem) => {
  try {
    console.log(`Facebook key hash (${label}): ${facebookKeyHashFromDer(pemToDer(pem))}`);
  } catch (error) {
    console.log(`Facebook key hash (${label}): unable to calculate - ${error.message}`);
  }
};

const printCertFile = (label, relativePath) => {
  const certPath = path.join(root, relativePath);
  if (!fs.existsSync(certPath)) {
    return;
  }

  printHeader(label);
  const pem = fs.readFileSync(certPath, 'utf8');
  console.log(runKeytool(['-printcert', '-file', certPath]));
  printFacebookKeyHash(label, pem);
};

const printKeystore = (label, relativePath, storePass, alias, keyPass) => {
  const storePath = path.join(root, relativePath);
  if (!fs.existsSync(storePath)) {
    return;
  }

  printHeader(label);
  const args = [
    '-list',
    '-v',
    '-keystore',
    storePath,
    '-storepass',
    storePass,
  ];

  if (alias) {
    args.push('-alias', alias);
  }

  if (keyPass) {
    args.push('-keypass', keyPass);
  }

  console.log(runKeytool(args));

  if (alias) {
    const exportArgs = [
      '-exportcert',
      '-rfc',
      '-keystore',
      storePath,
      '-storepass',
      storePass,
      '-alias',
      alias,
    ];

    if (keyPass) {
      exportArgs.push('-keypass', keyPass);
    }

    printFacebookKeyHash(label, runKeytool(exportArgs));
  }
};

printKeystore(
  'Local Android debug keystore',
  path.join('android', 'app', 'debug.keystore'),
  'android',
  'androiddebugkey',
  'android'
);

printCertFile('Upload certificate PEM', 'upload_cert_for_google.pem');

const releaseStoreFile = process.env.TRILLS_UPLOAD_STORE_FILE;
const releaseStorePassword = process.env.TRILLS_UPLOAD_STORE_PASSWORD;
const releaseKeyAlias = process.env.TRILLS_UPLOAD_KEY_ALIAS;
const releaseKeyPassword = process.env.TRILLS_UPLOAD_KEY_PASSWORD;

if (releaseStoreFile && releaseStorePassword) {
  printKeystore(
    'Configured release upload keystore',
    releaseStoreFile,
    releaseStorePassword,
    releaseKeyAlias,
    releaseKeyPassword
  );
}

printHeader('Google OAuth reminder');
console.log(
  [
    'Register an Android OAuth client for package name: in.trills.socialvibe',
    'Use the SHA-1 from the exact app build installed on the phone.',
    'For Google Play installs, use the Play Console App signing key certificate SHA-1, not only the upload certificate.',
    'For Facebook Android settings, use the Facebook key hash for the exact installed build.',
    'Keep webClientId configured with a Web Application OAuth client ID.',
  ].join('\n')
);
