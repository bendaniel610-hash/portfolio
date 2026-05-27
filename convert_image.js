const Jimp = require('jimp');
const fs = require('fs');

const IMAGE_PATH = 'benedict_profile_seamless.png';
const OUTPUT_PATH = 'ascii_art.txt';
const WIDTH = 68; // Clean, high-fidelity width

Jimp.read(IMAGE_PATH)
  .then(image => {
    // Autocrop the transparent boundaries so the face fills the space nicely
    console.log("Autocropping image boundaries...");
    image.autocrop({ leaveBorder: 10 });

    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const aspect = h / w;
    const targetW = WIDTH;
    // Account for monospace aspect ratio (character heights are typically ~1.9x to 2x of width)
    const charAspectRatio = 0.53; 
    const targetH = Math.round(targetW * aspect * charAspectRatio);

    console.log(`Resizing cropped image ${w}x${h} to ${targetW}x${targetH} for ASCII...`);
    image.resize(targetW, targetH);

    // Pass 1: Find min and max luminance of visible pixels to normalize contrast
    let minLuma = 255;
    let maxLuma = 0;
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const idx = (y * targetW + x) * 4;
        const a = image.bitmap.data[idx+3];
        if (a >= 30) {
          const r = image.bitmap.data[idx];
          const g = image.bitmap.data[idx+1];
          const b = image.bitmap.data[idx+2];
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          if (luma < minLuma) minLuma = luma;
          if (luma > maxLuma) maxLuma = luma;
        }
      }
    }
    
    console.log(`Contrast normalization - Min Luma: ${minLuma.toFixed(1)}, Max Luma: ${maxLuma.toFixed(1)}`);
    const lumaRange = maxLuma - minLuma || 1;

    // Pass 2: Map to characters with dynamic normalization
    // A ramp optimized for dark backgrounds (lowest density -> highest density)
    const ramp = ' .:-=+*#%@'; 
    const rampLength = ramp.length;

    let ascii = '';
    for (let y = 0; y < targetH; y++) {
      let line = '';
      for (let x = 0; x < targetW; x++) {
        const idx = (y * targetW + x) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx+1];
        const b = image.bitmap.data[idx+2];
        const a = image.bitmap.data[idx+3];

        if (a < 30) {
          line += ' '; // transparent background
        } else {
          const rawLuma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          // Normalize luma to [0, 255]
          const normLuma = ((rawLuma - minLuma) / lumaRange) * 255;
          const charIndex = Math.min(rampLength - 1, Math.floor((normLuma / 255) * rampLength));
          line += ramp[charIndex];
        }
      }
      ascii += line + '\n';
    }

    fs.writeFileSync(OUTPUT_PATH, ascii);
    console.log(`Successfully generated high-contrast ASCII art and saved to ${OUTPUT_PATH}!`);
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
