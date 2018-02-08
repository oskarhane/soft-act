/**
 * This function creates a promise from a standard callback function call
 * fn(args, cb) => fn(args).then().catch()
 */
export function cb2Promise(fn) {
  return async function(...args) {
    return await new Promise((resolve, reject) => {
      const cb = (err, rest) => {
        if (err) return reject(err);
        return resolve(rest);
      };
      fn(...args, cb);
    });
  };
}
