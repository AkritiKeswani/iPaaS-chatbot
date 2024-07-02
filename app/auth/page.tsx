"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Auth() {
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the user ID and create a session
    // For simplicity, we're just storing it in localStorage
    localStorage.setItem("userId", userId);
    router.push("/integrations");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your user ID"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
