"use client";

import { useRef, useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Hero from "@/components/hero/Hero";
import Features from "@/components/features/Features";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import PaletteGenerator from "@/components/palette-generator/PaletteGenerator";
import PaletteCard from "@/components/palette-generator/PaletteCard";

import { toast } from "@/hooks/use-toast"; // Ensure toast is imported if used here
import { Palette } from "@/types/types";

export default function HomePage() {
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

  // State to hold generated palettes
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Load saved palettes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedPalettes");
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }

    const savedFavorites = localStorage.getItem("favoritePalettes");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "favoritePalettes",
      JSON.stringify(Array.from(favorites))
    );
  }, [favorites]);

  // Handler to update palettes from PaletteGenerator
  const handlePalettesUpdate = (newPalettes: Palette[]) => {
    setPalettes(newPalettes);
  };

  // Handlers for favorite functionality
  const toggleFavorite = (paletteId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(paletteId)) {
        newFavorites.delete(paletteId);
      } else {
        newFavorites.add(paletteId);
      }
      return newFavorites;
    });
  };

  // Handlers for saving, sharing, downloading palettes
  const savePalette = (palette: Palette) => {
    setSavedPalettes((prev) => {
      const newSavedPalettes = [...prev, palette];
      localStorage.setItem("savedPalettes", JSON.stringify(newSavedPalettes));
      return newSavedPalettes;
    });
    toast({
      title: "Palette Saved",
      description: `The palette "${palette.name}" has been saved to your collection.`,
    });
  };

  const sharePalette = (palette: Palette) => {
    const url = `${window.location.origin}?palette=${encodeURIComponent(
      JSON.stringify(palette)
    )}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to your clipboard.",
    });
  };

  const downloadPalette = (palette: Palette) => {
    const data = JSON.stringify(palette, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${palette.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Download Started",
      description: "Your palette file is being downloaded.",
    });
  };

  const copyColorCode = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast({ title: "Copied", description: `${hex} copied to clipboard.` });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <Header featuresRef={featuresRef} howItWorksRef={howItWorksRef} />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <Hero />

        {/* Palette Generator Section */}
        <PaletteGenerator onPalettesGenerated={handlePalettesUpdate} />

        {/* Palette Cards Section */}

        {/* Conditionally render Features and HowItWorks if no palettes are present */}
        {palettes.length === 0 && (
          <>
            {/* Features Section */}
            <Features ref={featuresRef} />

            {/* How It Works Section */}
            <HowItWorks ref={howItWorksRef} />
          </>
        )}

        {palettes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {palettes.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                isFavorite={favorites.has(palette.id)}
                onToggleFavorite={() => toggleFavorite(palette.id)}
                onSave={() => savePalette(palette)}
                onShare={() => sharePalette(palette)}
                onDownload={() => downloadPalette(palette)}
                onCopyColor={copyColorCode}
                showAccessibility={showAccessibility}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
