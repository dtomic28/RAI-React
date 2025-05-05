import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

// Create the UserContext
export const UserContext = createContext();

// UserProvider component that wraps your app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to set user context (used after login)
  const setUserContext = (token) => {
    if (token == null) {
      // If token is null (e.g., logout), remove from localStorage and reset the user
      localStorage.removeItem("jwt");
      localStorage.removeItem("userId");
      setUser(null);
      console.log("Logged out");
    } else {
      try {
        // Save the token and user ID in localStorage for persistence
        localStorage.setItem('jwt', token);
        const decodedToken = jwtDecode(token);

        // Save the user ID separately in localStorage
        localStorage.setItem('userId', decodedToken.userId);

        // Set the user context with token and decoded ID
        setUser({ token, _id: decodedToken.userId });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };

  // Use useEffect to fetch the user data from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      setUser({ token, _id: userId });
    }
  }, []); // Only runs on initial load

  return (
    <UserContext.Provider value={{ user, setUserContext }}>
      {children}
    </UserContext.Provider>
  );
};
