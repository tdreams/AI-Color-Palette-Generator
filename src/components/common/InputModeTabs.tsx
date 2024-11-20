import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, Loader2, Upload, Wand2 } from "lucide-react";
import { Label } from "../ui/label";
import Image from "next/image";

interface InputModeTabsProps {
  inputMode: "prompt" | "image";
  setInputMode: (mode: "prompt" | "image") => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
  handleImageUpload: (file: File) => void;
  uploadedImage?: string | null;
}

const InputModeTabs: React.FC<InputModeTabsProps> = ({
  inputMode,
  setInputMode,
  prompt,
  setPrompt,
  handleGenerate,
  isLoading,
  handleImageUpload,
  uploadedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Tabs
      value={inputMode}
      onValueChange={(value: string) =>
        setInputMode(value as "prompt" | "image")
      }
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
            className="w-full sm:w-auto flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
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
              onChange={onImageChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!uploadedImage || isLoading}
            className="w-full sm:w-auto flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Extract Colors
              </>
            )}
          </Button>
        </div>
        {uploadedImage && (
          <div className="mb-4">
            <Image
              src={uploadedImage}
              alt="Uploaded"
              className="max-h-40 rounded-md mx-auto sm:mx-0"
              width={160} // Adjust as needed
              height={160} // Adjust as needed
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InputModeTabs;
