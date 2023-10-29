import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [loginError, setLoginError] = useState();
  const [changeUsername, setChangeUsername] = useState(false);
  // const Cookies = require("js-cookie");

  const queryParams = new URLSearchParams(window.location.search);
  console.log(`queryParams: ${queryParams}`);

  const ssoCallbackUrl = queryParams.get("ssoCallbackUrl");
  console.log(`ssoCallbackUrl: ${ssoCallbackUrl}`);

  useEffect(() => {
    setLoggedInUsername("");

    const me = async () => {
      try {
        const res = await axios.get("/me");
        const { username } = res.data;
        setLoggedInUsername(username);
      } catch (error) {
        if (isAxiosError(error)) {
          const resError: any = error.response;
          setLoginError(resError.data.message);
        }
      }
    };

    me();
  }, []);

  const onUsernameChange = (event: any) => {
    setInputUsername(event.target.value);
  };

  const onLogin = async () => {
    if (!inputUsername || inputUsername.trim().length === 0) return;

    try {
      console.log(`sending queryParams: ${queryParams}`);

      const res = await axios.post(`/authenticate`, {
        username: inputUsername,
      });

      const { username, ssoToken } = res.data;

      if (ssoCallbackUrl) {
        window.location.href = `${ssoCallbackUrl}?ssoToken=${ssoToken}`;
        return;
      }

      setLoggedInUsername(username);
      setChangeUsername(false);
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  const onSignOut = async () => {
    await axios.post("/unauthenticate", {});
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <div className="text-4xl">SSO Server Login</div>
        {loggedInUsername && !changeUsername ? (
          <>
            <div className="text-2xl">
              Welcome, <span className="font-bold">{loggedInUsername}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => {
                  setChangeUsername(true);
                }}
                className="text-lg rounded-md px-4 py-2 bg-red-500 active:bg-red-800 text-white"
              >
                Change Username
              </button>
              <button
                onClick={onSignOut}
                className="text-lg rounded-md px-4 py-2 bg-blue-500 active:bg-blue-800 text-white"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center gap-1">
            <input
              type="text"
              className="rounded-md border border-gray py-2 px-4 text-2xl text-center"
              placeholder="Username"
              value={inputUsername}
              onChange={onUsernameChange}
            ></input>
            {!loginError ? null : (
              <>
                <div className="italic text-red-500">* {loginError}</div>
              </>
            )}
            <button
              onClick={onLogin}
              className="text-lg rounded-md px-4 py-2 bg-blue-500 active:bg-blue-800 text-white"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </>
  );
}
