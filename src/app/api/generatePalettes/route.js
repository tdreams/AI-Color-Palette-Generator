import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Fallback colors for each emotion when API fails
const fallbackPalettes = {
  Calm: ["#E6EFF6", "#B8D1E5", "#92AFC7", "#6E8BA3"],
  Energetic: ["#FFE45C", "#FF6B6B", "#4ECDC4", "#45B7D1"],
  Mysterious: ["#2C3E50", "#8E44AD", "#2980B9", "#34495E"],
  Joyful: ["#FF9A8B", "#FF6B6B", "#4ECDC4", "#45B7D1"],
  Serene: ["#E8F3F1", "#CCECE6", "#99D8CF", "#66C3B8"],
};

const emotions = ["Calm", "Energetic", "Mysterious", "Joyful", "Serene"];

// Validate API key before initializing
const getGeminiClient = () => {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  return new GoogleGenerativeAI(apiKey);
};

function generateColorPsychology(emotion, colorType) {
  const psychologyData = {
    Calm: {
      meaning: "Creates a sense of tranquility and peace",
      associations: ["Relaxation", "Balance", "Serenity"],
    },
    Energetic: {
      meaning: "Stimulates activity and enthusiasm",
      associations: ["Vitality", "Movement", "Excitement"],
    },
    Mysterious: {
      meaning: "Evokes intrigue and depth",
      associations: ["Wonder", "Sophistication", "Drama"],
    },
    Joyful: {
      meaning: "Promotes happiness and positivity",
      associations: ["Happiness", "Optimism", "Warmth"],
    },
    Serene: {
      meaning: "Encourages mindfulness and clarity",
      associations: ["Peace", "Harmony", "Balance"],
    },
  };

  return {
    emotion,
    meaning: `${psychologyData[emotion].meaning} through ${colorType}`,
    associations: psychologyData[emotion].associations,
  };
}

function calculateAccessibility(colors) {
  const getContrastRatio = (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const primarySecondaryRatio = getContrastRatio(colors[0], colors[1]);

  return {
    contrast:
      primarySecondaryRatio > 4.5
        ? "High"
        : primarySecondaryRatio > 3
        ? "Medium"
        : "Low",
    colorBlindness: "Moderate",
    readability:
      primarySecondaryRatio > 7
        ? "Excellent"
        : primarySecondaryRatio > 4.5
        ? "Good"
        : "Fair",
    wcag: {
      normal:
        primarySecondaryRatio > 7
          ? "AAA"
          : primarySecondaryRatio > 4.5
          ? "AA"
          : "Below AA",
      large:
        primarySecondaryRatio > 4.5
          ? "AAA"
          : primarySecondaryRatio > 3
          ? "AA"
          : "Below AA",
    },
  };
}

async function generatePalette(emotion, prompt, model) {
  try {
    const promptText = `Generate a color palette of 4 hex codes for a ${emotion.toLowerCase()} mood based on: ${prompt}. Format: #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB`;
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = await response.text();

    const colorMatches = text.match(/#[A-Fa-f0-9]{6}/g) || [];
    return colorMatches.slice(0, 4);
  } catch (error) {
    console.warn(
      `Failed to generate palette for ${emotion}, using fallback:`,
      error
    );
    return fallbackPalettes[emotion];
  }
}

export async function POST(req) {
  try {
    const { prompt, mode, image } = await req.json();

    // Validate input
    if (mode === "prompt" && !prompt) {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }
    if (mode === "image" && !image) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      );
    }

    let genAI;
    try {
      genAI = getGeminiClient();
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error);
      // Generate fallback palettes instead of failing
      const palettes = emotions.map((emotion) => {
        const colors = fallbackPalettes[emotion];
        const colorTypes = ["Primary", "Secondary", "Accent", "Neutral"];
        const paletteColors = colors.map((hex, i) => ({
          name: `${emotion} ${colorTypes[i]}`,
          hex,
          rgb: `rgb(${parseInt(hex.slice(1, 3), 16)},${parseInt(
            hex.slice(3, 5),
            16
          )},${parseInt(hex.slice(5, 7), 16)})`,
          psychology: generateColorPsychology(
            emotion,
            colorTypes[i].toLowerCase()
          ),
        }));

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: `${emotion} ${prompt || "Palette"}`,
          emotion,
          colors: paletteColors,
          description: `A ${emotion.toLowerCase()} palette${
            prompt ? ` inspired by ${prompt}` : ""
          }`,
          accessibility: calculateAccessibility(colors),
        };
      });

      return NextResponse.json({
        palettes,
        warning: "Using fallback palettes due to API configuration issue",
      });
    }

    const model =
      mode === "image"
        ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" })
        : genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const palettes = await Promise.all(
      emotions.map(async (emotion) => {
        const colors = await generatePalette(emotion, prompt, model);
        const colorTypes = ["Primary", "Secondary", "Accent", "Neutral"];

        const paletteColors = colors.map((hex, i) => ({
          name: `${emotion} ${colorTypes[i]}`,
          hex,
          rgb: `rgb(${parseInt(hex.slice(1, 3), 16)},${parseInt(
            hex.slice(3, 5),
            16
          )},${parseInt(hex.slice(5, 7), 16)})`,
          psychology: generateColorPsychology(
            emotion,
            colorTypes[i].toLowerCase()
          ),
        }));

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: `${emotion} ${prompt || "Palette"}`,
          emotion,
          colors: paletteColors,
          description: `A ${emotion.toLowerCase()} palette${
            prompt ? ` inspired by ${prompt}` : ""
          }`,
          accessibility: calculateAccessibility(colors),
        };
      })
    );

    return NextResponse.json({ palettes });
  } catch (error) {
    console.error("Error generating palettes:", error);
    return NextResponse.json(
      {
        message: "Failed to generate palettes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
