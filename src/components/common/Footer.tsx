"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted py-44  ">
      <div className="container mx-auto px-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PaletteAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
