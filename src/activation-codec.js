import yaml from "js-yaml";
import callbacks from "when/callbacks";

const crypto2 = require("crypto2");

function cb2Promise(fn) {
  return async function(...args) {
    return await new Promise((resolve, reject) => {
      const cb = (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      };
      fn(...args, cb);
    });
  };
}

export const cryptoAsync = {
  readPrivateKey: cb2Promise(crypto2.readPrivateKey),
  readPublicKey: cb2Promise(crypto2.readPublicKey),
  sign: cb2Promise(crypto2.sign),
  verify: cb2Promise(crypto2.verify)
};

export async function generateCodeFromKeyFile(privateKeyPath, activationData) {
  try {
    const pk = await cryptoAsync.readPrivateKey(privateKeyPath);
    return generateCode(pk, activationData);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function generateCode(privateKey, activationData) {
  if (!privateKey) {
    throw Error("No private key provided");
  }
  if (!activationData) {
    throw Error("No activationData provided");
  }
  const license = yaml.safeDump(activationData);
  return cryptoAsync.sign(license, privateKey).then(([err, signature]) => {
    console.log("err: ", err);
    activationData.signature = signature;
    return (
      "########################################\n" +
      "# NEO4J SOFTWARE FEATURE ACTIVATION CODE\n" +
      yaml.safeDump(activationData)
    );
  });
}

export const verifyCode = (publicKeyPath, signedActivationCode) => {
  return cryptoAsync.readPublicKey(publicKeyPath).then(([err, publicKey]) => {
    const fullactivationData = yaml.safeLoad(signedActivationCode);
    const signature = fullactivationData.signature;
    delete fullactivationData.signature;
    const partialLicense = yaml.safeDump(fullactivationData);
    return cryptoAsync
      .verify(partialLicense, publicKey, signature)
      .then(([err, isValid]) => {
        return isValid;
      });
  });
};

export const extractCode = (publicKeyPath, signedActivationCode) => {
  return cryptoAsync.readPublicKey(publicKeyPath).then(([err, publicKey]) => {
    const fullactivationData = yaml.safeLoad(signedActivationCode);
    const signature = fullactivationData.signature;
    delete fullactivationData.signature;
    const partialLicense = yaml.safeDump(fullactivationData);
    return cryptoAsync
      .verify(partialLicense, publicKey, signature)
      .then(([err, isValid]) => {
        if (isValid) {
          return fullactivationData;
        } else {
          throw new Error("invalid activation code");
        }
      });
  });
};
