"use client";

import { Button } from "@/components/ui/button";
import { Heart, Info, Download, Share2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CollapsibleDescription from "../common/CollapsibleDescription";

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

interface PaletteCardProps {
  palette: Palette;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
  onCopyColor: (hex: string) => void;
  showAccessibility: boolean;
}

const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  isFavorite,
  onToggleFavorite,
  onSave,
  onShare,
  onDownload,
  onCopyColor,
  showAccessibility,
}) => {
  return (
    <Card className="overflow-hidden">
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
        <div className="text-base" style={{ color: palette.colors[2].hex }}>
          {palette.emotion}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-current text-red-500" : ""
              }`}
            />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More Info">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4 max-h-96 overflow-y-auto">
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
                      {/* Collapsible Description */}
                      <CollapsibleDescription color={color} />
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
                                : palette.accessibility.wcag.normal === "AA"
                                ? "text-yellow-600"
                                : "text-red-600"
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
                                : palette.accessibility.wcag.large === "AA"
                                ? "text-yellow-600"
                                : "text-red-600"
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

          {/* Save, Share, Download Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="hover:bg-background/20"
            aria-label="Save Palette"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="hover:bg-background/20"
            aria-label="Share Palette"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="hover:bg-background/20"
            aria-label="Download Palette"
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
              className="aspect-square rounded flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:opacity-80"
              style={{ backgroundColor: color.hex }}
              onClick={() => onCopyColor(color.hex)}
            >
              {color.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaletteCard;
