var jwt = require("jsonwebtoken");
require("dotenv").config();

export function signToken(payload: any) {
  const token = jwt.sign(payload, process.env.SSO_SECRET!, {
    expiresIn: "20s",
  });
  return token;
}

/**
 * returns payload if successful
 * throws error if verification failed
 */
export function verifyToken(payload: string) {
  return jwt.verify(payload, process.env.SSO_SECRET!);
}
