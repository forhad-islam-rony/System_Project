import GeminiService from './geminiService.js';

class RAGService {
  constructor() {
    this.knowledgeBase = [];
    this.vectorStore = new Map();
    this.initialized = false;
    this.initializeKnowledgeBase();
  }

  async initializeKnowledgeBase() {
    if (this.initialized) return;

    console.log('Initializing medical knowledge base...');
    
    try {
      const medicalKnowledge = this.getMedicalKnowledgeData();
      
      for (const knowledge of medicalKnowledge) {
        try {
          const embedding = await GeminiService.createEmbedding(knowledge.content + ' ' + knowledge.symptoms.join(' '));
          this.vectorStore.set(knowledge.id, {
            ...knowledge,
            embedding
          });
        } catch (error) {
          console.error(`Error creating embedding for ${knowledge.topic}:`, error);
        }
      }
      
      this.initialized = true;
      console.log(`Medical knowledge base initialized with ${this.vectorStore.size} entries`);
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
    }
  }

  // Find relevant medical context for query
  async findRelevantContext(query, limit = 3) {
    if (!this.initialized) {
      await this.initializeKnowledgeBase();
    }

    try {
      const queryEmbedding = await GeminiService.createEmbedding(query);
      const similarities = [];

      for (const [id, data] of this.vectorStore) {
        const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
        similarities.push({
          ...data,
          similarity
        });
      }

      // Sort by similarity and return top matches
      const topMatches = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .filter(match => match.similarity > 0.6); // Only return relevant matches

      return topMatches.map(match => ({
        topic: match.topic,
        content: match.content,
        symptoms: match.symptoms,
        severity: match.severity,
        similarity: match.similarity
      }));
    } catch (error) {
      console.error('Error finding relevant context:', error);
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

  // Get medical knowledge data
  getMedicalKnowledgeData() {
    return [
      {
        id: 'fever_1',
        topic: 'Fever',
        content: 'Fever is a temporary increase in body temperature, often due to infection. Normal body temperature is around 98.6°F (37°C). Fever is generally considered when temperature is above 100.4°F (38°C). Common causes include viral infections, bacterial infections, heat exhaustion, and certain medications.',
        symptoms: ['high temperature', 'chills', 'sweating', 'headache', 'muscle aches', 'fatigue', 'weakness'],
        severity: 'mild_to_moderate',
        treatment: 'Rest, hydration, fever-reducing medications like paracetamol',
        emergency_signs: ['fever above 103°F', 'difficulty breathing', 'severe headache', 'stiff neck']
      },
      {
        id: 'headache_1',
        topic: 'Headache',
        content: 'Headaches can be tension-type, migraine, or cluster headaches. Most are benign but persistent or severe headaches should be evaluated. Tension headaches are the most common type, often caused by stress, poor posture, or eye strain.',
        symptoms: ['head pain', 'throbbing', 'pressure', 'sensitivity to light', 'nausea', 'neck pain'],
        severity: 'mild_to_severe',
        treatment: 'Rest, hydration, pain relievers, stress management',
        emergency_signs: ['sudden severe headache', 'headache with fever and stiff neck', 'headache after head injury']
      },
      {
        id: 'chest_pain_1',
        topic: 'Chest Pain',
        content: 'Chest pain can have various causes ranging from muscle strain to serious heart conditions. Heart-related chest pain may feel like pressure, squeezing, or burning. Other causes include acid reflux, anxiety, or respiratory issues.',
        symptoms: ['chest discomfort', 'pressure', 'burning', 'squeezing', 'pain radiating to arm', 'shortness of breath'],
        severity: 'mild_to_critical',
        treatment: 'Depends on cause - immediate medical evaluation needed',
        emergency_signs: ['crushing chest pain', 'pain with sweating', 'difficulty breathing', 'pain radiating to jaw or arm']
      },
      {
        id: 'cough_1',
        topic: 'Cough',
        content: 'Cough is a common symptom that can be acute (lasting less than 3 weeks) or chronic. Common causes include viral infections, allergies, asthma, or acid reflux. Most acute coughs are due to respiratory infections.',
        symptoms: ['dry cough', 'productive cough', 'throat irritation', 'wheezing', 'runny nose'],
        severity: 'mild_to_moderate',
        treatment: 'Hydration, throat lozenges, humidifier, avoiding irritants',
        emergency_signs: ['coughing up blood', 'difficulty breathing', 'high fever with cough']
      },
      {
        id: 'abdominal_pain_1',
        topic: 'Abdominal Pain',
        content: 'Abdominal pain can originate from various organs including stomach, intestines, liver, gallbladder, or appendix. Location and characteristics of pain can help identify the cause. Common causes include indigestion, gas, constipation, or infections.',
        symptoms: ['stomach pain', 'cramping', 'bloating', 'nausea', 'vomiting', 'changes in bowel movements'],
        severity: 'mild_to_critical',
        treatment: 'Depends on cause - may include rest, dietary changes, medications',
        emergency_signs: ['severe sudden pain', 'pain with vomiting blood', 'rigid abdomen', 'pain with fever']
      },
      {
        id: 'diabetes_1',
        topic: 'Diabetes Symptoms',
        content: 'Diabetes is characterized by high blood sugar levels. Type 1 diabetes typically develops quickly, while Type 2 develops gradually. Common symptoms include increased thirst, frequent urination, and unexplained weight loss.',
        symptoms: ['excessive thirst', 'frequent urination', 'unexplained weight loss', 'fatigue', 'blurred vision', 'slow healing wounds'],
        severity: 'chronic_condition',
        treatment: 'Blood sugar monitoring, medication, diet management, exercise',
        emergency_signs: ['very high blood sugar', 'diabetic ketoacidosis symptoms', 'severe dehydration']
      },
      {
        id: 'hypertension_1',
        topic: 'High Blood Pressure',
        content: 'Hypertension often has no symptoms but can cause headaches, shortness of breath, or nosebleeds in severe cases. Normal blood pressure is less than 120/80 mmHg. High blood pressure increases risk of heart disease and stroke.',
        symptoms: ['headaches', 'shortness of breath', 'nosebleeds', 'dizziness', 'chest pain'],
        severity: 'chronic_condition',
        treatment: 'Lifestyle changes, medications, regular monitoring',
        emergency_signs: ['blood pressure over 180/120', 'severe headache with high BP', 'chest pain with high BP']
      },
      {
        id: 'respiratory_1',
        topic: 'Respiratory Issues',
        content: 'Respiratory problems can range from common cold to serious conditions like pneumonia or asthma. Symptoms include cough, shortness of breath, wheezing, and chest discomfort.',
        symptoms: ['shortness of breath', 'wheezing', 'cough', 'chest tightness', 'rapid breathing'],
        severity: 'mild_to_critical',
        treatment: 'Depends on condition - may include medications, inhalers, oxygen therapy',
        emergency_signs: ['severe difficulty breathing', 'blue lips or face', 'cannot speak in full sentences']
      },
      {
        id: 'mental_health_1',
        topic: 'Mental Health Concerns',
        content: 'Mental health is as important as physical health. Common issues include anxiety, depression, and stress-related disorders. Symptoms can affect mood, thinking, and behavior.',
        symptoms: ['persistent sadness', 'anxiety', 'mood changes', 'sleep problems', 'concentration issues', 'social withdrawal'],
        severity: 'mild_to_severe',
        treatment: 'Counseling, therapy, medications, lifestyle changes',
        emergency_signs: ['thoughts of self-harm', 'severe depression', 'panic attacks', 'psychotic symptoms']
      },
      {
        id: 'skin_conditions_1',
        topic: 'Common Skin Conditions',
        content: 'Skin conditions can include rashes, eczema, acne, or infections. Most are treatable with proper care. Symptoms vary but may include itching, redness, or changes in skin appearance.',
        symptoms: ['rash', 'itching', 'redness', 'bumps', 'dry skin', 'scaling'],
        severity: 'mild_to_moderate',
        treatment: 'Topical medications, moisturizers, avoiding triggers',
        emergency_signs: ['widespread severe rash', 'rash with fever', 'signs of serious infection']
      }
    ];
  }

  // Get condition-specific advice
  getConditionAdvice(condition) {
    const conditionData = this.getMedicalKnowledgeData().find(
      item => item.topic.toLowerCase().includes(condition.toLowerCase())
    );
    
    return conditionData || null;
  }

  // Check symptom severity
  assessSymptomSeverity(symptoms) {
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
      'severe bleeding', 'high fever', 'severe abdominal pain', 'stroke symptoms',
      'heart attack', 'severe allergic reaction', 'cannot breathe', 'choking'
    ];

    const urgentKeywords = [
      'persistent fever', 'severe pain', 'vomiting blood', 'severe dizziness',
      'vision problems', 'severe nausea', 'dehydration', 'confusion'
    ];

    const symptomText = symptoms.toLowerCase();
    
    if (emergencyKeywords.some(keyword => symptomText.includes(keyword))) {
      return 'EMERGENCY';
    } else if (urgentKeywords.some(keyword => symptomText.includes(keyword))) {
      return 'URGENT';
    } else {
      return 'ROUTINE';
    }
  }
}

export default new RAGService();
