"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [userID, setUserId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userID) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/chat");
    } else {
      alert("Please enter your User ID");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-integration">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-integration">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-integration mb-1"
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userID}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="integration-button w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
