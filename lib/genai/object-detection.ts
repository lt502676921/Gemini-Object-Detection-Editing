import { 
  MultimodalModel, 
  GenerateContentConfig, 
  PartMediaResolutionLevel,
  DetectedObject,
  WorkflowStep,
  Model,
  VisualObjectWorkflow
} from './types';
import { generateContent, getThinkingConfig } from './client';
import { Source, metadataBySource } from '../constants/test-images';
import { OBJECT_DETECTION_PROMPT, ELECTRONIC_COMPONENT_DETECTION_PROMPT, RESTORATION_PROMPT } from './prompts';
import sharp from 'sharp';

export const CROP_MARGIN_PX = 10;

/**
 * Normalizes bounding boxes from [y1, x1, y2, x2] (0-1000) 
 * to [x1, y1, x2, y2] (pixel coordinates)
 */
export function denormalizeBoundingBoxes(
  detectedObjects: DetectedObject[],
  width: number,
  height: number
): DetectedObject[] {
  return detectedObjects.map(obj => {
    const [y1, x1, y2, x2] = obj.box_2d;
    
    const toImageCoord = (coord: number, dim: number) => Math.round((coord * dim) / 1000);

    return {
      ...obj,
      box_2d: [
        toImageCoord(x1, width),
        toImageCoord(y1, height),
        toImageCoord(x2, width),
        toImageCoord(y2, height)
      ]
    };
  });
}

/**
 * Configuration for object detection
 */
export function getObjectDetectionConfig(model: Model): GenerateContentConfig {
  return {
    temperature: 0.0,
    topP: 0.0,
    seed: 42,
    responseMimeType: "application/json",
    // In TypeScript, we can't pass the class directly like Pydantic, 
    // but the system prompt/config can specify the schema if the SDK supports it.
    responseSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          box_2d: { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4 },
          caption: { type: "string" },
          label: { type: "string" }
        },
        required: ["box_2d", "caption", "label"]
      }
    },
    thinkingConfig: getThinkingConfig(model) || undefined,
  };
}

/**
 * Main detection function (Server-side intended)
 */
export async function detectObjects(
  imageUrl: string,
  model: MultimodalModel = MultimodalModel.DEFAULT as MultimodalModel,
  prompt?: string,
  config?: GenerateContentConfig,
  mediaResolution?: PartMediaResolutionLevel,
  apiKey?: string,
  base64DataOverride?: string
): Promise<VisualObjectWorkflow | null> {
  // 1. Fetch image info (width/height needed for denormalization)
  
  let base64Data = base64DataOverride;
  let mimeType = "image/jpeg";

  if (!base64Data) {
    let response;
    const commonHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };

    try {
      console.log(`📡 [FETCH] Attempting to fetch image: ${imageUrl}`);
      response = await fetch(imageUrl, {
        headers: {
          ...commonHeaders,
          'Referer': 'https://www.loc.gov/',
        }
      });

      if (response.status === 403) {
        console.warn(`⚠️ [FETCH] 403 Forbidden with headers. Retrying without Referer/detailed headers...`);
        response = await fetch(imageUrl, {
          headers: { 'User-Agent': commonHeaders['User-Agent'] }
        });
      }

      if (!response.ok) {
         // Detailed error for 403/401
         const errorMsg = `Failed to fetch image: ${response.status} ${response.statusText} from ${imageUrl}`;
         console.error(`❌ [FETCH] Error: ${errorMsg}`);
         
         // Log headers to help debug
         const headersObj: Record<string, string> = {};
         response.headers.forEach((v, k) => { headersObj[k] = v; });
         console.log(`ℹ [FETCH] Response Headers:`, JSON.stringify(headersObj));
         
         throw new Error(errorMsg);
      }
      
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      
      if (buffer.byteLength === 0) {
        throw new Error(`Fetched image buffer is empty for ${imageUrl}`);
      }

      base64Data = Buffer.from(buffer).toString('base64');
      mimeType = blob.type || "image/jpeg";

    } catch (error: any) {
      console.error(`❌ [FETCH] Network or Status Error for ${imageUrl}:`, error.message);
      throw error;
    }
  } else {
    console.log(`🚀 [FETCH] Using provided base64 data for ${imageUrl.substring(0, 50)}...`);
  }
  
  const buffer = Buffer.from(base64Data, 'base64');

  // Use sharp to get actual dimensions
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (error) {
    console.error(`❌ Sharp metadata error for ${imageUrl}:`, error);
    console.log(`ℹ️ Buffer length: ${buffer.byteLength}`);
    throw error;
  }
  
  const width = metadata.width || 1000;
  const height = metadata.height || 1000;

  const contentPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };

  const finalConfig = config || getObjectDetectionConfig(model);
  const finalPrompt = prompt || OBJECT_DETECTION_PROMPT;
  const contents = [contentPart, finalPrompt.trim()];

  console.log(`🤖 [CORE] Calling GenAI Multimodal Model: ${model}`);
  const genAiResponse = await generateContent(contents, model, finalConfig, false, apiKey);
  console.log("📥 GenAI Response received:", !!genAiResponse);

  let detectedObjects: DetectedObject[] = [];
  if (genAiResponse?.parsed) {
    console.log("📦 Parsed objects:", JSON.stringify(genAiResponse.parsed).substring(0, 100) + "...");
    detectedObjects = genAiResponse.parsed as DetectedObject[];
  } else {
    console.warn("⚠️ No parsed data in GenAI response. Text was:", genAiResponse?.text?.() || "empty");
  }

  // 2. Denormalize
  const denormalized = denormalizeBoundingBoxes(detectedObjects, width, height);

  return {
    sourceImage: { 
      url: imageUrl, 
      width, 
      height,
      base64: base64Data,
      mimeType: mimeType || "image/jpeg"
    },
    detectedObjects: denormalized,
    imagesByStep: {
      [WorkflowStep.SOURCE]: [imageUrl]
    }
  };
}

/**
 * Utility to format image source info for display
 */
export function getImageSourceInfo(url: string): string {
  const sourceEntry = Object.entries(Source).find(([_, val]) => val === url);
  if (!sourceEntry) return url;
  
  const sourceKey = sourceEntry[0] as unknown as Source;
  const metadata = metadataBySource[sourceKey];
  if (!metadata) return url;

  return `${metadata.title} • ${metadata.creditLine}`;
}
