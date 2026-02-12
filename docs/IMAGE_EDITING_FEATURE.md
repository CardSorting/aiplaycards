# Image Editing Feature

This document describes the new image editing functionality added to the `/generate` page using Google's Gemini AI.

## Overview

The image editing feature allows users to edit previously generated images by:

1. Hovering over any generated image in the gallery
2. Clicking the edit button that appears
3. Describing the desired changes in a dialog
4. Getting a new edited version of the image

## Features

### Desktop Experience

- **Hover Edit Button**: When hovering over an image card, an edit button appears alongside the fullscreen button
- **Edit Dialog**: A modal dialog opens with the image preview and a text field for edit instructions
- **Real-time Preview**: The dialog shows the image being edited for reference

### Mobile Experience

- **Edit Icon**: A small edit icon appears in the top-right corner of each image card
- **Touch-friendly**: Optimized for mobile interactions
- **Same Dialog**: Uses the same edit dialog as desktop for consistency

## Technical Implementation

### API Endpoint

- **Route**: `/api/edit-image`
- **Method**: POST
- **Body**: `{ imageUrl: string, editPrompt: string }`
- **Response**: `{ success: boolean, editedImageUrl: string, originalImageUrl: string, editPrompt: string, timestamp: string }`

### Components Updated

1. **ImageCard**: Added edit button and dialog functionality
2. **ImageGallery**: Passes edit handler to image cards
3. **MobileGallery**: Added mobile-optimized edit functionality
4. **ImageGenerationStudio**: Integrates edit workflow
5. **useImageGeneration**: Added editImage function
6. **ImageGenerationService**: Added editImage API call

### Types Added

- `ImageEditRequest`: Request interface for image editing
- `ImageEditResponse`: Response interface for edited images
- Updated `GeneratedImage` to include `isEditable` and `originalImageUrl` fields
- Updated `ImageGenerationActions` to include `editImage` function

## Environment Variables

Add the following to your `.env.local` file:

```bash
GOOGLE_GENAI_API_KEY=your-google-genai-api-key
```

## Usage

1. **Generate an Image**: First, generate an image using the normal generation process
2. **Hover to Edit**: Hover over the generated image in the gallery
3. **Click Edit**: Click the edit button that appears
4. **Describe Changes**: In the dialog, describe how you want to edit the image
5. **Submit**: Click "Edit Image" to process the edit
6. **View Result**: The edited image will appear in the gallery

## Example Edit Prompts

- "Add a sunset in the background"
- "Change the colors to blue and purple"
- "Add a cat sitting on the chair"
- "Make it look like a painting"
- "Add snow falling"
- "Change the lighting to be more dramatic"

## Error Handling

The feature includes comprehensive error handling:

- Invalid prompts are validated before sending
- API errors are caught and displayed to the user
- Network issues are handled gracefully
- Loading states are shown during processing

## Performance Considerations

- Images are processed using Google's Gemini 2.0 Flash model
- Temporary files are cleaned up after processing
- Edited images are uploaded to the same storage system as generated images
- The UI shows loading states during processing

## Future Enhancements

Potential improvements for the future:

- Batch editing multiple images
- Edit history tracking
- Undo/redo functionality
- More advanced editing options (crop, resize, etc.)
- Integration with other AI models
