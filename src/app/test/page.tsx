"use client";

import React, { useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";

const Page = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [statusResponse, setStatusResponse] = useState<string | null>(null);
  // const { updateStatus } = useOnlineStatus();

  const testApiBatch = async () => {
    const dataRaw = ["user_31dlsNLyd3Xq95UloZjtmr8HkE0"];

    try {
      const response = await fetch("/api/user/status/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: dataRaw }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        setApiResponse(data);
      }
    } catch (error) {
      console.error("Failed to fetch friends status:", error);
    }
  };

  const testSetOffline = async () => {
    try {
      const response = await fetch("/api/test/user/status/offline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: "user_31dlsNLyd3Xq95UloZjtmr8HkE0" }),
      });

      if (response.ok) {
        const text = await response.text();
        setStatusResponse(text);
      }
    } catch (error) {
      console.error("Failed to set offline:", error);
    }
  };

  const testSetOnline = async () => {
    try {
      const response = await fetch("/api/test/user/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: "user_31dlsNLyd3Xq95UloZjtmr8HkE0" }),
      });

      if (response.ok) {
        const text = await response.text();
        console.log("Set Online Response:", text);
        setStatusResponse(text);
      }
    } catch (error) {
      console.error("Failed to set online:", error);
    }
  };

  const testDeleteStatus = async () => {
    try {
      const response = await fetch("/api/test/user/status", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: "user_31dlsNLyd3Xq95UloZjtmr8HkE0" }),
      });

      if (response.ok) {
        const text = await response.text();
        console.log("Delete Status Response:", text);
        setStatusResponse(text);
      }
    } catch (error) {
      console.error("Failed to delete status:", error);
    }
  };

  const testSendBeacon = () => {
    // Simulate what happens on page unload
    const blob = new Blob([JSON.stringify({ status: "offline" })], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/user/status", blob);
    console.log("SendBeacon sent");
    setStatusResponse("SendBeacon sent - check server logs");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Test Online Status</h1>

      <div className="flex gap-2">
        <button
          onClick={testApiBatch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Batch API
        </button>

        <button
          onClick={testSetOnline}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Set Online
        </button>

        <button
          onClick={testSetOffline}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Set Offline
        </button>

        <button
          onClick={testDeleteStatus}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete User Status
        </button>

        <button
          onClick={testSendBeacon}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Test SendBeacon
        </button>
      </div>

      {statusResponse && (
        <div className="mt-4">
          <h2 className="font-bold">Status Response:</h2>
          <pre className="bg-gray-100 p-2 rounded">{statusResponse}</pre>
        </div>
      )}

      {apiResponse && (
        <div className="mt-4">
          <h2 className="font-bold">Batch API Response:</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Page;
