import type { JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

const GuestOnlyRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");

  if (token) {
    // If already logged in redirect to /calculator
    return <Navigate to="/calculator" replace />;
  }

  return children;
};

export default GuestOnlyRoute;
