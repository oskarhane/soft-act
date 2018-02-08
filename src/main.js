import moment from "moment";

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
