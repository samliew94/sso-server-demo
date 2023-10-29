import { isAxiosError } from "axios";
import express, { NextFunction, Request, Response } from "express";
import { signSsoToken, verifySsoToken } from "./jwt-util";

const app = express();
const port = process.env.PORT || 4444;

const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log(`req cookies:`);
  console.log(req.cookies);

  console.log("api '/' called");

  // const { ssoCallbackUrl } = req.query;
  // console.log(`ssoCallbackUrl: ${ssoCallbackUrl}`);

  // const { ssoToken } = req.cookies;
  // console.log(`ssoToken: ${ssoToken}`);

  // if (ssoToken) {
  //   try {
  //     const decoded = verifySsoToken(ssoToken);
  //     const username = decoded.username;
  //     console.log(`username: ${username}`);
  //   } catch (error: any) {
  //     console.error(error.message);
  //     res.clearCookie("ssoToken");
  //   }
  // }

  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/authenticate", (req, res) => {
  const origin = req.get("Origin");

  const { username, ssoCallbackUrl } = req.body;

  if (!username) throw new Error("Invalid username");

  const ssoToken = signSsoToken({ username });

  // set ssoToken cookie in authServer
  res.cookie("ssoToken", ssoToken, { httpOnly: true });

  console.log(`authenticated: ${username}`);

  res.json({ username, ssoToken });
});

app.get("/verify", (req, res) => {
  const { ssoToken } = req.query;

  if (!ssoToken || typeof ssoToken !== "string")
    throw new Error("Invalid ssoToken");

  try {
    verifySsoToken(ssoToken);
    res.json();
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
});

app.get("/crazy", (req, res) => {
  const ck = req.cookies;
  console.log(`a foo`);
});

app.get("/me", (req, res) => {
  const { ssoToken } = req.cookies;

  if (!ssoToken) {
    return res.json();
  }

  const decoded = verifySsoToken(ssoToken);

  const { username } = decoded;

  res.json({ username });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (isAxiosError(err)) {
      const errRes: any = err.response;

      res.status(400).json({ message: errRes.message });
    } else {
      if (err.name === "TokenExpiredError") {
        res.clearCookie("ssoToken");
      }

      console.error(err.message);
      res.status(400).json({
        message: err.message,
      });
    }
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
