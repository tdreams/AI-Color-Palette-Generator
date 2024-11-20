"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Wand2, ImageIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Palette } from "@/types/types";

interface PaletteGeneratorProps {
  onPalettesGenerated: (palettes: Palette[]) => void;
}

const PaletteGenerator: React.FC<PaletteGeneratorProps> = ({
  onPalettesGenerated,
}) => {
  const [inputMode, setInputMode] = useState<"prompt" | "image">("prompt");
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (inputMode === "prompt" && !prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to generate palettes.",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "image" && !uploadedImage) {
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
      // Optional: Implement real progress tracking with server support
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate palettes");
      }

      const data = await response.json();
      onPalettesGenerated(data.palettes);

      toast({
        title: "Success",
        description: "Color palettes generated successfully!",
      });
    } catch (error: any) {
      console.error("Error generating palettes:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to generate palettes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Generate Your Palette</h2>
      <div className="mb-8">
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
                required
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
                {isLoading ? "Generating..." : "Generate"}
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
                {isLoading ? "Extracting..." : "Extract Colors"}
              </Button>
            </div>
            {uploadedImage && (
              <div className="mb-4">
                <Image
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-40 rounded-md mx-auto sm:mx-0"
                  width={160}
                  height={160}
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
        {isLoading && <Progress value={progress} className="mt-4" />}
      </div>
    </section>
  );
};

export default PaletteGenerator;
