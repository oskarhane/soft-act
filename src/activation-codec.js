import yaml from "js-yaml";
import crypto2 from "crypto2";
import { cb2Promise } from "./utils";

export const cryptoAsync = {
  readPrivateKey: cb2Promise(crypto2.readPrivateKey),
  readPublicKey: cb2Promise(crypto2.readPublicKey),
  sign: cb2Promise(crypto2.sign.sha256),
  verify: cb2Promise(crypto2.verify.sha256)
};

async function readPrivateKey(privateKeyPath) {
  try {
    return await cryptoAsync.readPrivateKey(privateKeyPath);
  } catch (e) {
    throw new Error(e.message);
  }
}
async function readPublicKey(publicKeyPath) {
  try {
    return await cryptoAsync.readPublicKey(publicKeyPath);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateCodeWithKeyFile(privateKeyPath, activationData) {
  const pk = await readPrivateKey(privateKeyPath);
  return await generateCode(pk, activationData);
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

export async function verifyCodeWithPublicKeyFile(
  publicKeyPath,
  signedActivationCode
) {
  const pubk = await readPublicKey(publicKeyPath);
  return await verifyCode(pubk, signedActivationCode);
}

export async function verifyCode(publicKey, signedActivationCode) {
  const fullactivationData = yaml.safeLoad(signedActivationCode);
  const signature = fullactivationData.signature;
  delete fullactivationData.signature;
  const partialLicense = yaml.safeDump(fullactivationData);
  try {
    const isValid = await cryptoAsync.verify(
      partialLicense,
      publicKey,
      signature
    );
    return isValid;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function extractCodeWithPublicKeyFile(
  publicKeyPath,
  signedActivationCode
) {
  const pubk = await readPublicKey(publicKeyPath);
  return await extractCode(pubk, signedActivationCode);
}

export async function extractCode(publicKey, signedActivationCode) {
  try {
    const fullactivationData = yaml.safeLoad(signedActivationCode);
    const isValid = await verifyCode(publicKey, signedActivationCode);
    if (!isValid) {
      throw new Error("Invalid activation code");
    }
    return fullactivationData;
  } catch (e) {
    throw new Error(e.message);
  }
}
