import { useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../services/api";

export const useClerkAuth = () => {
  const { getToken, isLoaded, clerk } = useAuth();

  const setupAuth = useCallback(async () => {
    try {
      const token = await getToken({ template: "code" });
      setAuthToken(token);
    } catch (error) {
      console.error("Error setting up auth token:", error);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) {
      setupAuth();
    }
  }, [isLoaded, setupAuth]);

  useEffect(() => {
    const handleSessionChange = () => {
      getToken({ template: "code" })
        .then((token) => setAuthToken(token))
        .catch((error) => console.error("Error updating token:", error));
    };

    // Listen for session changes
    const subscription = clerk.client.on('session_updated', handleSessionChange);

    // Initial token setup
    setupAuth();

    return () => {
      // Clean up the listener
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk.client, setupAuth]);
};