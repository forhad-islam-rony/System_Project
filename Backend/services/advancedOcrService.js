import fs from 'fs-extra';
import path from 'path';
import Tesseract from 'tesseract.js';
import pdf2pic from 'pdf2pic';

// Dynamic import for JIMP to handle ES6 module issues
let Jimp;

class AdvancedOcrService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp-ocr');
    this.ensureTempDirectory();
    this.initializeJimp();
    
    // OCR configuration for medical documents
    this.ocrConfig = {
      tesseractOptions: {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        langPath: path.join(process.cwd(), 'tessdata'),
      },
      
      // Medical document specific settings
      medicalPreprocessing: {
        enhanceContrast: true,
        removeNoise: true,
        sharpenText: true,
        normalizeSize: true,
        binarize: true
      }
    };
  }

  async ensureTempDirectory() {
    try {
      await fs.ensureDir(this.tempDir);
      console.log('🗂️ OCR temp directory ensured:', this.tempDir);
    } catch (error) {
      console.error('Error creating OCR temp directory:', error);
    }
  }

  async initializeJimp() {
    try {
      if (!Jimp) {
        const jimpModule = await import('jimp');
        Jimp = jimpModule.default || jimpModule.Jimp || jimpModule;
        console.log('🎨 JIMP library loaded successfully');
      }
    } catch (error) {
      console.warn('⚠️ JIMP failed to load:', error.message);
      console.log('📷 Image preprocessing will be limited');
      Jimp = null;
    }
  }

  // 🎯 MAIN OCR FUNCTION - Processes scanned PDFs
  async extractTextFromScannedPDF(pdfPath) {
    try {
      console.log('🔥 === ADVANCED OCR PROCESSING ===');
      console.log('📄 Processing scanned PDF:', path.basename(pdfPath));
      
      // Step 1: Convert PDF to high-quality images
      const images = await this.convertPdfToImages(pdfPath);
      console.log(`📸 Converted PDF to ${images.length} images`);
      
      if (images.length === 0) {
        throw new Error('Failed to convert PDF to images');
      }
      
      // Step 2: Process each page with advanced OCR
      let allText = '';
      let pageCount = 0;
      
      for (const imagePath of images) {
        pageCount++;
        console.log(`🔍 Processing page ${pageCount}/${images.length}...`);
        
        try {
          // Advanced preprocessing for medical documents
          const processedImagePath = await this.preprocessMedicalImage(imagePath);
          
          // Multi-engine OCR with medical optimization
          const pageText = await this.performAdvancedOCR(processedImagePath);
          
          if (pageText && pageText.trim().length > 5) {
            allText += `\n=== PAGE ${pageCount} ===\n${pageText}\n`;
            console.log(`✅ Page ${pageCount} - Extracted ${pageText.length} characters`);
          } else {
            console.log(`⚠️ Page ${pageCount} - Minimal text extracted`);
            allText += `\n=== PAGE ${pageCount} ===\n[This page appears to contain mostly images or unclear text]\n`;
          }
          
          // Clean up processed image
          await fs.unlink(processedImagePath).catch(() => {});
          
        } catch (pageError) {
          console.error(`❌ Error processing page ${pageCount}:`, pageError.message);
          allText += `\n=== PAGE ${pageCount} ===\n[Error processing this page: ${pageError.message}]\n`;
        }
      }
      
      // Step 3: Clean up original images
      await this.cleanupImages(images);
      
      // Step 4: Post-process and enhance extracted text
      const cleanedText = this.postProcessMedicalText(allText);
      
      console.log(`🎉 OCR Complete! Total text length: ${cleanedText.length}`);
      console.log('🔥 === END ADVANCED OCR PROCESSING ===');
      
      return cleanedText;
      
    } catch (error) {
      console.error('💥 Advanced OCR failed:', error);
      throw new Error(`Advanced OCR processing failed: ${error.message}`);
    }
  }

  // 🖼️ Convert PDF to high-quality images
  async convertPdfToImages(pdfPath) {
    try {
      console.log('🔄 Converting PDF to images...');
      
      const convert = pdf2pic.fromPath(pdfPath, {
        density: 300,           // High DPI for better OCR
        saveFilename: "page",
        savePath: this.tempDir,
        format: "png",
        width: 2480,            // High resolution
        height: 3508,           // A4 proportions
        quality: 100
      });
      
      // Convert all pages
      const pages = await convert.bulk(-1, { responseType: "image" });
      
      return pages.map(page => page.path);
      
    } catch (error) {
      console.error('❌ PDF to image conversion failed:', error);
      
      // Fallback method using different settings
      try {
        console.log('🔄 Trying fallback conversion method...');
        
        const convert = pdf2pic.fromPath(pdfPath, {
          density: 200,
          saveFilename: "fallback_page",
          savePath: this.tempDir,
          format: "jpg",
          quality: 90
        });
        
        const pages = await convert.bulk(-1, { responseType: "image" });
        return pages.map(page => page.path);
        
      } catch (fallbackError) {
        console.error('❌ Fallback conversion also failed:', fallbackError);
        throw new Error('PDF to image conversion failed with both methods');
      }
    }
  }

  // 🎨 Advanced image preprocessing for medical documents
  async preprocessMedicalImage(imagePath) {
    try {
      console.log(`🎨 Preprocessing medical image: ${path.basename(imagePath)}`);
      
      // Ensure JIMP is loaded
      await this.initializeJimp();
      
      if (!Jimp) {
        console.log('📷 JIMP not available, skipping preprocessing');
        return imagePath;
      }
      
      const image = await Jimp.read(imagePath);
      const outputPath = imagePath.replace(/\.[^.]+$/, '_processed.png');
      
      // Medical document optimization pipeline
      await image
        // 1. Resize for optimal OCR (if too small or too large)
        .resize(Jimp.AUTO, 3000, Jimp.RESIZE_BEZIER)
        
        // 2. Convert to grayscale for better OCR
        .greyscale()
        
        // 3. Enhance contrast (crucial for medical reports)
        .contrast(0.3)
        
        // 4. Normalize brightness
        .normalize()
        
        // 5. Sharpen text (medical reports often have fine text)
        .convolute([
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0]
        ])
        
        // 6. Remove noise (common in scanned documents)
        .blur(0.5)
        
        // 7. Enhance edges
        .convolute([
          [-1, -1, -1],
          [-1, 9, -1],
          [-1, -1, -1]
        ])
        
        // 8. Final threshold for clean text
        .threshold({ max: 128, replace: 255, autoGreyscale: false })
        
        // Save processed image
        .writeAsync(outputPath);
      
      console.log(`✅ Image preprocessing complete: ${path.basename(outputPath)}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      // Return original path if preprocessing fails
      return imagePath;
    }
  }

  // 🤖 Advanced OCR with multiple engines and medical optimization
  async performAdvancedOCR(imagePath) {
    try {
      console.log(`🤖 Performing advanced OCR on: ${path.basename(imagePath)}`);
      
      // Primary OCR with Tesseract (optimized for medical text)
      const ocrResult = await this.tesseractOCR(imagePath);
      
      if (ocrResult && ocrResult.length > 20) {
        return ocrResult;
      }
      
      // If primary OCR fails, try with different settings
      console.log('🔄 Primary OCR yielded minimal results, trying alternative settings...');
      return await this.tesseractOCRAlternative(imagePath);
      
    } catch (error) {
      console.error('❌ Advanced OCR failed:', error);
      throw error;
    }
  }

  // 🎯 Primary Tesseract OCR (Medical optimized)
  async tesseractOCR(imagePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: this.ocrConfig.tesseractOptions.logger,
        
        // Medical document optimization
        tessOptions: {
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:()[]{}+-*/%=<>@#$&_|~`"\'?! \n\t',
          tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
          preserve_interword_spaces: '1',
          tessedit_create_hocr: '1',
          tessedit_create_tsv: '1'
        }
      });
      
      return text;
    } catch (error) {
      console.error('❌ Primary Tesseract OCR failed:', error);
      throw error;
    }
  }

  // 🔄 Alternative Tesseract OCR settings
  async tesseractOCRAlternative(imagePath) {
    try {
      console.log('🔄 Trying alternative OCR settings...');
      
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: this.ocrConfig.tesseractOptions.logger,
        
        // Alternative settings for difficult documents
        tessOptions: {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
          preserve_interword_spaces: '0'
        }
      });
      
      return text;
    } catch (error) {
      console.error('❌ Alternative Tesseract OCR failed:', error);
      return '[OCR processing failed - medical document may contain complex formatting]';
    }
  }

  // 🧹 Clean up temporary images
  async cleanupImages(imagePaths) {
    try {
      for (const imagePath of imagePaths) {
        await fs.unlink(imagePath).catch(() => {});
      }
      console.log(`🧹 Cleaned up ${imagePaths.length} temporary images`);
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }

  // 📝 Post-process medical text
  postProcessMedicalText(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      return '[No readable text could be extracted from this medical document]';
    }
    
    // Medical text enhancement
    let processedText = rawText
      // Fix common OCR errors in medical documents
      .replace(/\bl\b/g, 'I')                    // Common OCR error: l instead of I
      .replace(/\b0(?=[A-Za-z])/g, 'O')          // 0 instead of O
      .replace(/\b5(?=\d{1,2}%)/g, 'S')          // 5 instead of S in percentages
      .replace(/\bB(?=\d)/g, '8')                // B instead of 8
      .replace(/\b1(?=[A-Za-z]{2,})/g, 'I')      // 1 instead of I in words
      
      // Fix medical unit spacing
      .replace(/(\d+)\s*mg\s*\/\s*dl/gi, '$1 mg/dL')  // mg/dl formatting
      .replace(/(\d+)\s*mmol\s*\/\s*l/gi, '$1 mmol/L') // mmol/l formatting
      .replace(/(\d+)\s*u\s*\/\s*l/gi, '$1 U/L')       // U/L formatting
      
      // Clean up spacing and formatting
      .replace(/\s{2,}/g, ' ')                   // Multiple spaces to single
      .replace(/\n{3,}/g, '\n\n')               // Multiple newlines to double
      .replace(/([.!?])\s*\n\s*/g, '$1\n\n')    // Proper paragraph spacing
      
      // Remove page markers that are less useful
      .replace(/=== PAGE \d+ ===/g, '\n--- Page Break ---\n')
      
      .trim();
    
    // If text is still very short, provide helpful message
    if (processedText.length < 50) {
      return `📄 Medical Document Processed

The OCR system has processed this scanned medical document, but the extracted text is limited. This could be due to:

1. 🔍 **Complex formatting** - Tables, charts, or unusual layouts
2. 📷 **Image quality** - Low resolution or poor contrast
3. 🖨️ **Handwritten notes** - Difficult for automated recognition
4. 📊 **Graphics/Charts** - Visual elements that don't contain readable text

**To help you better, please describe:**
- Type of medical report (blood test, X-ray, prescription, etc.)
- Key values or findings you're concerned about
- Specific questions about the results

I can then provide relevant medical information and explanations.`;
    }
    
    return processedText;
  }

  // 📊 Get OCR service statistics
  getServiceStats() {
    return {
      tempDirectory: this.tempDir,
      tesseractVersion: 'Latest',
      supportedFormats: ['PDF', 'PNG', 'JPG', 'JPEG'],
      features: [
        'High-resolution PDF conversion',
        'Medical document preprocessing',
        'Multi-engine OCR fallback',
        'Medical text enhancement',
        'Automatic cleanup'
      ]
    };
  }

  // 🧪 Test OCR with a sample
  async testOCR() {
    try {
      console.log('🧪 Testing OCR service...');
      
      // Create a simple test
      const testResult = await Tesseract.recognize(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'eng'
      );
      
      console.log('✅ OCR service test completed');
      return true;
    } catch (error) {
      console.error('❌ OCR service test failed:', error);
      return false;
    }
  }
}

export default new AdvancedOcrService();