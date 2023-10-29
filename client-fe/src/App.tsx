import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername("");
    const me = async () => {
      try {
        const res = await axios.get("/me");
        const { username } = res.data;
        setUsername(username);
      } catch (error: any) {
        if (isAxiosError(error)) {
          const errMsg = error.response?.data.message;
          console.error(errMsg);
        } else {
          console.error(error.message);
        }
      }
    };

    me();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen text-2xl">
        <div>You Are At SSO-Client-1</div>
        {username ? (
          <div>
            Logged In As <span className="font-bold">{username}</span>
          </div>
        ) : (
          <div>Unauthenticated</div>
        )}
      </div>
    </>
  );
}
