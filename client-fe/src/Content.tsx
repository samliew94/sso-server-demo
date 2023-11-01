import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {
  const [curUsername, setCurUsername] = useState("");

  async function me() {
    try {
      const res = await axios.get("/me");
      const { username } = res.data;
      setCurUsername(username);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    me();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-1">
        <div className="text-4xl">This is {import.meta.env.VITE_APP_NAME}</div>
        <div className="text-4xl">
          Logged in as <span className="font-bold">{curUsername}</span>{" "}
        </div>
      </div>
    </>
  );
}
