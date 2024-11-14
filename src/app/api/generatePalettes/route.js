// /api/generatePalettes.js

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pLimit from "p-limit";
import Redis from "ioredis";

// Initialize Redis client using environment variable
const redis = new Redis(process.env.REDIS_URL, {
  tls: {}, // Enable TLS for secure connection
});

// Handle Redis connection errors gracefully
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Fallback colors for each emotion when API fails or emotion is not supported
const fallbackPalettes = {
  Calm: ["#E6EFF6", "#B8D1E5", "#92AFC7", "#6E8BA3", "#5A9BD5"],
  Energetic: ["#FFE45C", "#FF6B6B", "#4ECDC4", "#45B7D1", "#F9AFAE"],
  Mysterious: ["#2C3E50", "#8E44AD", "#2980B9", "#34495E", "#5D6D7E"],
  Joyful: ["#FF9A8B", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFD700"],
  Serene: ["#E8F3F1", "#CCECE6", "#99D8CF", "#66C3B8", "#5BC0EB"],
  Love: ["#FFB6C1", "#DB7093", "#C71585", "#FF69B4", "#FF1493"],
};

// Utility function to add jitter to the delay
function getJitteredDelay(baseDelay) {
  const jitterFactor = 0.5; // 50% jitter
  const min = baseDelay * (1 - jitterFactor);
  const max = baseDelay * (1 + jitterFactor);
  return Math.random() * (max - min) + min;
}

// Caching functions using Redis
const getCachedEmotions = async (key) => {
  try {
    const data = await redis.get(`emotionCache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cached emotions for key ${key}:`, error);
    return null; // Proceed without cached data
  }
};

const setCachedEmotions = async (key, value) => {
  try {
    await redis.set(`emotionCache:${key}`, JSON.stringify(value), "EX", 3600); // 1-hour TTL
  } catch (error) {
    console.error(`Error setting cached emotions for key ${key}:`, error);
    // Proceed without caching
  }
};

const getCachedPsychology = async (key) => {
  try {
    const data = await redis.get(`psychologyCache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cached psychology for key ${key}:`, error);
    return null;
  }
};

const setCachedPsychology = async (key, value) => {
  try {
    await redis.set(
      `psychologyCache:${key}`,
      JSON.stringify(value),
      "EX",
      3600
    ); // 1-hour TTL
  } catch (error) {
    console.error(`Error setting cached psychology for key ${key}:`, error);
    // Proceed without caching
  }
};

// Validate and initialize Gemini AI client
const getGeminiClient = () => {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  return new GoogleGenerativeAI(apiKey);
};

// Sanitize user input to prevent injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim();
};

// Generate emotions dynamically using the AI model
async function generateEmotions(emotionPrompt, model) {
  const cached = await getCachedEmotions(emotionPrompt);
  if (cached) return cached;

  try {
    const promptText = `${emotionPrompt}. List 6 distinct emotions suitable for generating color palettes, separated by commas.`;
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = await response.text();

    const emotionMatches = text.match(/([A-Z][a-z]+)/g);
    if (!emotionMatches) {
      throw new Error("No emotions found in the response");
    }

    const emotions = [
      ...new Set(emotionMatches.map((emotion) => emotion.trim())),
    ].slice(0, 6); // Limit to 6 emotions

    await setCachedEmotions(emotionPrompt, emotions);
    return emotions;
  } catch (error) {
    console.warn("Failed to generate emotions, using default emotions:", error);
    const defaultEmotions = [
      "Calm",
      "Energetic",
      "Mysterious",
      "Joyful",
      "Serene",
      "Love",
    ];
    await setCachedEmotions(emotionPrompt, defaultEmotions);
    return defaultEmotions;
  }
}

// Generate color psychology data dynamically using AI model with caching and retry logic
async function generateColorPsychology(emotion, colorType, model) {
  const cacheKey = `${emotion}_${colorType}`;
  const cached = await getCachedPsychology(cacheKey);
  if (cached) return cached;

  const psychologyPrompt = `Describe the psychological impact and associations of a ${colorType} color that evokes a ${emotion.toLowerCase()} mood. Provide a brief meaning, three associations, and one sentence on how the color could be applied in design.`;

  const maxRetries = 3;
  let attempt = 0;
  let baseDelay = 1000; // Start with 1 second

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(psychologyPrompt);
      const response = await result.response;
      const text = await response.text();

      // Split the response into parts and ensure all parts are present
      const parts = text
        .split(".")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length < 5) {
        throw new Error("Incomplete psychology data received from AI.");
      }

      const [meaning, association1, association2, association3, application] =
        parts;

      const psychologyData = {
        emotion,
        meaning: `${meaning} through ${colorType}`,
        associations: [association1, association2, association3],
        application,
      };

      await setCachedPsychology(cacheKey, psychologyData);
      return psychologyData;
    } catch (error) {
      if (error.status === 429) {
        console.warn(
          `Rate limited when generating psychology data for ${emotion}. Retrying in ${baseDelay}ms...`
        );
        const jitteredDelay = getJitteredDelay(baseDelay);
        await new Promise((res) => setTimeout(res, jitteredDelay));
        attempt += 1;
        baseDelay *= 2; // Exponential backoff
      } else {
        console.warn(
          `Failed to generate psychology data for ${emotion}:`,
          error
        );
        const fallbackData = {
          emotion,
          meaning: `General ${colorType} color psychology for ${emotion}`,
          associations: [
            "General association 1",
            "General association 2",
            "General association 3",
          ],
          application: "General design application",
        };
        await setCachedPsychology(cacheKey, fallbackData);
        return fallbackData;
      }
    }
  }

  console.warn(
    `Exceeded max retries for generating psychology data for ${emotion}. Using fallback.`
  );
  const fallbackData = {
    emotion,
    meaning: `General ${colorType} color psychology for ${emotion}`,
    associations: [
      "General association 1",
      "General association 2",
      "General association 3",
    ],
    application: "General design application",
  };
  await setCachedPsychology(cacheKey, fallbackData);
  return fallbackData;
}

// Calculate accessibility based on WCAG guidelines
function calculateAccessibility(colors) {
  const getContrastRatio = (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      // Calculate relative luminance
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // Calculate contrast ratios for all unique color pairs
  const contrastRatios = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      contrastRatios.push(getContrastRatio(colors[i], colors[j]));
    }
  }

  // Calculate average contrast ratio
  const averageContrast =
    contrastRatios.reduce((a, b) => a + b, 0) / contrastRatios.length;

  return {
    contrast:
      averageContrast > 4.5 ? "High" : averageContrast > 3 ? "Medium" : "Low",
    colorBlindness: "Moderate", // Placeholder; consider implementing a real check
    readability:
      averageContrast > 7
        ? "Excellent"
        : averageContrast > 4.5
        ? "Good"
        : "Fair",
    wcag: {
      normal:
        averageContrast > 7 ? "AAA" : averageContrast > 4.5 ? "AA" : "Below AA",
      large:
        averageContrast > 4.5 ? "AAA" : averageContrast > 3 ? "AA" : "Below AA",
    },
  };
}

// Generate a color palette for a given emotion
async function generatePalette(emotion, prompt, model, paletteSize = 5) {
  const palettePrompt = `Generate a color palette of ${paletteSize} hex codes for a ${emotion.toLowerCase()} mood based on: ${prompt}. Format: #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB, #RRGGBB`;

  const maxRetries = 3;
  let attempt = 0;
  let baseDelay = 1000; // Start with 1 second

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(palettePrompt);
      const response = await result.response;
      const text = await response.text();

      const colorMatches = text.match(/#[A-Fa-f0-9]{6}/g) || [];
      if (colorMatches.length < paletteSize) {
        throw new Error(`Insufficient colors generated for ${emotion}`);
      }
      return colorMatches.slice(0, paletteSize);
    } catch (error) {
      if (error.status === 429) {
        console.warn(
          `Rate limited when generating palette for ${emotion}. Retrying in ${baseDelay}ms...`
        );
        const jitteredDelay = getJitteredDelay(baseDelay);
        await new Promise((res) => setTimeout(res, jitteredDelay));
        attempt += 1;
        baseDelay *= 2; // Exponential backoff
      } else {
        console.warn(
          `Failed to generate palette for ${emotion}, using fallback:`,
          error
        );
        return (
          fallbackPalettes[emotion] || generateDefaultFallback(paletteSize)
        );
      }
    }
  }

  console.warn(
    `Exceeded max retries for generating palette for ${emotion}. Using fallback.`
  );
  return fallbackPalettes[emotion] || generateDefaultFallback(paletteSize);
}

// Provide a generic fallback palette
function generateDefaultFallback(paletteSize) {
  const colors = [];
  for (let i = 0; i < paletteSize; i++) {
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`; // Ensure hex code is 6 characters
    colors.push(randomColor);
  }
  return colors;
}

// Main POST handler
export async function POST(req) {
  try {
    const {
      prompt,
      mode,
      image,
      emotionPrompt,
      userEmotions,
      paletteSize = 5,
    } = await req.json();

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

    // Sanitize inputs
    const safePrompt = sanitizeInput(prompt);
    const safeEmotionPrompt = sanitizeInput(emotionPrompt);

    // Initialize Gemini AI client
    let genAI;
    try {
      genAI = getGeminiClient();
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error);
      return NextResponse.json(
        {
          message:
            "Internal Server Error: Gemini client initialization failed.",
        },
        { status: 500 }
      );
    }

    // Select the appropriate model based on mode
    const model =
      mode === "image"
        ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" })
        : genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Limit the number of concurrent psychology data requests
    const limit = pLimit(2); // Adjust based on your needs

    // Determine the list of emotions to use
    let emotions;
    if (
      userEmotions &&
      Array.isArray(userEmotions) &&
      userEmotions.length > 0
    ) {
      emotions = userEmotions
        .map((emotion) => sanitizeInput(emotion))
        .filter((emotion) => emotion);
      if (emotions.length === 0) {
        emotions = await generateEmotions(
          safeEmotionPrompt || "Provide a list of 6 emotions",
          model
        );
      }
    } else {
      emotions = await generateEmotions(
        safeEmotionPrompt || "Provide a list of 6 emotions",
        model
      );
    }

    // Generate palettes for each emotion
    const palettes = await Promise.all(
      emotions.map(async (emotion) => {
        const colors = await generatePalette(
          emotion,
          safePrompt,
          model,
          paletteSize
        );
        const colorTypes = [
          "Primary",
          "Secondary",
          "Accent",
          "Neutral",
          "Highlight",
        ];

        // Generate psychology data with concurrency limit
        const paletteColors = await Promise.all(
          colors.map((hex, i) =>
            limit(() =>
              generateColorPsychology(
                emotion,
                colorTypes[i].toLowerCase(),
                model
              ).then((psychology) => ({
                name: `${emotion} ${colorTypes[i]}`,
                hex,
                rgb: `rgb(${parseInt(hex.slice(1, 3), 16)},${parseInt(
                  hex.slice(3, 5),
                  16
                )},${parseInt(hex.slice(5, 7), 16)})`,
                psychology,
              }))
            )
          )
        );

        return {
          id: Math.random().toString(36).substr(2, 9),
          name: `${emotion} ${safePrompt || "Palette"}`,
          emotion,
          colors: paletteColors,
          description: `A ${emotion.toLowerCase()} palette${
            safePrompt ? ` inspired by ${safePrompt}` : ""
          }`,
          accessibility: calculateAccessibility(colors),
        };
      })
    );

    return NextResponse.json({ palettes });
  } catch (error) {
    console.error("Error generating palettes:", error);
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    return NextResponse.json(
      { message: "Failed to generate palettes", error: message },
      { status }
    );
  }
}
