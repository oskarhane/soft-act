import yaml from "js-yaml";
import crypto2 from "crypto2";
import { cb2Promise } from "./utils";

export const cryptoAsync = {
  readPrivateKey: cb2Promise(crypto2.readPrivateKey),
  readPublicKey: cb2Promise(crypto2.readPublicKey),
  sign: cb2Promise(crypto2.sign.sha256),
  verify: cb2Promise(crypto2.verify.sha256)
};

export async function generateCodeFromKeyFile(privateKeyPath, activationData) {
  try {
    const pk = await cryptoAsync.readPrivateKey(privateKeyPath);
    return generateCode(pk, activationData);
  } catch (e) {
    throw new Error(e.message);
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
  try {
    const signature = await cryptoAsync.sign(license, privateKey);
    return (
      "########################################\n" +
      "# NEO4J SOFTWARE FEATURE ACTIVATION CODE\n" +
      yaml.safeDump({ ...activationData, signature })
    );
  } catch (e) {
    throw new Error(e.message);
  }
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
