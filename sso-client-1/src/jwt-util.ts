import { CustomError } from "./custom-error";

var jwt = require("jsonwebtoken");
require("dotenv").config();

export function signClientToken(payload: any) {
  const token = jwt.sign(payload, process.env.CLIENT_SECRET!);
  return token;
}

/**
 * either returns {error} or decoded jwt
 */
export function verifyClientToken(payload: string) {
  try {
    return jwt.verify(payload, process.env.CLIENT_SECRET!);
  } catch (error: any) {
    throw new CustomError(401, error.message);
  }
}

export function decodeJwt(token: any) {
  return jwt.decode(token);
}
