var jwt = require("jsonwebtoken");
require("dotenv").config();

export function signSsoToken(payload: any) {
  const token = jwt.sign(payload, process.env.SSO_SECRET!, {
    expiresIn: "10s",
  });
  return token;
}

/**
 * either returns {error} or decoded jwt
 */
export function verifySsoToken(payload: string) {
  try {
    return jwt.verify(payload, process.env.SSO_SECRET!);
  } catch (error) {
    throw error;
  }
}
