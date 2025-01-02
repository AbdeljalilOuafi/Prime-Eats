import { useEffect, useCallback } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { setAuthToken } from "../services/api";

export const useClerkAuth = () => {
  const { getToken, isLoaded } = useAuth();
  const clerk = useClerk();

  // Wrap setupAuth in useCallback to memoize it
  const setupAuth = useCallback(async () => {
    try {
      const token = await getToken({ template: "code" });
      setAuthToken(token);
    } catch (error) {
      console.error("Error setting up auth token:", error);
    }
  }, [getToken]);

  // Fetch token when the component mounts or when isLoaded changes
  useEffect(() => {
    if (isLoaded) {
      setupAuth();
    }
  }, [isLoaded, setupAuth]);

  // Listen for session changes
  useEffect(() => {
    if (!clerk || !clerk.watchSession) return;

    const unsubscribe = clerk.watchSession((session) => {
      if (session) {
        setupAuth();
      }
    });

    // Cleanup the listener
    return () => {
      unsubscribe();
    };
  }, [clerk, setupAuth]);
};