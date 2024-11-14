"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Info,
  Upload,
  Wand2,
  Download,
  Share2,
  Save,
  ImageIcon,
  Loader2,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";

import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface ColorPsychology {
  emotion: string;
  meaning: string;
  associations: string[];
}

interface Color {
  name: string;
  hex: string;
  rgb: string;
  psychology: ColorPsychology;
}

interface Palette {
  id: string;
  name: string;
  emotion: string;
  colors: Color[];
  description: string;
  accessibility: {
    contrast: string;
    colorBlindness: string;
    readability: string;
    wcag: {
      normal: string;
      large: string;
    };
  };
}

export default function ColorPaletteGenerator() {
  const [inputMode, setInputMode] = useState<"prompt" | "image">("prompt");
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  /* const [gradientOpacity, setGradientOpacity] = useState(0.5); */
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load saved palettes from localStorage
    const saved = localStorage.getItem("savedPalettes");
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }

    // Load favorites from localStorage
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

  const handleGenerate = async () => {
    if (!prompt && inputMode === "prompt") {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to generate palettes.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedImage && inputMode === "image") {
      toast({
        title: "Image Required",
        description: "Please upload an image to generate palettes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Simulate progress during API call
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/generatePalettes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          mode: inputMode,
          image: uploadedImage,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to generate palettes");
      }

      const data = await response.json();
      setPalettes(data.palettes);
      setProgress(100);

      toast({
        title: "Success",
        description: "Color palettes generated successfully!",
      });
    } catch (error) {
      console.error("Error generating palettes:", error);
      toast({
        title: "Error",
        description: "Failed to generate palettes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setInputMode("image");
      };
      reader.readAsDataURL(file);
    }
  };

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

  /* const swapColors = (paletteIndex: number) => {
    setPalettes((prev) => {
      const newPalettes = [...prev];
      const palette = { ...newPalettes[paletteIndex] };
      palette.colors = [...palette.colors].reverse();
      newPalettes[paletteIndex] = palette;
      return newPalettes;
    });
  };
 */
  const copyColorCode = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast({ title: "Copied", description: `${hex} copied to clipboard.` });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center sm:text-left">
          AI Color Palette Generator
        </h1>

        {/* Input Controls */}
        <Tabs
          value={inputMode}
          onValueChange={(value) => setInputMode(value as "prompt" | "image")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="prompt">Text Prompt</TabsTrigger>
            <TabsTrigger value="image">Upload Image</TabsTrigger>
          </TabsList>

          {/* Text Prompt Input */}
          <TabsContent value="prompt">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                placeholder="Enter a theme, mood, or concept (e.g., 'sunset beach', 'cyberpunk city', 'peaceful garden')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-grow"
                disabled={isLoading}
              />
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </TabsContent>

          {/* Image Upload Input */}
          <TabsContent value="image">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-grow">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedImage ? "Change Image" : "Upload Image"}
                  </div>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Extract Colors
              </Button>
            </div>
            {uploadedImage && (
              <div className="mb-4">
                <Image
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-40 rounded-md mx-auto sm:mx-0"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Accessibility Toggle */}
        <div className="flex items-center gap-2 mt-4">
          <Switch
            id="show-accessibility"
            checked={showAccessibility}
            onCheckedChange={setShowAccessibility}
          />
          <Label htmlFor="show-accessibility">
            Show Accessibility Information
          </Label>
        </div>

        {/* Progress Bar */}
        {progress > 0 && <Progress value={progress} className="mt-4" />}
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.map((palette, _) => (
          <Card key={palette.id} className="overflow-hidden">
            {/* Palette Header */}
            <CardHeader
              className="relative p-4"
              style={{ backgroundColor: palette.colors[0].hex }}
            >
              <CardTitle
                className="text-xl font-bold"
                style={{ color: palette.colors[1].hex }}
              >
                {palette.name}
              </CardTitle>
              <div
                className="text-base"
                style={{ color: palette.colors[2].hex }}
              >
                {palette.emotion}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(palette.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.has(palette.id) ? "fill-current" : ""
                    }`}
                  />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Color Details</h4>
                        {palette.colors.map((color, colorIndex) => (
                          <div key={colorIndex} className="mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div>
                                <div className="text-sm font-medium">
                                  {color.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {color.hex} | {color.rgb}
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 pl-6">
                              <p className="text-sm text-muted-foreground">
                                {color.psychology.meaning}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {color.psychology.associations.map(
                                  (association, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                                    >
                                      {association}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Accessibility Information */}
                      {showAccessibility && (
                        <div>
                          <h4 className="font-medium mb-2">Accessibility</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Contrast:</span>
                              <span className="font-medium">
                                {palette.accessibility.contrast}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Color Blindness:</span>
                              <span className="font-medium">
                                {palette.accessibility.colorBlindness}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Readability:</span>
                              <span className="text-sm font-medium">
                                {palette.accessibility.readability}
                              </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="text-sm font-medium mb-1">
                                WCAG Compliance
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Normal Text:</span>
                                <span
                                  className={`text-sm font-medium ${
                                    palette.accessibility.wcag.normal === "AAA"
                                      ? "text-green-600"
                                      : "text-amber-600"
                                  }`}
                                >
                                  {palette.accessibility.wcag.normal}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Large Text:</span>
                                <span
                                  className={`text-sm font-medium ${
                                    palette.accessibility.wcag.large === "AAA"
                                      ? "text-green-600"
                                      : "text-amber-600"
                                  }`}
                                >
                                  {palette.accessibility.wcag.large}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Swap and Save Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => savePalette(palette)}
                  className="hover:bg-background/20"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => sharePalette(palette)}
                  className="hover:bg-background/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadPalette(palette)}
                  className="hover:bg-background/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Palette Colors */}
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyColorCode(color.hex)}
                  >
                    {color.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
