import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

export default function Auth() {
  const { pathname } = useLocation(); 

  return (
    <div className="auth-page">
      <div className="clerk-wrapper">
        {pathname.startsWith("/sign-up") ? (
          <SignUp routing="path" path="/sign-up" />
        ) : (
          <SignIn routing="path" path="/sign-in" />
        )}
      </div>
    </div>
  );
}
