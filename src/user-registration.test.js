import { register, recall } from "./user-registration";

const encoded = `registrant: Test Testsson
organization: Acme Inc.
email: test@tests.son
`;
const decoded = {
  registrant: "Test Testsson",
  organization: "Acme Inc.",
  email: "test@tests.son"
};

test("register outputs yaml", () => {
  const registrantData = decoded;

  const output = register(registrantData);

  expect(output).toEqual(encoded);
});
test("recall outputs object", () => {
  const registrantString = encoded;

  const output = recall(registrantString);

  expect(output).toEqual(decoded);
});
