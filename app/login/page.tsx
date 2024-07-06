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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userID}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 w-full"
          >
            <span className="text-lg">Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
