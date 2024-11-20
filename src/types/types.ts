export interface ColorPsychology {
  emotion: string;
  meaning: string;
  associations: string[];
}

export interface Color {
  name: string;
  hex: string;
  rgb: string;
  psychology: ColorPsychology;
}

export interface Palette {
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
