"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Palette } from "lucide-react";

interface HeaderProps {
  featuresRef: React.RefObject<HTMLElement>;
  howItWorksRef: React.RefObject<HTMLElement>;
}

const Header: React.FC<HeaderProps> = ({ featuresRef, howItWorksRef }) => {
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="p-6 flex justify-between items-center bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <Palette className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">PaletteAI</span>
      </div>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection(howItWorksRef)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How it works
            </button>
          </li>
          <li>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
