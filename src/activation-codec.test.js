import {
  generateCodeWithKeyFile,
  generateCode,
  verifyCodeWithPublicKeyFile,
  extractCodeWithPublicKeyFile
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
const validCodeSignature =
  "d4f08e316bc290b2a51d5ef359b539cb4174993fe3b0e15487046886a4a08102b7281e9fc01e440c839ab5e1c33a60c9c2a8325d4d653bc3c8bf84c2d5324dfec6f7fdaf196006f2b45ddba79097fa23daaa8c8849e960446b579be98225c63cb64ee02683fc98b3e0110b8a525882cf7ad97a56adeeb48d83306905a4ae3b6a3eebffe568df6e004678ec9e471bf482037fb42531b4106ca413ba62969585ff498bfd44d5aedc5658770a120c79fe65715bddb93a1352f69d771acecab87b90bad5c882e6095d26b991582d687a32a7a605c227a1142bd4e0cd909f726602e18a31ff82879a8eb83685218e9d629d81b6a3aaf944a86f495eb98a4b07b604d8";

test("generateCodeFromKeyFile fails if no private key file", async () => {
  expect.assertions(1);
  const privateKeyFilePath = "";

  await expect(
    generateCodeWithKeyFile(privateKeyFilePath, activationData)
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

  const signedCode = await generateCodeWithKeyFile(
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
    signedCode = await generateCodeWithKeyFile(privateKeyPath, activationData);
  });
  afterEach(() => {
    signedCode = null;
  });

  test("verifyCodeFromPublicKeyFile fails if no private key file", async () => {
    expect.assertions(1);
    const privateKeyFilePath = "";
    await expect(
      verifyCodeWithPublicKeyFile(privateKeyFilePath, activationData)
    ).rejects.toEqual(new Error("ENOENT: no such file or directory, open ''"));
  });
  test("verifyCodeFromPublicKeyFile works", async () => {
    const res = await verifyCodeWithPublicKeyFile(publicKeyPath, signedCode);
    expect(res).toEqual(true);
  });
  test("verifyCodeFromPublicKeyFile fails if wrong signature for key", async () => {
    const res = await verifyCodeWithPublicKeyFile(publicKeyPath2, signedCode);
    expect(res).toEqual(false);
  });

  test("extractCodeFromPublicKeyFile fails if no private key file", async () => {
    expect.assertions(1);
    const privateKeyFilePath = "";
    await expect(
      extractCodeWithPublicKeyFile(privateKeyFilePath, activationData)
    ).rejects.toEqual(new Error("ENOENT: no such file or directory, open ''"));
  });
  test("extractCodeFromPublicKeyFile works", async () => {
    const res = await extractCodeWithPublicKeyFile(publicKeyPath, signedCode);
    expect(res).toEqual({
      ...activationData,
      signature: validCodeSignature
    });
  });
  test("extractCodeFromPublicKeyFile fails if wrong signature for key", async () => {
    expect.assertions(1);
    await expect(
      extractCodeWithPublicKeyFile(publicKeyPath2, signedCode)
    ).rejects.toEqual(new Error("Invalid activation code"));
  });
});
