"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { paragon } from "@useparagon/connect";

export default function Login() {
  const router = useRouter();
  const [userID, setUserId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userID) {
      setError("Please enter your User ID");
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userID }),
      });

      const data = await response.json();

      if (data.success) {

        console.log("Login successful", data.user, data.token)

        // Authenticate with Paragon using the received token
        try {
          await paragon.authenticate(
            "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
            data.token
          );
          console.log("Paragon authentication with user token successful");
        } catch (error) {
          console.error("Error during Paragon authentication with user token:", error);
          setError("Error authenticating with Paragon");
          return;
        }

        // Redirect to chat page
        router.push("/chat");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="integration-button w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}