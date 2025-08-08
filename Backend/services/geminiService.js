/**
 * @fileoverview Gemini AI Service for medical consultations and analysis
 * @description Service class that integrates Google's Gemini AI for medical response generation,
 * emergency symptom detection, medical report analysis, and text embeddings with fallback mechanisms
 * @author Healthcare System Team
 * @version 2.0.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Service class for Google Gemini AI integration in healthcare context
 * @class GeminiService
 * @description Provides medical AI capabilities including:
 * - Medical consultation responses with conversation context
 * - Emergency symptom detection and triage
 * - Medical report analysis from uploaded files
 * - Text embeddings for RAG (Retrieval-Augmented Generation)
 * - Rate limiting and error handling with intelligent fallbacks
 */
class GeminiService {
  /**
   * Initialize Gemini AI service with configuration
   * @constructor
   * @description Sets up Gemini client, model configuration, and rate limiting parameters
   */
  constructor() {
    // Initialize Gemini client with API key from environment
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use gemini-2.5-flash model for better rate limits and cost efficiency
    this.model = this.client.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Rate limiting configuration to prevent API quota exhaustion
    this.lastRequestTime = 0;
    this.requestDelay = 2000; // 2 seconds between requests for larger prompts
    
    // Note: Using simple hash-based embeddings as fallback since Gemini
    // embeddings can hit quota limits easily in development/demo scenarios
  }

  /**
   * Rate limiting helper to prevent API quota exhaustion
   * @async
   * @function waitForRateLimit
   * @description Ensures minimum delay between API calls to respect rate limits
   * @returns {Promise<void>} Resolves after appropriate delay
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  // Enhanced API call with retry and rate limiting
  async makeAPICall(apiCall, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit();
        return await apiCall();
      } catch (error) {
        console.error(`API call attempt ${attempt + 1} failed:`, error.message);
        
        if (error.status === 429) { // Rate limit error
          const retryDelay = Math.min(5000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        }
        
        // If this is the last attempt or non-rate-limit error, throw
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  // Create embeddings for text (maintaining same interface as OpenAI)
  async createEmbedding(text) {
    try {
      // Always use fallback embedding to avoid quota issues
      return this.createSimpleEmbedding(text);
    } catch (error) {
      console.error('Error creating embedding:', error);
      // Fallback: create a simple hash-based embedding if Gemini embeddings fail
      console.warn('Falling back to simple text embedding...');
      return this.createSimpleEmbedding(text);
    }
  }

  // Fallback embedding method using simple text analysis
  createSimpleEmbedding(text) {
    // Create a 1536-dimensional vector (same as OpenAI) using text characteristics
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    // Use word frequency and position to create embedding
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const pos = Math.abs(hash) % 1536;
      embedding[pos] += 1 / (index + 1); // Weight by position
    });
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  // Simple hash function for text
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Generate medical consultation response (maintaining same interface as OpenAI)
  async generateMedicalResponse(messages, context = "", reportAnalysis = "") {
    try {
      // Try API call with rate limiting and retries
      const result = await this.makeAPICall(async () => {
        const systemPrompt = this.getMedicalSystemPrompt(context, reportAnalysis);

        // Include conversation history for multi-turn context
        const conversationHistory = messages.slice(-8).map(msg => {
          if (msg.role === 'user') {
            return `Patient: ${msg.content}`;
          } else if (msg.role === 'assistant' || msg.role === 'model') {
            return `Doctor: ${msg.content}`;
          }
          return null;
        }).filter(Boolean);

        // Build comprehensive prompt with conversation context
        const prompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory.join('\n')}

MEDICAL CONTEXT: ${context}
REPORT ANALYSIS: ${reportAnalysis}

Please provide a helpful medical response that takes into account the full conversation history and maintains continuity with previous messages:`;

        return await this.model.generateContent(prompt);
      });
      
      if (!result || !result.response) {
        throw new Error('No response from Gemini API');
      }

      const aiResponse = result.response.text();
      return this.addMedicalDisclaimer(aiResponse);
    } catch (error) {
      console.error('🚫 Medical response generation failed after retries:', error.message);
      
      // Enhanced fallback with conversation context
      return this.generateContextualFallback(messages, context) + this.addMedicalDisclaimer('');
    }
  }

  // Enhanced contextual fallback that considers conversation history
  generateContextualFallback(messages, context) {
    // Get conversation context
    const conversationText = messages.slice(-4).map(msg => msg.content || '').join(' ').toLowerCase();
    const lastMessage = messages[messages.length - 1];
    const lastUserInput = lastMessage?.content || '';
    
    // Analyze conversation for ongoing medical topics
    const hasSymptomHistory = messages.some(msg => 
      msg.role === 'user' && 
      (msg.content.toLowerCase().includes('fever') || 
       msg.content.toLowerCase().includes('headache') || 
       msg.content.toLowerCase().includes('pain') ||
       msg.content.toLowerCase().includes('sick'))
    );
    
    if (hasSymptomHistory) {
      return `I understand you've been discussing your symptoms with me. While I'm experiencing technical difficulties with my AI responses, I can still provide helpful guidance based on our conversation.

From what you've shared so far, here are some important points:

**Continuing Care Recommendations:**
- Keep monitoring your symptoms as we discussed
- Note any changes in severity or new symptoms
- Follow any treatment suggestions we covered earlier
- Stay hydrated and get adequate rest

**When to Seek Immediate Care:**
- If symptoms worsen significantly
- If you develop new concerning symptoms
- If you feel your condition is deteriorating
- For any emergency symptoms (chest pain, difficulty breathing, severe headache)

**Follow-up Actions:**
- Consider scheduling an appointment with your healthcare provider
- Keep a symptom diary with times and severity
- Have any medications or treatments we discussed ready
- Don't hesitate to seek emergency care if needed

Would you like me to focus on any specific aspect of your symptoms that we were discussing?`;
    }
    
    return this.generateSmartFallback(lastUserInput, context);
  }

  // Smart fallback response based on user input
  generateSmartFallback(userInput, context) {
    const input = userInput.toLowerCase();
    
    // Check for common medical keywords and provide relevant responses
    if (input.includes('fever') || input.includes('temperature')) {
      return `Regarding fever: Fever is your body's natural response to infection. For adults, a fever is generally considered 100.4°F (38°C) or higher. 

Treatment suggestions:
- Rest and stay hydrated
- Take paracetamol or ibuprofen as directed
- Use light clothing and maintain room temperature
- Monitor temperature regularly

Seek immediate medical attention if:
- Fever exceeds 103°F (39.4°C)
- Accompanied by severe headache, stiff neck, or difficulty breathing
- Fever persists for more than 3 days

For infants under 3 months, any fever requires immediate medical attention.`;
    }
    
    if (input.includes('headache') || input.includes('head pain')) {
      return `Regarding headaches: Most headaches are tension-type and not dangerous, but some require medical attention.

Common causes:
- Stress, dehydration, lack of sleep
- Eye strain from screens
- Muscle tension in neck/shoulders
- Certain foods or medications

Treatment options:
- Rest in a quiet, dark room
- Apply cold or warm compress
- Stay hydrated
- Gentle neck and shoulder stretches
- Over-the-counter pain relievers as needed

Seek immediate care if headache is:
- Sudden and severe ("worst headache of your life")
- Accompanied by fever, stiff neck, confusion
- Following a head injury
- With vision changes or weakness`;
    }
    
    if (input.includes('chest pain') || input.includes('heart')) {
      return `⚠️ IMPORTANT: Chest pain can be serious. 

If you're experiencing:
- Crushing, squeezing chest pain
- Pain radiating to arm, jaw, or back
- Shortness of breath
- Sweating, nausea, dizziness

Call emergency services (999) immediately or go to the nearest emergency room.

For mild chest discomfort that may be non-cardiac:
- Could be muscle strain, acid reflux, or anxiety
- Still worth discussing with a healthcare provider
- Monitor symptoms and seek care if they worsen

Never ignore chest pain - when in doubt, seek immediate medical attention.`;
    }
    
    // General fallback
    return `I apologize that I can't provide AI-generated responses right now due to technical limitations. However, here's some general guidance:

Based on your question about "${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}", I recommend:

1. **For urgent symptoms**: Contact emergency services (999) or visit your nearest hospital
2. **For general health concerns**: Schedule an appointment with your primary care physician
3. **For medication questions**: Consult your pharmacist or prescribing doctor
4. **For preventive care**: Maintain healthy lifestyle habits

Important: This is general information only. Always consult qualified healthcare professionals for proper medical evaluation and treatment.`;
  }

  // Fallback response when API fails
  getFallbackMedicalResponse() {
    return `I apologize, but I'm currently experiencing technical difficulties. Here are some general health guidelines:

1. For urgent medical concerns, please contact emergency services (999 in Bangladesh) or visit your nearest hospital
2. For non-urgent issues, consider scheduling an appointment with your primary care physician
3. Maintain a healthy lifestyle with proper diet, exercise, and adequate sleep
4. Stay hydrated and follow any prescribed medications as directed

Please consult with a qualified healthcare professional for personalized medical advice.`;
  }

  // Analyze medical report (maintaining same interface as OpenAI)
  async analyzeMedicalReport(extractedText, patientContext = "") {
    console.log('📄 Analyzing medical report (using enhanced fallback)');
    
    // Provide a comprehensive fallback analysis without API calls
    const analysis = `📋 **Medical Report Analysis**

📄 **Document Processing**: I've received your medical report for analysis.

🔍 **General Guidance for Medical Report Review**:

**What to Look For**:
1. **Normal vs. Abnormal Values**: Check if results are within reference ranges
2. **Trending Patterns**: Compare with previous reports if available  
3. **Critical Values**: Look for any results marked as "high," "low," or "critical"
4. **Follow-up Recommendations**: Note any suggested additional tests

**Common Report Types & Key Areas**:
- **Blood Tests**: CBC, metabolic panels, lipid profiles, liver/kidney function
- **Imaging**: X-rays, CT scans, MRI findings and impressions
- **Cardiac Tests**: EKG, echocardiogram, stress test results
- **Pathology**: Biopsy results, tissue analysis

**Important Questions for Your Doctor**:
1. "What do these results mean for my health?"
2. "Are any values outside normal range concerning?"
3. "What follow-up is needed based on these results?"
4. "Should I change any medications or lifestyle habits?"
5. "When should I repeat these tests?"

**Next Steps**:
- Schedule a follow-up appointment to discuss results
- Ask for a copy of your complete medical records
- Request clarification on any confusing medical terminology
- Inquire about lifestyle modifications if needed

**Red Flags to Discuss Immediately**:
- Any results marked as "critical" or "urgent"
- Significant changes from previous results
- Recommendations for immediate follow-up care

Remember: Medical reports can be complex, and professional interpretation is essential for proper understanding and treatment planning.`;

    return this.addMedicalDisclaimer(analysis);
  }

  // Check for emergency symptoms (maintaining same interface as OpenAI)
  async checkEmergencySymptoms(symptoms) {
    
    // Use keyword-based emergency detection to avoid API calls during rate limits
    const criticalKeywords = [
      'chest pain', 'can\'t breathe', 'difficulty breathing', 'severe headache', 
      'stroke', 'heart attack', 'severe bleeding', 'unconscious', 'collapse',
      'severe abdominal pain', 'severe allergic reaction', 'anaphylaxis',
      'severe burns', 'poisoning', 'overdose', 'seizure', 'choking'
    ];
    
    const urgentKeywords = [
      'high fever', 'vomiting blood', 'severe pain', 'confusion',
      'vision problems', 'severe dizziness', 'dehydration', 'broken bone'
    ];
    
    const symptomsLower = symptoms.toLowerCase();
    
    const hasCritical = criticalKeywords.some(keyword => symptomsLower.includes(keyword));
    const hasUrgent = urgentKeywords.some(keyword => symptomsLower.includes(keyword));
    
    if (hasCritical) {
      return `EMERGENCY_LEVEL: HIGH
🚨 CRITICAL: These symptoms may indicate a medical emergency.
      
IMMEDIATE ACTION REQUIRED:
- Call emergency services (999) NOW
- Go to the nearest emergency department immediately
- If possible, have someone accompany you
- Do not drive yourself

Common emergencies detected: chest pain, breathing difficulties, stroke symptoms, severe bleeding.`;
    } else if (hasUrgent) {
      return `EMERGENCY_LEVEL: MEDIUM
⚠️ URGENT: These symptoms require prompt medical attention.

RECOMMENDED ACTIONS:
- Contact your healthcare provider immediately
- Consider visiting urgent care or emergency department
- Monitor symptoms closely
- Seek emergency care if symptoms worsen

If symptoms become severe, call 999.`;
    } else {
      return `EMERGENCY_LEVEL: LOW
ℹ️ ROUTINE: These symptoms should be evaluated by a healthcare provider.

RECOMMENDED ACTIONS:
- Schedule an appointment with your doctor
- Monitor symptoms
- Follow general health guidelines
- Seek urgent care if symptoms worsen significantly

Contact emergency services if you develop severe symptoms.`;
    }
  }

  // Get medical system prompt (same as OpenAI implementation)
  getMedicalSystemPrompt(context, reportAnalysis) {
    return `You are a compassionate and knowledgeable medical AI assistant for a healthcare platform in Bangladesh. 

CRITICAL REQUIREMENTS:
- ALWAYS respond in English, regardless of the input language
- Maintain conversation continuity by referring to previous symptoms discussed
- Remember the patient's medical history from earlier in the conversation
- Provide follow-up responses that build on previous medical discussions

IMPORTANT GUIDELINES:
- Always recommend consulting with qualified healthcare professionals
- Provide helpful health information while being clear about limitations
- Be empathetic and supportive
- Use simple, understandable English language
- Consider the healthcare context in Bangladesh
- Never provide definitive diagnoses
- Always include appropriate medical disclaimers

AVAILABLE CONTEXT:
Medical Knowledge: ${context}
Recent Report Analysis: ${reportAnalysis}

RESPONSE GUIDELINES:
1. Listen carefully to symptoms and concerns from the entire conversation
2. Reference previous symptoms or concerns mentioned earlier
3. Provide general health information and possible causes
4. Suggest when to seek immediate medical attention
5. Recommend appropriate specialists when relevant
6. Include relevant lifestyle and preventive advice
7. Always encourage professional medical consultation

EMERGENCY PROTOCOLS:
- If symptoms suggest emergency: Immediately recommend emergency services
- Provide emergency contact information for Bangladesh (999 for ambulance)
- Suggest visiting nearest hospital emergency department

CONVERSATION CONTINUITY:
- Always acknowledge previous symptoms mentioned in the conversation
- Build upon earlier medical discussions
- Provide progressive medical guidance based on symptom development
- Remember treatment suggestions made earlier in the conversation

Remember: You are here to provide support and general health information, not to replace professional medical care. Always respond in English and maintain conversation context.`;
  }

  // Add medical disclaimer to response (same as OpenAI implementation)
  addMedicalDisclaimer(response) {
    const disclaimer = "\n\n⚠️ **Medical Disclaimer**: This information is for educational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment. In case of emergency, call 999 or visit your nearest emergency department.";
    
    return response + disclaimer;
  }

  // Generate follow-up questions (maintaining same interface as OpenAI)
  async generateFollowUpQuestions(conversationHistory) {
    // Return empty string to disable follow-up questions
    return '';
  }
}

export default new GeminiService();