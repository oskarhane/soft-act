import moment from "moment";
import { isAuthorized } from "./main";
import {
  generateCodeWithKeyFile,
  extractCodeWithPublicKeyFile
} from "./activation-codec";

const validUser = {
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "test@test.com"
};
const invalidUser = {
  registrant: "Evil Testsson",
  organization: "Evil Inc.",
  email: "test@test.com"
};

const validActivationData = {
  activationVersion: "1.0.0",
  featureName: "(neo4j-browser|neo4j-etl)",
  featureVersion: "2.0.0",
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "/.*/",
  expirationDate: moment()
    .add(1, "day")
    .format()
};

const invalidActivationData = {
  activationVersion: "1.0.0",
  featureName: "neo4j-browser, neo4j-etl",
  featureVersion: "2.0.0",
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "/.*/",
  expirationDate: moment()
    .subtract(1, "day")
    .format()
};

describe("main", () => {
  const privateKeyPath = "./keys/private.test.pem";
  const publicKeyPath = "./keys/public.test.pem";

  test("isAuthorized denies licenses for non-found code", async () => {
    const extractedCode = null;
    const feature = "neo4j-browser";
    const res = isAuthorized(validUser, extractedCode, feature);
    expect(res).toEqual(false);
  });

  test("isAuthorized denies licenses for non-authorized features", async () => {
    const validSignedCode = await generateCodeWithKeyFile(
      privateKeyPath,
      validActivationData
    );
    const extractedCode = await extractCodeWithPublicKeyFile(
      publicKeyPath,
      validSignedCode
    );
    const feature = "neo4j-secret";
    const res = isAuthorized(validUser, extractedCode, feature);
    expect(res).toEqual(false);
  });
  test("isAuthorized denies licenses for non-authorized user", async () => {
    const validSignedCode = await generateCodeWithKeyFile(
      privateKeyPath,
      validActivationData
    );
    const extractedCode = await extractCodeWithPublicKeyFile(
      publicKeyPath,
      validSignedCode
    );
    const feature = "neo4j-browser";
    const res = isAuthorized(invalidUser, extractedCode, feature);
    expect(res).toEqual(false);
  });
  test("isAuthorized denies licenses for expired date", async () => {
    const validSignedCode = await generateCodeWithKeyFile(
      privateKeyPath,
      invalidActivationData
    );
    const extractedCode = await extractCodeWithPublicKeyFile(
      publicKeyPath,
      validSignedCode
    );
    const feature = "neo4j-browser";
    const res = isAuthorized(validUser, extractedCode, feature);
    expect(res).toEqual(false);
  });
  test("isAuthorized approves licenses for valid data", async () => {
    const validSignedCode = await generateCodeWithKeyFile(
      privateKeyPath,
      validActivationData
    );
    const extractedCode = await extractCodeWithPublicKeyFile(
      publicKeyPath,
      validSignedCode
    );
    const feature = "neo4j-browser";
    const res = isAuthorized(validUser, extractedCode, feature);
    expect(res).toEqual(true);
  });
});
