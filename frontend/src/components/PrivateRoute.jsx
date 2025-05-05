// src/components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext"; // Assuming you're using UserContext

const PrivateRoute = ({ element }) => {
  const { user } = useContext(UserContext);

  // If the user is not logged in, redirect to login page
  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return element;
};

export default PrivateRoute;
