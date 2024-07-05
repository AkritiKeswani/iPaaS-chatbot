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
      router.push("/"); // Redirect to the main page after login
    } else {
      alert("Please enter your User ID");
    }
  };

  // Rest of your login component code
}
