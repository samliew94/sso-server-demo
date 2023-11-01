import { CustomError } from "./custom-error";

const crypto = require("crypto");

interface AuthData {
  exp: string; // UNIX EPOCH timestamp
  client_id?: string;
  redirect_uri?: string;
  ssoToken: any;
}

const data = new Map();

export function findByAuthCode(code: string) {
  if (!code) throw new CustomError(401, "Authorization Code is missing");
  if (!data.has(code))
    throw new CustomError(401, "Cannot find the given Authorization Code");

  const authData: AuthData = data.get(code);
  data.delete(code);

  const timestamp = authData.exp;

  if (parseInt(timestamp, 10) < new Date().getTime())
    throw new CustomError(401, "Authorization Code expired");

  return authData;
}

export function cacheAuthCode(
  client_id: string,
  redirect_uri: string,
  ssoToken: any
) {
  let authCode: string;

  while (true) {
    authCode = crypto.randomBytes(16).toString("hex");

    if (data.has(authCode)) continue;

    break;
  }

  const date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  const timestamp = date.getTime().toString();

  const authData: AuthData = {
    exp: timestamp,
    ssoToken,
  };

  if (client_id) authData.client_id = client_id;
  if (redirect_uri) authData.redirect_uri = redirect_uri;

  data.set(authCode, authData);

  return authCode;
}
