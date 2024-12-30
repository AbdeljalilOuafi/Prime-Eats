import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../services/api";

export const useClerkAuth = () => {
    const { getToken } = useAuth();
  
    useEffect(() => {
      const setupAuth = async () => {
        try {
          const token = await getToken();
          console.log('Token received from Clerk:', token ? 'Token exists' : 'No token');
          setAuthToken(token);
        } catch (error) {
          console.error("Error setting up auth token:", error);
        }
      };
      
      setupAuth();
      console.log('useClerkAuth effect ran');
    }, [getToken]);
  };