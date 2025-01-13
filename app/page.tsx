"use client";
import React, { useEffect, useState } from "react";
import SimliAgent from "@/app/SimliAgent";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(false);

  useEffect(() => {
    onStart();
  }, []);

  const onStart = () => {
    setShowDottedFace(false);
  };

  const onClose = () => {
    setShowDottedFace(true);
  };

  return (
    <main className="fixed inset-0 bg-black">
      <div className="relative w-screen h-screen">
        {showDottedFace && <DottedFace className="absolute inset-0 z-10" />}
        <SimliAgent
          onStart={onStart}
          onClose={onClose}
        />
      </div>
    </main>
  );
};

export default Demo;
