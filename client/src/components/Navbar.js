import { Link } from "react-router-dom";
import "../styles/navbar.css";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from "@clerk/clerk-react";

export default function Navbar() {
  const { user } = useUser();

  return (
    <div className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <h2 className="logo">🏏 Criksy</h2>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/lobby">Multiplayer</Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <SignedOut>
          <Link to="/sign-in" className="auth-icon">👤</Link>
        </SignedOut>

        <SignedIn>
          <span className="username">
            Hi, {user?.firstName || user?.username}
          </span>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
