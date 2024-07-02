"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { paragonClient } from "../../../utils/paragonClient";

export default function SlackIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth");
    } else {
      checkAuthStatus(userId);
    }
  }, [router]);

  const checkAuthStatus = async (userId: string) => {
    try {
      const status = await paragonClient.checkIntegrationStatus(
        userId,
        "slack",
      );
      setIsAuthenticated(status.isAuthenticated);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setError("Failed to check authentication status");
    }
  };

  const handleAuthentication = async () => {
    setIsLoading(true);
    setError(null);
    const userId = localStorage.getItem("userId");

    try {
      // This should open the Slack OAuth flow
      const authUrl = await paragonClient.getSlackAuthUrl(userId);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Authentication failed:", error);
      setError("Failed to authenticate with Slack");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Slack Integration</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isAuthenticated ? (
        <p className="mb-4">Your Slack workspace is connected!</p>
      ) : (
        <button
          onClick={handleAuthentication}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? "Connecting..." : "Connect to Slack"}
        </button>
      )}
    </div>
  );
}
