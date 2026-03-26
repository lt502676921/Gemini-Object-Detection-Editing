export enum MultimodalModel {
  GEMINI_2_5_FLASH = "gemini-2.5-flash",
  GEMINI_2_5_PRO = "gemini-2.5-pro",
  GEMINI_3_FLASH_PREVIEW = "gemini-3-flash-preview",
  GEMINI_3_1_PRO_PREVIEW = "gemini-3.1-pro-preview",
  DEFAULT = "gemini-3-flash-preview",
}

export enum ImageModel {
  GEMINI_2_5_FLASH_IMAGE = "gemini-2.5-flash-image",
  GEMINI_3_PRO_IMAGE_PREVIEW = "gemini-3-pro-image-preview",
  GEMINI_3_1_FLASH_IMAGE_PREVIEW = "gemini-3.1-flash-image-preview",
  DEFAULT = "gemini-2.5-flash-image",
}

export type Model = MultimodalModel | ImageModel;

export interface ThinkingConfig {
  thinkingBudget?: number;
  thinkingLevel?: ThinkingLevel;
  includeThoughts?: boolean;
}

export enum ThinkingLevel {
  MINIMAL = "MINIMAL",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface GenerateContentConfig {
  thinkingConfig?: ThinkingConfig;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  topP?: number;
  seed?: number;
  responseModalities?: string[];
}

export enum PartMediaResolutionLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface DetectedObject {
  box_2d: [number, number, number, number]; // [y1, x1, y2, x2] normalized, or [x1, y1, x2, y2] pixel
  caption: string;
  label: string;
}
export enum WorkflowStep {
  SOURCE = "SOURCE",
  CROPPED = "CROPPED",
  RESTORED = "RESTORED",
  COLORIZED = "COLORIZED",
  CINEMATIZED = "CINEMATIZED",
}

export interface VisualObjectWorkflow {
  sourceImage: {
    url: string;
    width: number;
    height: number;
    base64?: string;
    mimeType?: string;
  };
  detectedObjects: DetectedObject[];
  imagesByStep: Partial<Record<WorkflowStep, string[]>>;
}

export interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
}

export enum FinishReason {
  STOP = "STOP",
  MAX_TOKENS = "MAX_TOKENS",
  SAFETY = "SAFETY",
  RECITATION = "RECITATION",
  OTHER = "OTHER",
}

export interface GenerateContentResponse {
  usageMetadata?: UsageMetadata;
  candidates?: Array<{
    finishReason: FinishReason;
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  text?: () => string;
  parsed?: any;
}
