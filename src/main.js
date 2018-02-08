import moment from "moment";
export {
  generateCode,
  generateCodeWithKeyFile,
  verifyCode,
  verifyCodeWithPublicKeyFile,
  extractCode,
  extractCodeWithPublicKeyFile
} from "./activation-codec.js";
export { register, recall } from "./user-registration.js";

export function isAuthorized(userInfo, activationCode, feature) {
  if (typeof activationCode !== "object" || !activationCode) {
    return false;
  }
  const rightNow = moment();
  var expirationDate = moment(activationCode.expirationDate);
  if (rightNow.isAfter(expirationDate)) {
    return false;
  }
  if (!new RegExp(activationCode.registrant, "g").test(userInfo.registrant)) {
    return false;
  }
  if (!new RegExp(activationCode.featureName, "g").test(feature)) {
    return false;
  }
  return true;
}
