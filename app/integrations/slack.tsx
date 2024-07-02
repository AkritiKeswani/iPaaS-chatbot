"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (code && state) {
        // Here you would typically exchange the code for tokens
        // using Paragon's SDK or API
        console.log("Received auth code:", code);

        // Store the tokens securely (this is a placeholder)
        localStorage.setItem("authTokens", JSON.stringify({ code, state }));

        // Redirect back to the integrations page
        router.push("/integrations");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return <div>Processing authentication...</div>;
}
