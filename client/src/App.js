import React from "react";
import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Games from "./pages/Games";
import GridGame from "./pages/GridGame";
import RoomLobby from "./pages/RoomLobby";
import GameRoom from "./multiplayer/GameRoom";
import SoloGame from "./pages/SoloGame";
import Auth from "./pages/auth";
import Footer from "./components/footer";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/grid" element={<GridGame />} />
        <Route path="/solo" element={<SoloGame />} />
        <Route
          path="/lobby"
          element={
            <>
              <SignedIn>
                <RoomLobby />
              </SignedIn>
              <SignedOut>
                <div className="page center">
                  <div className="login-required">
                    <h2>🔐 Multiplayer requires login</h2>
                    <a href="/sign-in" className="login-continue">
                      Login to Continue
                    </a>
                  </div>
                </div>
              </SignedOut>
            </>
          }
        />

        <Route
          path="/room/:roomId"
          element={
            <>
              <SignedIn>
                <GameRoom />
              </SignedIn>
              <SignedOut>
                <div className="page center">
                  <div className="login-required">
                    <h2>🔐 Multiplayer requires login</h2>
                    <a href="/sign-in" className="login-continue">
                      Login to Continue
                    </a>
                  </div>
                </div>
              </SignedOut>
            </>
          }
        />
        <Route path="/sign-in/*" element={<Auth />} />
        <Route path="/sign-up/*" element={<Auth />} />
      </Routes>
      <Footer />
    </>
  );
}
