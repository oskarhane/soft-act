import {
  generateCodeFromKeyFile,
  generateCode,
  verifyCode,
  extractCode
} from "./activation-codec";

const activationData = {
  feature: "neo4j-browser",
  version: null,
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "test@tests.son",
  date: null
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
