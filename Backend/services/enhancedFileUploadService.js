import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import Tesseract from 'tesseract.js';
import GeminiService from './geminiService.js';
import advancedOcrService from './advancedOcrService.js';

// Dynamic imports for better error handling
let mammoth, pdfParse;

// Initialize parsers with error handling
async function initializeParsers() {
  try {
    if (!mammoth) {
      try {
        const mammothModule = await import('mammoth');
        mammoth = mammothModule.default;
        console.log('Mammoth library loaded successfully');
      } catch (error) {
        console.warn('Failed to import mammoth:', error.message);
        mammoth = null;
      }
    }
    
    if (!pdfParse) {
      try {
        // Use the method that actually works (from our test)
        const createRequire = (await import('module')).createRequire;
        const require = createRequire(import.meta.url);
        pdfParse = require('pdf-parse');
        console.log('✅ PDF parsing capability loaded via CommonJS');
      } catch (error) {
        console.warn('Failed to import pdf-parse:', error.message);
        pdfParse = null;
      }
    }
  } catch (error) {
    console.warn('Warning: Error initializing parsing libraries:', error.message);
  }
}

class EnhancedFileUploadService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'medical-reports');
    this.ensureUploadDirectory();
    this.vectorStore = new Map(); // In-memory vector store (can be replaced with ChromaDB)
  }

  // Ensure upload directory exists
  async ensureUploadDirectory() {
    try {
      await fs.ensureDir(this.uploadDir);
      console.log('Upload directory ensured:', this.uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  // Configure multer storage
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = [
        // Document types
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        
        // Image types (medical reports, prescriptions, lab results)
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/tif',
        'image/webp',
        
        // Additional medical document formats
        'application/rtf',
        'text/rtf'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Supported: PDF, Word documents, text files, and images (JPG, PNG, GIF, BMP, TIFF, WebP).`), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit (increased for high-res medical images)
        files: 1,
        fieldNameSize: 100,
        fieldSize: 1024 * 1024 // 1MB for other fields
      }
    });
  }

  // Enhanced text extraction with OCR fallback
  async extractTextFromFile(filePath, mimeType) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      // Handle images with OCR (medical reports, prescriptions, lab results)
      if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'].includes(ext)) {
        return await this.extractFromImage(filePath);
      }
      
      // Handle PDF
      if (mimeType === 'application/pdf' || ext === '.pdf') {
        const pdfText = await this.extractFromPDF(filePath);
        
        // If PDF text extraction failed or returned minimal text, try OCR
        if (this.isPlaceholderText(pdfText) || pdfText.trim().length < 50) {
          console.log('🔄 PDF text extraction minimal (length: ' + pdfText.trim().length + '), attempting OCR...');
          const ocrText = await this.extractFromPDFWithOCR(filePath);
          
          // If OCR also fails, return a more helpful message
          if (this.isPlaceholderText(ocrText)) {
            const fileName = path.basename(filePath);
            return `📄 PDF Document: ${fileName}

This appears to be a scanned PDF document. While I can process the file, I cannot extract the text content directly. 

To help you better, please:
1. Tell me what type of medical report this is (blood test, X-ray, prescription, etc.)
2. Share the key findings or values you'd like me to help explain
3. Describe any specific concerns or questions about the results

I can then provide relevant medical information and insights based on what you tell me about the document.`;
          }
          
          return ocrText;
        }
        
        return pdfText;
      }
      
      // Handle Word documents
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
        return await this.extractFromDOCX(filePath);
      }
      
      if (mimeType === 'application/msword' || ext === '.doc') {
        return await this.extractFromDOC(filePath);
      }
      
      // Handle text files
      if (mimeType === 'text/plain' || ext === '.txt') {
        return await this.extractFromTXT(filePath);
      }
      
      throw new Error('Unsupported file type for text extraction');
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  // Extract text from PDF with ADVANCED OCR
  async extractFromPDFWithOCR(filePath) {
    try {
      console.log('🚀 === ADVANCED PDF OCR EXTRACTION ===');
      const fileName = path.basename(filePath);
      
      // Use the BEAST OCR service for scanned PDFs
      const extractedText = await advancedOcrService.extractTextFromScannedPDF(filePath);
      
      if (!extractedText || extractedText.trim().length < 20) {
        return `📄 **Scanned Medical Document: ${fileName}**

I've processed this scanned PDF using advanced OCR technology, but the text extraction was limited. This is common with:

🔍 **Complex medical layouts** (tables, charts, forms)
📷 **Image quality issues** (resolution, contrast, skew)
✍️ **Handwritten sections** (doctor's notes, signatures)
📊 **Graphical elements** (charts, diagrams, logos)

**How I can help you:**
1. **Describe the document type** - "This is a blood test report" or "X-ray findings"
2. **Share key values** - "My cholesterol is 250" or "Blood pressure 140/90"
3. **Ask specific questions** - "What does this lab value mean?" 

I can then provide detailed medical explanations and insights based on your description! 🏥`;
      }
      
      // Add a header to make it clear this came from OCR
      const ocrHeader = `📄 **Scanned Medical Document: ${fileName}**
✨ *Extracted using Advanced OCR Technology*

`;
      
      return ocrHeader + extractedText;
      
    } catch (error) {
      console.error('💥 Advanced OCR extraction failed:', error);
      const fileName = path.basename(filePath);
      
      return `📄 **Medical Document: ${fileName}**

🔧 **OCR Processing Encountered an Issue**

The advanced text extraction system encountered a technical issue while processing your scanned document. This can happen with:

- Very complex document layouts
- Extremely low image quality
- Corrupted or encrypted PDFs
- Unsupported PDF formats

**What you can do:**
1. **Try a different format** - Convert to JPG/PNG and upload as image
2. **Improve quality** - Scan at higher resolution if possible
3. **Describe manually** - Tell me about the document content and I'll help explain

Error details: ${error.message}`;
    }
  }

  // Extract text from images using OCR
  async extractFromImage(filePath) {
    try {
      console.log('📸 === IMAGE OCR EXTRACTION ===');
      console.log('📷 Processing image:', path.basename(filePath));
      
      const fileExt = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      // Check if it's a medical image type
      const medicalImageTypes = ['.jpg', '.jpeg', '.png', '.tiff', '.tif'];
      if (!medicalImageTypes.includes(fileExt)) {
        console.log(`⚠️ Unusual image format: ${fileExt}, proceeding with OCR...`);
      }
      
      // Preprocess image for better OCR
      const processedImagePath = await this.preprocessImage(filePath);
      
      // Perform OCR with medical document optimization
      const { data: { text } } = await Tesseract.recognize(processedImagePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`🔍 OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessOptions: {
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:()[]{}+-*/%=<>@#$&_|~`"\'?! \n\t',
          tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
          preserve_interword_spaces: '1'
        }
      });
      
      // Clean up processed image if it's different from original
      if (processedImagePath !== filePath) {
        await fs.unlink(processedImagePath).catch(() => {});
      }
      
      if (!text || text.trim().length === 0) {
        return `📷 **Medical Image: ${fileName}**

I've processed this image using OCR technology, but no readable text was found. This could be because:

🖼️ **Image contains mostly graphics** - Charts, diagrams, or visual elements
📷 **Image quality issues** - Low resolution, poor lighting, or blur
✍️ **Handwritten content** - Difficult for automated text recognition
🔍 **Complex layout** - Tables, forms, or unusual formatting

**How I can help:**
1. **Describe the image** - "This is a blood test report" or "X-ray with findings"
2. **Share key values** - Read out important numbers or results
3. **Ask specific questions** - "What does this lab value mean?"

I can then provide medical explanations and insights! 🏥`;
      }
      
      const cleanedText = this.cleanExtractedText(text);
      console.log(`✅ OCR extracted ${cleanedText.length} characters from image`);
      console.log('📸 === END IMAGE OCR EXTRACTION ===');
      
      // Add header to indicate this came from image OCR
      const imageHeader = `📷 **Medical Image: ${fileName}**
✨ *Text extracted using OCR Technology*

`;
      
      return imageHeader + cleanedText;
      
    } catch (error) {
      console.error('❌ Error extracting from image:', error);
      const fileName = path.basename(filePath);
      return `📷 **Medical Image: ${fileName}**

🔧 **OCR Processing Error**

There was an issue processing this image:
${error.message}

**Try these solutions:**
1. **Improve image quality** - Better lighting, higher resolution
2. **Try different format** - Convert to JPG or PNG
3. **Describe manually** - Tell me about the image content

I'm here to help with medical information once you provide the details! 🏥`;
    }
  }

  // Preprocess image for better OCR results
  async preprocessImage(imagePath) {
    try {
      const processedPath = imagePath.replace(/(\.[^.]+)$/, '_processed$1');
      
      await sharp(imagePath)
        .resize(2000, 2000, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(processedPath);
      
      return processedPath;
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error.message);
      return imagePath;
    }
  }

  // Extract text from PDF (original method)
  async extractFromPDF(filePath) {
    try {
      console.log('=== PDF EXTRACTION DEBUG ===');
      console.log('File path:', filePath);
      
      await initializeParsers();
      console.log('pdfParse available:', !!pdfParse);
      
      if (!pdfParse) {
        const fileName = path.basename(filePath);
        const stats = await fs.stat(filePath);
        const message = `[PDF Document uploaded: ${fileName} (${Math.round(stats.size / 1024)}KB) - PDF parsing not available. Please describe the contents of this medical report in your message.]`;
        console.log('PDF parser not available, returning placeholder:', message);
        return message;
      }
      
      const dataBuffer = await fs.readFile(filePath);
      console.log('File buffer size:', dataBuffer.length);
      
      const data = await pdfParse(dataBuffer);
      console.log('PDF parse result - text length:', data.text ? data.text.length : 0);
      console.log('PDF text preview (first 200 chars):', data.text ? data.text.substring(0, 200) : 'NO TEXT');
      
      if (!data.text || data.text.trim().length === 0) {
        const fileName = path.basename(filePath);
        const message = `[PDF Document uploaded: ${fileName} - No readable text found. This might be a scanned document.]`;
        console.log('No text extracted, will attempt OCR fallback');
        return message;
      }
      
      const cleanedText = this.cleanExtractedText(data.text);
      console.log('Cleaned text length:', cleanedText.length);
      console.log('=== END PDF EXTRACTION DEBUG ===');
      
      return cleanedText;
    } catch (error) {
      console.error('Error extracting from PDF:', error);
      const fileName = path.basename(filePath);
      const message = `[PDF Document uploaded: ${fileName} - Text extraction failed, will attempt OCR.]`;
      return message;
    }
  }

  // Extract text from DOCX
  async extractFromDOCX(filePath) {
    try {
      await initializeParsers();
      
      if (!mammoth) {
        return `[DOCX file uploaded: ${path.basename(filePath)} - DOCX parsing not available]`;
      }
      
      const result = await mammoth.extractRawText({ path: filePath });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text found in DOCX file');
      }
      
      return this.cleanExtractedText(result.value);
    } catch (error) {
      console.error('Error extracting from DOCX:', error);
      return `[DOCX file uploaded: ${path.basename(filePath)} - Text extraction failed: ${error.message}]`;
    }
  }

  // Extract text from DOC
  async extractFromDOC(filePath) {
    try {
      await initializeParsers();
      
      if (!mammoth) {
        return `[DOC file uploaded: ${path.basename(filePath)} - DOC parsing not available, please convert to PDF or DOCX]`;
      }
      
      const result = await mammoth.extractRawText({ path: filePath });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text found in DOC file. Please convert to PDF or DOCX format.');
      }
      
      return this.cleanExtractedText(result.value);
    } catch (error) {
      console.error('Error extracting from DOC:', error);
      return `[DOC file uploaded: ${path.basename(filePath)} - Text extraction failed: ${error.message}]`;
    }
  }

  // Extract text from TXT
  async extractFromTXT(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.cleanExtractedText(content);
    } catch (error) {
      console.error('Error extracting from TXT:', error);
      return `[TXT file uploaded: ${path.basename(filePath)} - Text extraction failed: ${error.message}]`;
    }
  }

  // Check if text is a placeholder message
  isPlaceholderText(text) {
    if (!text) return true;
    
    const placeholderIndicators = [
      '[PDF Document uploaded:',
      '[DOCX file uploaded:',
      '[DOC file uploaded:',
      'PDF parsing not available',
      'No readable text found',
      'Text extraction failed',
      'Please describe the contents'
    ];
    
    // Check for placeholder indicators
    const hasPlaceholder = placeholderIndicators.some(indicator => text.includes(indicator));
    
    // Also check if text is too short (likely whitespace from scanned PDF)
    const isTooShort = text.trim().length < 10;
    
    return hasPlaceholder || isTooShort;
  }

  // Clean extracted text
  cleanExtractedText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Generate vector embeddings for extracted text
  async generateEmbeddings(text) {
    try {
      if (!text || text.trim().length === 0) {
        return null;
      }
      
      // Use Gemini service to create embeddings
      const embeddings = await GeminiService.createEmbedding(text);
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      return null;
    }
  }

  // Store embeddings in vector store
  async storeEmbeddings(documentId, text, embeddings, metadata = {}) {
    try {
      if (!embeddings) return;
      
      this.vectorStore.set(documentId, {
        text,
        embeddings,
        metadata: {
          ...metadata,
          createdAt: new Date(),
          textLength: text.length
        }
      });
      
      console.log(`Stored embeddings for document: ${documentId}`);
    } catch (error) {
      console.error('Error storing embeddings:', error);
    }
  }

  // Search similar documents using vector similarity
  async searchSimilarDocuments(queryText, limit = 3) {
    try {
      if (this.vectorStore.size === 0) {
        return [];
      }
      
      // Generate embeddings for query
      const queryEmbeddings = await this.generateEmbeddings(queryText);
      if (!queryEmbeddings) return [];
      
      const similarities = [];
      
      // Calculate cosine similarity with all stored documents
      for (const [docId, docData] of this.vectorStore) {
        const similarity = this.cosineSimilarity(queryEmbeddings, docData.embeddings);
        similarities.push({
          documentId: docId,
          similarity,
          text: docData.text.substring(0, 200) + '...',
          metadata: docData.metadata
        });
      }
      
      // Sort by similarity and return top matches
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .filter(doc => doc.similarity > 0.7); // Only return highly similar documents
        
    } catch (error) {
      console.error('Error searching similar documents:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Enhanced file processing with vectorization
  async processFileUpload(file, userId, sessionId) {
    try {
      console.log(`Processing file upload for user ${userId}, session ${sessionId}`);
      
      // Step 1: Validate file
      const fileInfo = await this.validateFile(file);
      
      // Step 2: Extract text with OCR fallback
      const extractedText = await this.extractTextFromFile(file.path, file.mimetype);
      
      if (!extractedText) {
        throw new Error('Failed to extract any content from file');
      }
      
      // Step 3: Generate embeddings if text is meaningful
      let embeddings = null;
      let vectorized = false;
      
      if (!this.isPlaceholderText(extractedText) && extractedText.trim().length > 20) {
        embeddings = await this.generateEmbeddings(extractedText);
        
        if (embeddings) {
          // Step 4: Store in vector database
          const documentId = `${userId}_${sessionId}_${file.filename}`;
          await this.storeEmbeddings(documentId, extractedText, embeddings, {
            userId,
            sessionId,
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size
          });
          vectorized = true;
        }
      }

      return {
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        extractedText: extractedText,
        extractionStatus: 'success',
        vectorized: vectorized,
        hasEmbeddings: !!embeddings,
        extractedAt: new Date()
      };
    } catch (error) {
      console.error('Error processing file upload:', error);
      
      // Clean up file on error
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  // Validate uploaded file
  async validateFile(file) {
    try {
      const stats = await fs.stat(file.path);
      
      if (stats.size === 0) {
        throw new Error('File is empty');
      }
      
      if (stats.size > 15 * 1024 * 1024) {
        throw new Error('File size exceeds 15MB limit');
      }
      
      return {
        size: stats.size,
        isValid: true
      };
    } catch (error) {
      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  // Get vector store statistics
  getVectorStoreStats() {
    return {
      totalDocuments: this.vectorStore.size,
      memoryUsage: process.memoryUsage(),
      lastUpdated: new Date()
    };
  }
}

export default new EnhancedFileUploadService();