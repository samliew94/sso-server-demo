import axios, { isAxiosError } from "axios";
import express, { NextFunction, Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { CustomError } from "./custom-error";
import {
  signClientToken as signToken,
  verifyClientToken as verifyToken,
} from "./jwt-util";

const app = express();
const port = process.env.PORT || 5555;

const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/authenticated", async (req: Request, res: Response, next) => {
  // send accessToken over HTTPS
  const { accessToken, ssoToken } = req.cookies;

  try {
    verifyToken(accessToken);
    return res.json();
  } catch (error) {
    if (ssoToken) {
      try {
        await axios.post("http://localhost:4444/verify-sso-token", {
          ssoToken,
        });

        const decoded: any = jwtDecode(ssoToken);
        const { username, exp } = decoded;
        res.cookie("accessToken", signToken({ username, exp }), {
          httpOnly: true,
        });
        return res.json();
      } catch (error: any) {
        console.error(error.response?.data.message);
      }
    }

    return next(error);
  }
});

app.get("/me", (req: Request, res: Response, next) => {
  const { accessToken } = req.cookies;

  try {
    if (!accessToken) throw new CustomError(401, "Invalid Access Token");
    const decoded = verifyToken(accessToken);
    const { username } = decoded;
    res.json({ username });
  } catch (error: any) {
    return next(error);
  }
});

app.post(
  "/exchange-auth-code",
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;

    try {
      const promise = await axios.post(
        `http://localhost:4444/verify-auth-code`,
        {
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
        }
      );

      const { ssoToken } = promise.data;

      const payload: any = jwtDecode(ssoToken);

      const { username, exp } = payload;

      const accessToken = signToken({ username, exp });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        path: req.hostname + ":" + req.app.get("port"),
      });

      return res.json();
    } catch (error) {
      return next(error);
    }
  }
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (isAxiosError(err)) {
      console.error(err.response?.data.message);

      return res
        .status(err.response?.status ?? 401)
        .json({ message: err.response?.data.message });
    }

    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Server 1 running at http://localhost:${port}`);
});

app.listen(5556, () => {
  console.log(`Server 2 running at http://localhost:${5556}`);
});
