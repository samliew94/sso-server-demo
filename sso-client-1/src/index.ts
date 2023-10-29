import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import { CustomError } from "./custom-error";
import { decodeJwt, signClientToken, verifyClientToken } from "./jwt-util";

const app = express();
const port = process.env.PORT || 5555;

const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:4444",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   })
// );

/**
 * ALL Requests to the client will require authentication
 */
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const { ssoToken } = req.query;
  const { accessToken } = req.cookies;

  // accessToken expires the same time as ssoToken

  if (!accessToken) {
    // accessToken not found. Check if already authenticated on sso-server
    try {
      let verifyUrl = "http://localhost:4444/verify";
      if (ssoToken && typeof ssoToken === "string") {
        verifyUrl += `?ssoToken=${ssoToken}`;
      }

      console.log(`verifyUrl: ${verifyUrl}`);

      await axios.get(verifyUrl);

      // user is still authenticated ont eh sso-server
      // retrieve the token and make our own for sso-client
      // const ssoToken = axiosRes.data;

      const { username, exp } = decodeJwt(ssoToken);
      const newAccessToken = signClientToken({ username, exp });
      console.log(`newAccessToken:`);
      console.log(newAccessToken);

      res.cookie("accessToken", newAccessToken);
      next();
    } catch (error) {
      // if verification failed on sso-server, user is 100% unauthenticated
      // redirect them to login page
      next(new CustomError(401, "Authentication failed on sso-server"));
    }
  } else {
    // accessToken is found on cookie. Let's try to verify it
    try {
      verifyClientToken(accessToken);
      // accessToken is valid, user remains authenticated
      next();
    } catch (error) {
      // the accessToken verification failed
      // 1 possible cause is taht the accessToken has expired.
      // note that the expiry date 'exp' should be the same as the sso

      // clear the cookie
      res.clearCookie("accessToken");

      next(
        new CustomError(401, "Access Token found on sso-client but has expired")
      );
    }
  }
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/me", (req: Request, res: Response) => {
  const { accessToken } = req.cookies;

  try {
    if (!accessToken) throw new CustomError(401, "Invalid Access Token");
    const decoded = verifyClientToken(accessToken);
    const { username } = decoded;
    res.json({ username });
  } catch (error: any) {
    console.error(error.message);
    res.status(401);
  }
});

app.get("/authenticated", (req: Request, res: Response) => {
  const { ssoToken } = req.query;

  if (!ssoToken) {
    //TBD
  } else {
    const { username, iat, exp } = decodeJwt(ssoToken);

    const clientAccessToken = signClientToken({
      username,
      exp,
    });

    res.cookie("accessToken", clientAccessToken);
    res.redirect("/");
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(err.message);

    if (err instanceof CustomError) {
      const status = err.status;
      if (status === 401) {
        // after authenticated, come back to 5555
        res.clearCookie("accessToken");
        res.redirect(
          `http://localhost:4444?ssoCallbackUrl=http://localhost:5555`
        );
        // next();
      }
      return;
    }

    res.status(400).json({ message: err.message });
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
