import fs from 'fs';
import path from 'path';

// Test pdf-parse directly
async function testPdfParse() {
  try {
    console.log('Testing PDF parsing...');
    
    // Try different import methods
    let pdfParse;
    
    try {
      // Method 1: Default import
      const module1 = await import('pdf-parse');
      pdfParse = module1.default;
      console.log('Method 1 - Default import:', typeof pdfParse);
    } catch (e) {
      console.log('Method 1 failed:', e.message);
    }
    
    if (!pdfParse || typeof pdfParse !== 'function') {
      try {
        // Method 2: Named import
        const module2 = await import('pdf-parse');
        pdfParse = module2;
        console.log('Method 2 - Direct module:', typeof pdfParse);
      } catch (e) {
        console.log('Method 2 failed:', e.message);
      }
    }
    
    if (!pdfParse || typeof pdfParse !== 'function') {
      try {
        // Method 3: CommonJS style
        const createRequire = (await import('module')).createRequire;
        const require = createRequire(import.meta.url);
        pdfParse = require('pdf-parse');
        console.log('Method 3 - Require:', typeof pdfParse);
      } catch (e) {
        console.log('Method 3 failed:', e.message);
      }
    }
    
    if (typeof pdfParse === 'function') {
      console.log('✅ PDF Parse function found!');
      
      // Test with an actual PDF file
      const uploadDir = path.join(process.cwd(), 'uploads', 'medical-reports');
      const files = fs.readdirSync(uploadDir);
      const pdfFile = files.find(f => f.endsWith('.pdf'));
      
      if (pdfFile) {
        console.log('Testing with file:', pdfFile);
        const filePath = path.join(uploadDir, pdfFile);
        const dataBuffer = fs.readFileSync(filePath);
        
        const result = await pdfParse(dataBuffer);
        console.log('✅ PDF Parse successful!');
        console.log('Text length:', result.text ? result.text.length : 0);
        console.log('First 200 chars:', result.text ? result.text.substring(0, 200) : 'NO TEXT');
      } else {
        console.log('No PDF files found for testing');
      }
    } else {
      console.log('❌ PDF Parse function not found');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPdfParse();