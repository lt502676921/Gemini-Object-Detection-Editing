"use server";

import { detectObjects } from "@/lib/genai/object-detection";
import { restoreObjects, colorizeObjects, cinematizeObjects } from "@/lib/genai/object-editing";
import { MultimodalModel, ImageModel, VisualObjectWorkflow, PartMediaResolutionLevel } from "@/lib/genai/types";

/**
 * Server Action to perform object detection
 */
export async function performDetection(
  imageUrl: string,
  model: MultimodalModel = MultimodalModel.DEFAULT as MultimodalModel,
  prompt?: string,
  mediaResolution?: PartMediaResolutionLevel,
  apiKey?: string
): Promise<VisualObjectWorkflow | null> {
  if (!apiKey) throw new Error("API Key is required for detection. Please set it in settings.");
  console.log(`\n🚀 [DETECTION] Starting for: ${imageUrl}`);
  console.log(`🤖 [DETECTION] Using Model: ${model}`);
  
  try {
    const workflow = await detectObjects(imageUrl, model, prompt, undefined, mediaResolution, apiKey);
    if (workflow) {
      const { saveWorkflow } = await import("@/lib/genai/object-editing");
      saveWorkflow(imageUrl, workflow);
    }
    console.log(`✅ [DETECTION] Successful, objects found: ${workflow?.detectedObjects.length}`);
    return workflow;
  } catch (error: any) {
    console.error(`❌ [DETECTION] Action Error: ${error.message || error}`);
    throw error;
  }
}

/**
 * Server Action to perform object restoration
 */
export async function performRestoration(
  imageUrl: string,
  prompt?: string,
  apiKey?: string,
  imageModel: ImageModel = ImageModel.DEFAULT
): Promise<VisualObjectWorkflow | null> {
  if (!apiKey) throw new Error("API Key is required for restoration. Please set it in settings.");
  console.log(`\n🛠️ [RESTORATION] Starting for: ${imageUrl}`);
  console.log(`🎨 [RESTORATION] Using Model: ${imageModel}`);
  
  try {
    const workflow = await restoreObjects(imageUrl, prompt, imageModel, undefined, true, apiKey);
    console.log(`✅ [RESTORATION] Completed for: ${imageUrl}`);
    return workflow;
  } catch (error: any) {
    console.error(`❌ [RESTORATION] Failed: ${error.message}`);
    throw error;
  }
}

export async function performColorization(
  imageUrl: string,
  prompt?: string,
  apiKey?: string,
  imageModel: ImageModel = ImageModel.DEFAULT
): Promise<VisualObjectWorkflow | null> {
  if (!apiKey) throw new Error("API Key is required for colorization. Please set it in settings.");
  console.log(`\n🎨 [COLORIZATION] Starting for: ${imageUrl}`);
  console.log(`🎨 [COLORIZATION] Using Model: ${imageModel}`);
  
  try {
    const workflow = await colorizeObjects(imageUrl, prompt, imageModel, undefined, true, apiKey);
    console.log(`✅ [COLORIZATION] Completed for: ${imageUrl}`);
    return workflow;
  } catch (error: any) {
    console.error(`❌ [COLORIZATION] Failed: ${error.message}`);
    throw error;
  }
}

export async function performCinematization(
  imageUrl: string,
  prompt?: string,
  apiKey?: string,
  imageModel: ImageModel = ImageModel.DEFAULT
): Promise<VisualObjectWorkflow | null> {
  if (!apiKey) throw new Error("API Key is required for cinematization. Please set it in settings.");
  console.log(`\n🎬 [CINEMATIZATION] Starting for: ${imageUrl}`);
  console.log(`🎨 [CINEMATIZATION] Using Model: ${imageModel}`);
  
  try {
    const workflow = await cinematizeObjects(imageUrl, prompt, imageModel, undefined, true, apiKey);
    console.log(`✅ [CINEMATIZATION] Completed for: ${imageUrl}`);
    return workflow;
  } catch (error: any) {
    console.error(`❌ [CINEMATIZATION] Failed: ${error.message}`);
    throw error;
  }
}
