import { cb2Promise } from "./utils";

test("cb2Promise promisifies simple callback functions", async () => {
  const val = 2;
  const fn = (x, callback) => callback(null, x);
  const pFn = cb2Promise(fn);

  const res = await pFn(val);

  expect(res).toEqual(val);
});

test("cb2Promise promisifies callback functions mith multiple args", async () => {
  expect.assertions(4);
  const valx = 2;
  const valy = 3;
  const valz = 4;
  const fn = (x, y, z, callback) => {
    expect(x).toEqual(valx);
    expect(y).toEqual(valy);
    expect(z).toEqual(valz);
    callback(null, x);
  };
  const pFn = cb2Promise(fn);

  const rx = await pFn(valx, valy, valz);

  expect(rx).toEqual(valx);
});

test("cb2Promise promisifies callback functions and rejects if error", async () => {
  expect.assertions(1);
  const val = 2;
  const fn = (x, callback) => callback(new Error("Nooo"), x);
  const pFn = cb2Promise(fn);

  await expect(pFn(val)).rejects.toEqual(new Error("Nooo"));
});
