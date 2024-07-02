"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleDriveIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth");
    }
  }, [router]);

  const handleAuthentication = async () => {
    // Initiate Paragon OAuth flow for Google Drive
    // This is a placeholder - you'll need to use Paragon's SDK here
    const userId = localStorage.getItem("userId");
    const authUrl = `https://paragon.com/oauth/google-drive?userId=${userId}`;
    window.location.href = authUrl;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Google Drive Integration</h1>
      {isAuthenticated ? (
        <div>
          <p className="mb-4">Your Google Drive is connected!</p>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleAuthentication}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect to Google Drive
        </button>
      )}
    </div>
  );
}
