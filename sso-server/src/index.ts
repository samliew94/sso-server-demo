import express, { NextFunction, Request, Response } from "express";
import { findByAuthCode } from "./auth-data";
import { CustomError } from "./custom-error";
import { signToken, verifyToken } from "./jwt-util";

const app = express();
const port = process.env.PORT || 4444;

const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/authenticated", (req, res, next) => {
  try {
    // how about just send client_id and client_secret?
    const { ssoToken } = req.cookies; // ssoToken cannot be access from remote API call, so what I still have to return an auth code?
    verifyToken(ssoToken);

    return res.json();

    // if the ssoToken is still valid, we simply redirect user back with code
  } catch (error: any) {
    return next(error);
  }
});

app.get("/me", (req, res) => {
  const { ssoToken } = req.cookies;

  if (!ssoToken) return res.json();

  let decoded: any;

  try {
    decoded = verifyToken(ssoToken);
  } catch (error) {
    res.clearCookie("ssoToken");
    throw error;
  }

  const { username } = decoded;

  return res.json({ username });
});

app.post("/authenticate", (req, res) => {
  const { username } = req.body;

  console.log(`authenticated ${username}`);

  const ssoToken = signToken({ username });
  res.cookie("ssoToken", ssoToken, { httpOnly: true }); // user is fully authenticated

  return res.json();
});

app.post("/verify-sso-token", (req, res, next) => {
  try {
    const { ssoToken } = req.body;
    verifyToken(ssoToken);
    return res.json();
  } catch (error) {
    return next(error);
  }
});

app.post("/verify-auth-code", async (req, res, next) => {
  try {
    const { client_id, client_secret, code } = req.body;

    const authData = findByAuthCode(code);

    const readFile = fs.readFileSync(
      path.join(__dirname, "../public/client-data.json"),
      "utf8"
    );

    const json = JSON.parse(readFile);

    if (!client_id || !client_secret)
      return next(
        new CustomError(401, "client_id or client_secret is undefined")
      );

    if (!json.hasOwnProperty(client_id))
      return next(new CustomError(401, "client_id not found"));

    if (json[client_id] !== client_secret)
      return next(new CustomError(401, "client_secret do not match"));

    const ssoToken = authData.ssoToken;
    return res.json({ ssoToken });
  } catch (error) {
    return next(error);
  }
});

app.get("/gen-client-secret", (req, res) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=<>?";
  let secretString = "";

  for (let i = 0; i < 24; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    secretString += characters[randomIndex];
  }

  return res.send(secretString);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err instanceof CustomError) {
      console.error(`${err.status} ${err.message}`);
      return res.status(err.status).json({ message: err.message });
    } else {
      console.error(`${err.message}`);
      return res.status(500).json({ message: err.message });
    }
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
