"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [userID, setUserId] = useState("");
  // const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your authentication logic here
    if (userID) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/chat"); // Redirect to the chat page after login
    } else {
      alert("Please enter both userID");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleLogin}
        className="p-6 bg-gray-100 rounded shadow-md"
      >
        <input
          type="text"
          value={userID}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="w-full p-2 mb-4 border rounded"
        />
        {/* <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        /> */}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
