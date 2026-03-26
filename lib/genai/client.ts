import { GoogleGenAI } from "@google/genai";
import { 
  MultimodalModel, 
  ImageModel, 
  Model, 
  GenerateContentConfig, 
  GenerateContentResponse,
  ThinkingConfig,
  ThinkingLevel,
  FinishReason
} from './types';

// The @google/genai SDK usage
// No global client to avoid using process.env.GOOGLE_API_KEY

const DEFAULT_MAX_ATTEMPTS = 7;
const BASE_WAIT_SECONDS = 10;
const WAIT_INCREMENT = 1;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core content generation function with retry logic.
 */
export async function generateContent(
  contents: any[] | string,
  model: Model,
  config?: GenerateContentConfig,
  shouldDisplayResponseInfo: boolean = false,
  apiKey?: string
): Promise<GenerateContentResponse | null> {
  if (!apiKey) {
    throw new Error("No Gemini API Key provided. Please configure it in the settings.");
  }
  const activeClient = new GoogleGenAI({ apiKey });
  let attempt = 1;

  while (attempt <= DEFAULT_MAX_ATTEMPTS) {
    try {
      console.log(`📡 SDK Request [Attempt ${attempt}]...`);
      const contentParts = (Array.isArray(contents) ? contents : [contents]).map(part => 
        typeof part === 'string' ? { text: part } : part
      );
      
      const response = await activeClient.models.generateContent({
        model: model as string,
        contents: [{ role: 'user', parts: contentParts }],
        config: config ? {
          temperature: config.temperature,
          topP: config.topP,
          candidateCount: 1,
          responseMimeType: config.responseMimeType,
          responseSchema: config.responseSchema,
          thinkingConfig: config.thinkingConfig as any,
        } : undefined,
      });
      console.log(`✨ SDK Response Success [Attempt ${attempt}]`);

      if (shouldDisplayResponseInfo) {
        displayResponseInfo(response, config);
      }
      
      // Adaptation layer for the standard interface
      let parsed = (response as any).parsed;
      if (!parsed && config?.responseMimeType === "application/json") {
        try {
          const text = (response as any).text || "";
          if (text) parsed = JSON.parse(text);
        } catch (e) {
          console.warn("⚠️ Failed to parse JSON response:", e);
        }
      }

      const formattedResponse: GenerateContentResponse = {
        usageMetadata: response.usageMetadata,
        candidates: response.candidates?.map((c: any) => ({
          finishReason: c.finishReason as unknown as FinishReason,
          content: c.content
        })),
        text: () => (response as any).text || "",
        parsed: parsed
      };

      return formattedResponse;

    } catch (err: any) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (shouldRetryRequest(err, attempt)) {
        const retryInfo = extractRetryInfo(err);
        const waitTime = retryInfo ? retryInfo.delayMs : (BASE_WAIT_SECONDS + (attempt - 1) * WAIT_INCREMENT) * 1000;
        console.log(`🔄 Retrying in ${waitTime / 1000}s...`);
        await sleep(waitTime);
        attempt++;
      } else {
        throw err;
      }
    }
  }

  return null;
}

/**
 * Determines if the request should be retried based on the error.
 */
function shouldRetryRequest(err: any, attempt: number): boolean {
  if (attempt >= DEFAULT_MAX_ATTEMPTS) return false;

  const errorCode = err.code || err.status;
  const message = err.message || "";

  if (errorCode === 429) {
    console.warn("⚠️ Rate limit exceeded (429).");
    return true;
  }
  if (errorCode === 400 && message.includes(" try again ")) return true;

  return false;
}

/**
 * Extracts retry delay from error details if available.
 */
function extractRetryInfo(err: any): { delayMs: number } | null {
  const details = err.details || [];
  for (const detail of details) {
    if (detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && detail.retryDelay) {
      // Format: "29s" or "29.4s"
      const seconds = parseFloat(detail.retryDelay.replace('s', ''));
      if (!isNaN(seconds)) {
        return { delayMs: Math.ceil(seconds * 1000) + 500 }; // Add small buffer
      }
    }
  }
  return null;
}

/**
 * Image generation and editing model helper.
 */
export async function generateImage(
  sources: any[],
  prompt: string,
  model: ImageModel,
  config?: GenerateContentConfig,
  apiKey?: string
): Promise<any | null> {
  const contents = [...sources, prompt.trim()];
  const response = await generateContent(contents, model, config, false, apiKey);
  return checkGetOutputImageFromResponse(response);
}

/**
 * Extracts the image from the GenAI response.
 */
export function checkGetOutputImageFromResponse(response: GenerateContentResponse | null): any | null {
  if (!response) {
    console.error("❌ No response");
    return null;
  }
  if (!response.candidates || response.candidates.length === 0) {
    console.error("❌ No response.candidates");
    return null;
  }

  const content = response.candidates[0].content;
  if (!content || !content.parts) {
    console.error("❌ No content parts found");
    return null;
  }

  // Find the first image part
  for (const part of content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      return part.inlineData;
    }
  }

  return null;
}

/**
 * Returns thinking configuration based on the model.
 */
export function getThinkingConfig(model: Model): ThinkingConfig | null {
  switch (model) {
    case MultimodalModel.GEMINI_2_5_FLASH:
      return { thinkingBudget: 0 } as any;
    case MultimodalModel.GEMINI_2_5_PRO:
      return { thinkingBudget: 128, includeThoughts: false } as any;
    case MultimodalModel.GEMINI_3_FLASH_PREVIEW:
      return { thinkingLevel: ThinkingLevel.MINIMAL } as any;
    case MultimodalModel.GEMINI_3_1_PRO_PREVIEW:
      return { thinkingLevel: ThinkingLevel.LOW } as any;
    default:
      return null;
  }
}

/**
 * Displays response information (tokens, errors, etc.)
 */
function displayResponseInfo(response: any, config?: GenerateContentConfig): void {
  if (!response) {
    console.error("❌ No response");
    return;
  }

  if (response.usageMetadata) {
    const { promptTokenCount, candidatesTokenCount, thoughtsTokenCount } = response.usageMetadata;
    if (promptTokenCount) console.log(`Input tokens   : ${promptTokenCount}`);
    if (candidatesTokenCount) console.log(`Output tokens  : ${candidatesTokenCount}`);
    if (thoughtsTokenCount) console.log(`Thoughts tokens: ${thoughtsTokenCount}`);
  }

  // Handle parsed response
  if (config?.responseMimeType === "application/json" && !response.parsed) {
    console.warn("❌ Could not parse the JSON response");
  }

  if (!response.candidates || response.candidates.length === 0) {
    console.warn("❌ No response.candidates");
    return;
  }

  if (response.candidates[0].finishReason !== "STOP") {
    console.warn(`❌ Finish reason: ${response.candidates[0].finishReason}`);
  }
}
