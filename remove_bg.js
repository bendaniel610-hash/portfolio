const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Step 1: Install jimp locally if it's not already there
console.log('Installing jimp locally to process the image...');
try {
  execSync('npm install jimp@0.16.13', { stdio: 'inherit' });
  console.log('Jimp installed successfully.');
} catch (err) {
  console.error('Failed to install jimp:', err);
  process.exit(1);
}

// Step 2: Use jimp to remove the background
const Jimp = require('jimp');

const inputPath = path.join(__dirname, 'benedict_profile.png');
const outputPath = path.join(__dirname, 'benedict_profile_seamless.png');

console.log(`Reading image from: ${inputPath}`);

Jimp.read(inputPath)
  .then(image => {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Sample the top-left corner pixel color
    const targetColor = image.getPixelColor(0, 0);
    const targetRGBA = Jimp.intToRGBA(targetColor);
    console.log('Background target color (top-left pixel):', targetRGBA);
    
    // Threshold for background color matching
    const threshold = 55; 
    let transparentPixelsCount = 0;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);
        
        // Calculate Euclidean distance in RGB color space
        const distance = Math.sqrt(
          Math.pow(rgba.r - targetRGBA.r, 2) +
          Math.pow(rgba.g - targetRGBA.g, 2) +
          Math.pow(rgba.b - targetRGBA.b, 2)
        );
        
        if (distance < threshold) {
          // Set pixel to fully transparent
          image.setPixelColor(Jimp.rgbaToInt(rgba.r, rgba.g, rgba.b, 0), x, y);
          transparentPixelsCount++;
        }
      }
    }
    
    console.log(`Processed ${width * height} pixels. Made ${transparentPixelsCount} pixels transparent.`);
    
    // Save the processed image
    return image.writeAsync(outputPath);
  })
  .then(() => {
    console.log(`Successfully saved seamless image to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
