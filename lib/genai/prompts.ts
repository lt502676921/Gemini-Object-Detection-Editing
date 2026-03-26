export const OBJECT_DETECTION_PROMPT = `
Detect every illustration within the book photo and extract the following data for each:
- \`box_2d\`: Bounding box coordinates of the illustration only (ignoring any caption).
- \`caption\`: Verbatim caption or legend such as "Figure 1". Use "" if not found.
- \`label\`: Single-word label describing the illustration. Use "" if not found.
`;

export const ELECTRONIC_COMPONENT_DETECTION_PROMPT = `
Exhaustively detect all the individual electronic components in the image and provide the following data for each:
- \`box_2d\`: bounding box coordinates.
- \`caption\`: Verbatim alphanumeric text visible on the component (including original line breaks), or "" if no text is present.
- \`label\`: Specific type of component.
`;

export const RESTORATION_PROMPT = `
- Isolate and straighten the visual on a pure white background, excluding any surrounding text.
- Clean up all physical artifacts and noise while preserving every original detail.
- Center the result and scale it to fit the canvas with minimal, symmetrical margins, ensuring no distortion or cropping.
`;

export const COLORIZATION_PROMPT = `
Colorize this image in a modern book illustration style, maintaining all original details without any additions.
`;

export const CINEMATIZATION_PROMPT = `
Reimagine this image as a joyful, modern live-action cinematic movie still featuring professional lighting and composition.
`;

export const TILTED_VISUAL_PROMPT = `
An upright, high-fidelity rendition of the visual isolated against a pure white background, filling the canvas with minimal uniform margins. The output is clean, sharp, and free of physical artifacts.
`;

export const WARPED_VISUAL_PROMPT = `
An edge-to-edge digital extraction of the illustration from the provided book photo, excluding any peripheral text. All page curvature and perspective distortions are corrected, resulting in an image framed in a perfect rectangle, on a pure white canvas with minimal margins.
`;

export const WATERCOLOR_PROMPT = `
Transform this visual into a warm, watercolor painting.
`;

export const PAINTING_PROMPT = `
Transform this visual into a traditional painting.
`;

export const DIGITAL_GRAPHIC_PROMPT = `
Transform this visual into a full-color, flat digital graphic, extending the content for a full-bleed effect.
`;

export const PHOTO_PROMPT = `
Transform this visual into a high-end, modern camera photograph.
`;
