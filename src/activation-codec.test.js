import {
  generateCodeFromKeyFile,
  generateCode,
  verifyCodeFromPublicKeyFile,
  verifyCode,
  extractCode
} from "./activation-codec";

const activationData = {
  activationVersion: "1.0.0",
  featureName: "neo4j-browser",
  featureVersion: "2.0.0",
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "test@tests.son",
  expirationDate: null
};

test("generateCodeFromKeyFile fails if no private key file", async () => {
  expect.assertions(1);
  const privateKeyFilePath = "";

  await expect(
    generateCodeFromKeyFile(privateKeyFilePath, activationData)
  ).rejects.toEqual(new Error("ENOENT: no such file or directory, open ''"));
});

test("generateCode fails if no private key", async () => {
  expect.assertions(1);
  const privateKeyStr = "";

  await expect(generateCode(privateKeyStr, activationData)).rejects.toEqual(
    new Error("No private key provided")
  );
});

test("generateCode fails if no activationData", async () => {
  expect.assertions(1);
  const privateKeyStr = "x";

  await expect(generateCode(privateKeyStr, null)).rejects.toEqual(
    new Error("No activationData provided")
  );
});

test("generateCodeFromKeyFile succeeds", async () => {
  expect.assertions(1);
  const privateKeyFilePath = "./keys/private.test.pem";

  const signedCode = await generateCodeFromKeyFile(
    privateKeyFilePath,
    activationData
  );
  expect(
    signedCode.indexOf("########################################")
  ).toEqual(0);
});

describe("code checks", () => {
  const privateKeyPath = "./keys/private.test.pem";
  const publicKeyPath = "./keys/public.test.pem";
  const publicKeyPath2 = "./keys/public2.test.pem";

  let signedCode;
  beforeEach(async () => {
    signedCode = await generateCodeFromKeyFile(privateKeyPath, activationData);
  });
  afterEach(() => {
    signedCode = null;
  });

  test("verifyCodeFromPublicKeyFile fails if no private key file", async () => {
    expect.assertions(1);
    const privateKeyFilePath = "";
    await expect(
      verifyCodeFromPublicKeyFile(privateKeyFilePath, activationData)
    ).rejects.toEqual(new Error("ENOENT: no such file or directory, open ''"));
  });

  test("verifyCodeFromPublicKeyFile works", async () => {
    const res = await verifyCodeFromPublicKeyFile(publicKeyPath, signedCode);
    expect(res).toEqual(true);
  });
  test("verifyCodeFromPublicKeyFile fails if wrong signature for key", async () => {
    const res = await verifyCodeFromPublicKeyFile(publicKeyPath2, signedCode);
    expect(res).toEqual(false);
  });
});
