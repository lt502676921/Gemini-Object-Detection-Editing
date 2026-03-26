import { 
  WorkflowStep, 
  VisualObjectWorkflow, 
  ImageModel, 
  GenerateContentConfig,
  Model
} from './types';
import { generateContent, generateImage } from './client';
import { detectObjects, CROP_MARGIN_PX } from './object-detection';
import { RESTORATION_PROMPT, COLORIZATION_PROMPT, CINEMATIZATION_PROMPT } from './prompts';
import sharp from 'sharp';

/**
 * Type for an object editing function
 */
export type ObjectEditingFunction = (
  imageUrl: string,
  prompt?: string,
  model?: ImageModel,
  config?: GenerateContentConfig,
  displayResults?: boolean,
  apiKey?: string
) => Promise<VisualObjectWorkflow>;

/**
 * Registry for editing functions indexed by (sourceStep, targetStep)
 */
const registeredFunctions: Record<string, ObjectEditingFunction> = {};

export const RESTORATION_CONFIG: GenerateContentConfig = {
  temperature: 0.0,
  topP: 0.0,
  seed: 42,
  responseModalities: ["IMAGE"],
};

export const COLORIZATION_CONFIG: GenerateContentConfig = {
  temperature: 0.0,
  topP: 0.0,
  seed: 42,
  responseModalities: ["IMAGE"],
};

export const CINEMATIZATION_CONFIG: GenerateContentConfig = {
  temperature: 0.7, // Higher temperature for more creative "open" prompts
  topP: 0.9,
  seed: 42,
  responseModalities: ["IMAGE"],
};

export const DEFAULT_EDITING_CONFIG: GenerateContentConfig = {
  responseModalities: ["IMAGE"]
};

/**
 * Restoration function (CROPPED -> RESTORED)
 */
export const restoreObjects = createObjectEditingFunction(
  RESTORATION_PROMPT,
  WorkflowStep.CROPPED,
  WorkflowStep.RESTORED,
  ImageModel.DEFAULT,
  RESTORATION_CONFIG
);

export const colorizeObjects = createObjectEditingFunction(
  COLORIZATION_PROMPT,
  WorkflowStep.RESTORED,
  WorkflowStep.COLORIZED,
  ImageModel.DEFAULT,
  COLORIZATION_CONFIG
);

export const cinematizeObjects = createObjectEditingFunction(
  CINEMATIZATION_PROMPT,
  WorkflowStep.RESTORED,
  WorkflowStep.CINEMATIZED,
  ImageModel.DEFAULT, // We could use a higher-res model if needed, but keeping default
  CINEMATIZATION_CONFIG
);

// Global cache for workflows (in a real app, this might be a database or context)
const workflowStore: Record<string, VisualObjectWorkflow> = {};

function getRegistryKey(source: WorkflowStep, target: WorkflowStep): string {
  return `${source}->${target}`;
}

export function saveWorkflow(imageUrl: string, workflow: VisualObjectWorkflow) {
  workflowStore[imageUrl] = workflow;
}

export function getWorkflow(imageUrl: string): VisualObjectWorkflow | null {
  return workflowStore[imageUrl] || null;
}

/**
 * Higher-order function to create an editing step
 */
export function createObjectEditingFunction(
  defaultPrompt: string,
  sourceStep: WorkflowStep,
  targetStep: WorkflowStep,
  defaultModel: ImageModel = ImageModel.DEFAULT,
  defaultConfig: GenerateContentConfig = DEFAULT_EDITING_CONFIG
): ObjectEditingFunction {
  const editingFunction: ObjectEditingFunction = async (
    imageUrl,
    prompt = defaultPrompt,
    model = defaultModel,
    config = defaultConfig,
    displayResults = true,
    apiKey?: string
  ) => {
    // 1. Get workflow and source images
    const { workflow, sourceImages } = await getWorkflowAndStepImages(imageUrl, sourceStep, apiKey);
    
    const finalPrompt = (prompt || defaultPrompt).trim();
    const finalModel = model || defaultModel;

    const targetImages: string[] = [];
    const objCount = sourceImages.length;

    for (let i = 0; i < objCount; i++) {
        const sourceImageBase64 = sourceImages[i];
        
        console.log(`🎨 [CORE] Editing object ${i+1}/${objCount} with Image Model: ${finalModel}...`);
        
        // Ensure image is passed as part with inlineData as per official example
        const imagePart = {
          inlineData: {
            mimeType: workflow.sourceImage.mimeType || 'image/png',
            data: sourceImageBase64
          }
        };

        const result = await generateImage([imagePart], finalPrompt, finalModel, config, apiKey);
        
        if (result?.data) {
          console.log(`✨ Object ${i+1} edited successfully.`);
          targetImages.push(result.data);
        } else {
          console.warn(`⚠️ Object ${i+1} editing returned no image data.`);
          targetImages.push("");
        }
    }

    workflow.imagesByStep[targetStep] = targetImages;
    workflowStore[imageUrl] = workflow;

    if (displayResults) {
      console.log(`✅ [${sourceStep} -> ${targetStep}] completed for ${objCount} objects.`);
    }
    // Return the updated workflow
    return workflow;
  };

  registeredFunctions[getRegistryKey(sourceStep, targetStep)] = editingFunction;
  return editingFunction;
}

/**
 * Ensures a workflow exists and has images for the specified step
 */
export async function getWorkflowAndStepImages(
  imageUrl: string,
  step: WorkflowStep,
  apiKey?: string
): Promise<{ workflow: VisualObjectWorkflow; sourceImages: string[] }> {
  let workflow = workflowStore[imageUrl];
  
  // 1. If no workflow, run detection
  if (!workflow) {
    console.log("🔍 No workflow in store, running detection for:", imageUrl);
    const result = await detectObjects(imageUrl, undefined, undefined, undefined, undefined, apiKey);
    if (!result) throw new Error("Failed to initialize workflow via detection");
    workflow = result;
    workflowStore[imageUrl] = workflow;
  }
  
  console.log(`📦 Workflow for ${imageUrl} has ${workflow.detectedObjects.length} objects.`);

  // 2. If step images missing or empty, check if there's a registered function to generate them
  if (!workflow.imagesByStep[step] || workflow.imagesByStep[step].length === 0) {
     // If the step is CROPPED, we need to implement the cropping logic
     if (step === WorkflowStep.CROPPED) {
       await generateCrops(workflow);
     } else {
       // Search for a function that targets this step
       const entry = Object.entries(registeredFunctions).find(([key]) => key.endsWith(`->${step}`));
        if (entry) {
          await entry[1](imageUrl, undefined, undefined, undefined, undefined, apiKey);
        }
     }
  }

  const sourceImages = workflow.imagesByStep[step] || [];
  return { workflow, sourceImages };
}

/**
 * Helper to generate cropped images from detected objects
 * (This is a simplified version since we don't have 'sharp' yet in the client)
 */
async function generateCrops(workflow: VisualObjectWorkflow) {
  const count = workflow.detectedObjects?.length || 0;
  console.log(`✂️ Generating crops for ${count} objects using sharp...`);
  
  const base64 = workflow.sourceImage.base64;
  if (!base64) {
    throw new Error("❌ Cannot crop: No base64 image data available in workflow.");
  }

  const imageBuffer = Buffer.from(base64, 'base64');
  const crops: string[] = [];

  for (const obj of workflow.detectedObjects) {
    try {
      // obj.box_2d is [x1, y1, x2, y2] in pixel coords
      const [x1, y1, x2, y2] = obj.box_2d;
      
      const left = Math.max(0, x1 - CROP_MARGIN_PX);
      const top = Math.max(0, y1 - CROP_MARGIN_PX);
      const width = Math.min(workflow.sourceImage.width - left, (x2 - x1) + 2 * CROP_MARGIN_PX);
      const height = Math.min(workflow.sourceImage.height - top, (y2 - y1) + 2 * CROP_MARGIN_PX);

      const croppedBuffer = await sharp(imageBuffer)
        .extract({ left, top, width, height })
        .toBuffer();
      
      crops.push(croppedBuffer.toString('base64'));
    } catch (err) {
      console.error("❌ Sharp cropping failed for object:", err);
      crops.push(""); // Fallback empty
    }
  }

  workflow.imagesByStep[WorkflowStep.CROPPED] = crops;
  console.log(`✅ Generated ${crops.length} real crops.`);
}
