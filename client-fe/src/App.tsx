import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import Content from "./Content";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  async function init() {
    try {
      // check accessToken to see if it's still valid
      await axios.get("/authenticated");

      // no errors thrown? you are authenticated!
      setAuthenticated(true);
    } catch (error: any) {
      console.error(error);
      window.location.href = `http://localhost:4444?redirect_uri=${window.location.origin}`;
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {!authenticated ? (
        <div className="flex flex-col justify-center items-center h-screen gap-1">
          <div className="text-4xl">Verifying Credentials...</div>
        </div>
      ) : (
        <Content />
      )}
    </>
  );
}
