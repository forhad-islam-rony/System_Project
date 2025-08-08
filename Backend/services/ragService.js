/**
 * @fileoverview Retrieval-Augmented Generation (RAG) Service for Medical AI
 * @description Implements RAG system for medical knowledge retrieval and context
 * enhancement. Uses vector embeddings to find relevant medical information and
 * provides symptom severity assessment.
 * @author Healthcare System Team
 * @version 1.0.0
 */

import GeminiService from './geminiService.js';

/**
 * RAG Service for medical knowledge retrieval and context enhancement
 * @class RAGService
 * @description Provides medical knowledge management and retrieval with:
 * - Vector-based medical knowledge storage
 * - Semantic similarity search for relevant information
 * - Symptom severity assessment
 * - Condition-specific medical advice
 * - Emergency symptom detection
 */
class RAGService {
  /**
   * Initialize RAG service with empty knowledge base
   * @constructor
   * @description Sets up knowledge base storage and starts initialization process:
   * - Creates empty knowledge base array
   * - Initializes vector store for embeddings
   * - Sets initialization flag
   * - Triggers knowledge base population
   */
  constructor() {
    this.knowledgeBase = [];          // Raw medical knowledge data
    this.vectorStore = new Map();     // Stores embeddings with metadata
    this.initialized = false;         // Initialization status flag
    this.initializeKnowledgeBase();  // Start async initialization
  }

  /**
   * Initialize medical knowledge base with embeddings
   * @async
   * @function initializeKnowledgeBase
   * @description Loads medical knowledge and creates vector embeddings:
   * - Loads predefined medical knowledge data
   * - Creates embeddings for each knowledge entry
   * - Stores embeddings with metadata in vector store
   * - Handles initialization errors gracefully
   * @returns {Promise<void>} Resolves when initialization is complete
   */
  async initializeKnowledgeBase() {
    // Skip if already initialized
    if (this.initialized) return;

    console.log('Initializing medical knowledge base...');
    
    try {
      // Load medical knowledge data
      const medicalKnowledge = this.getMedicalKnowledgeData();
      
      // Create embeddings for each knowledge entry
      for (const knowledge of medicalKnowledge) {
        try {
          // Combine content and symptoms for better semantic matching
          const embedding = await GeminiService.createEmbedding(
            knowledge.content + ' ' + knowledge.symptoms.join(' ')
          );
          
          // Store embedding with metadata
          this.vectorStore.set(knowledge.id, {
            ...knowledge,
            embedding
          });
        } catch (error) {
          console.error(`Error creating embedding for ${knowledge.topic}:`, error);
        }
      }
      
      // Mark initialization as complete
      this.initialized = true;
      console.log(`Medical knowledge base initialized with ${this.vectorStore.size} entries`);
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
    }
  }

  /**
   * Find relevant medical context for a query
   * @async
   * @function findRelevantContext
   * @param {string} query - User's medical query or symptoms
   * @param {number} [limit=3] - Maximum number of relevant matches to return
   * @returns {Promise<Array>} Array of relevant medical information
   * @description Finds relevant medical information using semantic search:
   * - Creates embedding for user query
   * - Calculates similarity with knowledge base entries
   * - Returns top matches above similarity threshold
   * - Includes topic, content, symptoms, and severity
   */
  async findRelevantContext(query, limit = 3) {
    // Ensure knowledge base is initialized
    if (!this.initialized) {
      await this.initializeKnowledgeBase();
    }

    try {
      // Create embedding for user query
      const queryEmbedding = await GeminiService.createEmbedding(query);
      const similarities = [];

      // Calculate similarity with all knowledge base entries
      for (const [id, data] of this.vectorStore) {
        const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
        similarities.push({
          ...data,
          similarity
        });
      }

      // Sort by similarity and filter top matches
      const topMatches = similarities
        .sort((a, b) => b.similarity - a.similarity)  // Sort by highest similarity
        .slice(0, limit)                             // Take top N matches
        .filter(match => match.similarity > 0.6);    // Only return relevant matches

      // Return relevant information without embeddings
      return topMatches.map(match => ({
        topic: match.topic,           // Medical condition/topic
        content: match.content,       // Detailed medical information
        symptoms: match.symptoms,     // Associated symptoms
        severity: match.severity,     // Condition severity level
        similarity: match.similarity  // Match relevance score
      }));
    } catch (error) {
      console.error('Error finding relevant context:', error);
      return [];  // Return empty array on error
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @function cosineSimilarity
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Similarity score between 0 and 1
   * @description Calculates the cosine similarity between two vectors:
   * - Handles vectors of different lengths
   * - Computes dot product and magnitudes
   * - Returns normalized similarity score
   * - Handles zero magnitude vectors
   */
  cosineSimilarity(a, b) {
    // Return 0 if vectors have different lengths
    if (a.length !== b.length) return 0;
    
    // Calculate dot product of vectors
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    
    // Calculate vector magnitudes
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    
    // Handle zero magnitude vectors
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    // Return normalized similarity score
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get predefined medical knowledge data
   * @function getMedicalKnowledgeData
   * @returns {Array<Object>} Array of medical conditions with details
   * @description Returns structured medical knowledge including:
   * - Common medical conditions and symptoms
   * - Severity levels and treatments
   * - Emergency warning signs
   * - Detailed descriptions and advice
   */
  getMedicalKnowledgeData() {
    return [
      {
        id: 'covid19_1',
        topic: 'COVID-19',
        content: 'COVID-19 is a respiratory illness caused by the SARS-CoV-2 virus. Symptoms can range from mild to severe. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, or talks. Incubation period is typically 2-14 days.',
        symptoms: ['fever', 'dry cough', 'fatigue', 'loss of taste or smell', 'body aches', 'shortness of breath', 'sore throat'],
        severity: 'mild_to_critical',
        treatment: 'Rest, hydration, monitoring oxygen levels, antiviral medications if prescribed',
        emergency_signs: ['severe difficulty breathing', 'persistent chest pain', 'confusion', 'bluish lips or face']
      },
      {
        id: 'asthma_1',
        topic: 'Asthma',
        content: 'Asthma is a chronic respiratory condition that causes inflammation and narrowing of the airways. It can be triggered by allergens, exercise, cold air, or stress. Regular management and avoiding triggers are key to controlling symptoms.',
        symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'difficulty sleeping'],
        severity: 'mild_to_severe',
        treatment: 'Inhalers (rescue and maintenance), avoiding triggers, action plan',
        emergency_signs: ['severe breathing difficulty', 'rapid worsening of symptoms', 'no improvement with rescue inhaler']
      },
      {
        id: 'arthritis_1',
        topic: 'Arthritis',
        content: 'Arthritis refers to inflammation of joints causing pain and stiffness. Common types include osteoarthritis (wear and tear) and rheumatoid arthritis (autoimmune). Symptoms often worsen with age and can affect daily activities.',
        symptoms: ['joint pain', 'stiffness', 'swelling', 'reduced range of motion', 'redness', 'warmth in joints'],
        severity: 'chronic_condition',
        treatment: 'Pain management, physical therapy, anti-inflammatory medications',
        emergency_signs: ['severe sudden joint pain', 'joint deformity', 'inability to move joint']
      },
      {
        id: 'migraine_1',
        topic: 'Migraine',
        content: 'Migraines are severe headaches often accompanied by other symptoms. They can be triggered by various factors including stress, certain foods, hormonal changes, or environmental factors. Episodes can last hours to days.',
        symptoms: ['severe headache', 'pulsating pain', 'nausea', 'vomiting', 'light sensitivity', 'sound sensitivity', 'aura'],
        severity: 'moderate_to_severe',
        treatment: 'Pain relief medications, preventive medications, trigger avoidance',
        emergency_signs: ['worst headache ever', 'headache with neurological symptoms', 'confusion']
      },
      {
        id: 'gastritis_1',
        topic: 'Gastritis',
        content: 'Gastritis is inflammation of the stomach lining that can be acute or chronic. Common causes include H. pylori infection, excessive alcohol use, or regular use of NSAIDs. Diet modifications often help manage symptoms.',
        symptoms: ['stomach pain', 'nausea', 'vomiting', 'bloating', 'indigestion', 'loss of appetite'],
        severity: 'mild_to_moderate',
        treatment: 'Antacids, acid reducers, avoiding trigger foods, H. pylori treatment if needed',
        emergency_signs: ['severe abdominal pain', 'vomiting blood', 'black stools']
      },
      {
        id: 'anemia_1',
        topic: 'Anemia',
        content: 'Anemia occurs when the body lacks enough healthy red blood cells to carry oxygen. Common causes include iron deficiency, vitamin B12 deficiency, or chronic diseases. Regular blood tests help monitor condition.',
        symptoms: ['fatigue', 'weakness', 'shortness of breath', 'dizziness', 'pale skin', 'cold hands and feet'],
        severity: 'mild_to_severe',
        treatment: 'Iron supplements, dietary changes, vitamin B12 supplements',
        emergency_signs: ['severe shortness of breath', 'chest pain', 'fainting']
      },
      {
        id: 'thyroid_1',
        topic: 'Thyroid Disorders',
        content: "Thyroid disorders affect the thyroid gland's ability to produce hormones. Common conditions include hypothyroidism (underactive) and hyperthyroidism (overactive). Regular monitoring and medication adjustments may be needed.",
        symptoms: ['fatigue', 'weight changes', 'mood changes', 'temperature sensitivity', 'irregular heartbeat'],
        severity: 'chronic_condition',
        treatment: 'Hormone replacement or suppression medications, regular monitoring',
        emergency_signs: ['severe rapid heartbeat', 'extreme fatigue', 'thyroid storm symptoms']
      },
      {
        id: 'gerd_1',
        topic: 'GERD',
        content: 'Gastroesophageal Reflux Disease (GERD) occurs when stomach acid frequently flows back into the esophagus. It can cause chronic symptoms and complications if untreated. Lifestyle changes often help manage symptoms.',
        symptoms: ['heartburn', 'chest pain', 'difficulty swallowing', 'regurgitation', 'chronic cough'],
        severity: 'chronic_condition',
        treatment: 'Acid reducers, lifestyle changes, avoiding trigger foods',
        emergency_signs: ['severe chest pain', 'difficulty breathing', 'inability to swallow']
      },
      {
        id: 'allergies_1',
        topic: 'Allergies',
        content: 'Allergies are immune system responses to substances normally harmless to most people. Common allergens include pollen, dust, food, and pet dander. Severity can range from mild to life-threatening.',
        symptoms: ['sneezing', 'runny nose', 'itchy eyes', 'skin rash', 'wheezing', 'congestion'],
        severity: 'mild_to_severe',
        treatment: 'Antihistamines, nasal sprays, avoiding triggers, immunotherapy',
        emergency_signs: ['difficulty breathing', 'throat swelling', 'severe dizziness']
      },
      {
        id: 'insomnia_1',
        topic: 'Insomnia',
        content: 'Insomnia is a sleep disorder making it difficult to fall asleep, stay asleep, or both. Can be acute (short-term) or chronic (long-term). Often related to stress, medical conditions, or medications.',
        symptoms: ['difficulty sleeping', 'daytime fatigue', 'mood changes', 'difficulty concentrating', 'headaches'],
        severity: 'mild_to_severe',
        treatment: 'Sleep hygiene, cognitive behavioral therapy, medications if needed',
        emergency_signs: ['chest pain with insomnia', 'severe mental health symptoms']
      },
      {
        id: 'ibs_1',
        topic: 'Irritable Bowel Syndrome',
        content: 'IBS is a common disorder affecting the large intestine. It can cause various digestive symptoms and is often triggered by stress, certain foods, or hormonal changes. Management focuses on symptom control.',
        symptoms: ['abdominal pain', 'bloating', 'diarrhea', 'constipation', 'gas', 'cramping'],
        severity: 'chronic_condition',
        treatment: 'Dietary changes, stress management, fiber supplements, medications',
        emergency_signs: ['severe abdominal pain', 'rectal bleeding', 'unexplained weight loss']
      },
      {
        id: 'sinusitis_1',
        topic: 'Sinusitis',
        content: 'Sinusitis is inflammation of the sinuses, often following a cold or allergies. Can be acute or chronic. Bacterial infections may require antibiotics, while viral cases typically resolve on their own.',
        symptoms: ['facial pain', 'nasal congestion', 'thick nasal discharge', 'reduced smell', 'headache'],
        severity: 'mild_to_moderate',
        treatment: 'Nasal decongestants, saline rinses, antibiotics if bacterial',
        emergency_signs: ['severe headache', 'visual changes', 'mental confusion']
      },
      {
        id: 'bronchitis_1',
        topic: 'Bronchitis',
        content: 'Bronchitis is inflammation of the bronchial tubes. Acute bronchitis is usually viral and self-limiting, while chronic bronchitis is often related to smoking and may be part of COPD.',
        symptoms: ['persistent cough', 'mucus production', 'chest discomfort', 'fatigue', 'mild fever'],
        severity: 'mild_to_moderate',
        treatment: 'Rest, hydration, humidifier use, bronchodilators if needed',
        emergency_signs: ['severe breathing difficulty', 'high fever', 'coughing blood']
      },
      {
        id: 'vertigo_1',
        topic: 'Vertigo',
        content: 'Vertigo is a sensation of spinning or dizziness. Can be caused by inner ear problems, migraine, or other conditions. Episodes can last from minutes to days and may affect balance.',
        symptoms: ['spinning sensation', 'dizziness', 'nausea', 'balance problems', 'headache'],
        severity: 'mild_to_severe',
        treatment: 'Vestibular rehabilitation, medications, treating underlying cause',
        emergency_signs: ['sudden severe vertigo', 'neurological symptoms', 'hearing loss']
      },
      {
        id: 'gallstones_1',
        topic: 'Gallstones',
        content: 'Gallstones are hardened deposits in the gallbladder. They can cause pain when they block bile ducts. Risk factors include obesity, high-fat diet, and certain medical conditions.',
        symptoms: ['upper abdominal pain', 'nausea', 'vomiting', 'back pain', 'indigestion'],
        severity: 'moderate_to_severe',
        treatment: 'Surgery if symptomatic, dietary changes, pain management',
        emergency_signs: ['severe abdominal pain', 'fever with pain', 'jaundice']
      },
      {
        id: 'pneumonia_1',
        topic: 'Pneumonia',
        content: 'Pneumonia is an infection causing inflammation in the air sacs of lungs. Can be bacterial, viral, or fungal. Severity ranges from mild to life-threatening, especially in vulnerable populations.',
        symptoms: ['cough with phlegm', 'fever', 'chills', 'difficulty breathing', 'chest pain'],
        severity: 'moderate_to_severe',
        treatment: 'Antibiotics if bacterial, rest, hydration, oxygen therapy if needed',
        emergency_signs: ['severe breathing difficulty', 'bluish skin', 'confusion']
      },
      {
        id: 'kidney_stones_1',
        topic: 'Kidney Stones',
        content: 'Kidney stones are hard deposits made of minerals and salts that form inside kidneys. They can cause severe pain when passing through the urinary tract. Prevention includes adequate hydration.',
        symptoms: ['severe back pain', 'abdominal pain', 'painful urination', 'blood in urine', 'nausea'],
        severity: 'moderate_to_severe',
        treatment: 'Pain management, hydration, medical procedures if needed',
        emergency_signs: ['severe pain', 'fever with pain', 'complete inability to urinate']
      },
      {
        id: 'osteoporosis_1',
        topic: 'Osteoporosis',
        content: 'Osteoporosis causes bones to become weak and brittle. Risk increases with age, especially in postmenopausal women. Regular exercise and calcium intake help maintain bone strength.',
        symptoms: ['back pain', 'loss of height', 'stooped posture', 'easily broken bones'],
        severity: 'chronic_condition',
        treatment: 'Calcium supplements, vitamin D, medications, weight-bearing exercise',
        emergency_signs: ['sudden severe back pain', 'inability to move after fall']
      },
      {
        id: 'parkinsons_1',
        topic: 'Parkinson\'s Disease',
        content: 'Parkinson\'s is a progressive nervous system disorder affecting movement. Symptoms develop gradually and can include tremors, stiffness, and balance problems.',
        symptoms: ['tremors', 'slow movement', 'rigid muscles', 'impaired balance', 'speech changes'],
        severity: 'chronic_progressive',
        treatment: 'Medications to manage symptoms, physical therapy, lifestyle modifications',
        emergency_signs: ['falling and injury', 'severe depression', 'inability to move']
      },
      {
        id: 'celiac_1',
        topic: 'Celiac Disease',
        content: 'Celiac disease is an immune reaction to eating gluten. It causes inflammation damaging the small intestine\'s lining. Strict gluten-free diet is essential for management.',
        symptoms: ['diarrhea', 'bloating', 'fatigue', 'weight loss', 'anemia', 'skin rash'],
        severity: 'chronic_condition',
        treatment: 'Strict gluten-free diet, nutritional supplements if needed',
        emergency_signs: ['severe abdominal pain', 'excessive diarrhea', 'dehydration']
      },
      {
        id: 'lupus_1',
        topic: 'Lupus',
        content: 'Lupus is an autoimmune disease causing inflammation throughout the body. Can affect joints, skin, kidneys, and other organs. Symptoms can flare up and remit.',
        symptoms: ['joint pain', 'butterfly rash', 'fatigue', 'fever', 'sun sensitivity'],
        severity: 'chronic_condition',
        treatment: 'Immunosuppressants, anti-inflammatory medications, lifestyle changes',
        emergency_signs: ['severe chest pain', 'severe headache', 'confusion']
      },
      {
        id: 'endometriosis_1',
        topic: 'Endometriosis',
        content: 'Endometriosis occurs when tissue similar to the uterine lining grows outside the uterus. Can cause severe pain and fertility issues. Treatment depends on severity and fertility desires.',
        symptoms: ['pelvic pain', 'painful periods', 'painful intercourse', 'infertility', 'heavy bleeding'],
        severity: 'chronic_condition',
        treatment: 'Pain medications, hormone therapy, surgery in severe cases',
        emergency_signs: ['severe pelvic pain', 'heavy bleeding', 'signs of infection']
      },
      {
        id: 'psoriasis_1',
        topic: 'Psoriasis',
        content: 'Psoriasis is a chronic skin condition causing rapid skin cell buildup. Results in thick, scaly patches. Can be triggered by stress, infections, or weather.',
        symptoms: ['red scaly patches', 'itching', 'burning', 'joint pain', 'thick nails'],
        severity: 'chronic_condition',
        treatment: 'Topical treatments, light therapy, systemic medications',
        emergency_signs: ['severe widespread rash', 'signs of infection', 'joint swelling']
      },
      {
        id: 'glaucoma_1',
        topic: 'Glaucoma',
        content: 'Glaucoma is a group of eye conditions damaging the optic nerve. Often caused by high pressure in the eye. Early detection and treatment crucial to prevent vision loss.',
        symptoms: ['gradual vision loss', 'eye pain', 'headache', 'rainbow halos around lights'],
        severity: 'chronic_progressive',
        treatment: 'Eye drops, laser treatment, surgery if needed',
        emergency_signs: ['sudden vision loss', 'severe eye pain', 'nausea with eye pain']
      },
      {
        id: 'tinnitus_1',
        topic: 'Tinnitus',
        content: 'Tinnitus causes ringing or buzzing in the ears. Can be constant or intermittent. Often related to hearing loss, ear injury, or circulatory problems.',
        symptoms: ['ringing in ears', 'buzzing sound', 'difficulty concentrating', 'sleep problems'],
        severity: 'mild_to_severe',
        treatment: 'Sound therapy, hearing aids, stress management, treating underlying causes',
        emergency_signs: ['sudden hearing loss', 'dizziness with tinnitus', 'facial weakness']
      },
      {
        id: 'carpal_tunnel_1',
        topic: 'Carpal Tunnel Syndrome',
        content: 'Carpal tunnel syndrome occurs when the median nerve is compressed in the wrist. Common in people who perform repetitive hand movements. Can cause permanent nerve damage if untreated.',
        symptoms: ['hand numbness', 'tingling', 'weak grip', 'wrist pain', 'dropping objects'],
        severity: 'mild_to_severe',
        treatment: 'Wrist splints, ergonomic changes, surgery in severe cases',
        emergency_signs: ['complete loss of feeling', 'severe weakness', 'muscle wasting']
      },
      {
        id: 'sleep_apnea_1',
        topic: 'Sleep Apnea',
        content: 'Sleep apnea causes breathing to repeatedly stop during sleep. Can lead to serious health complications if untreated. Risk factors include obesity and family history.',
        symptoms: ['loud snoring', 'breathing pauses', 'morning headaches', 'daytime sleepiness'],
        severity: 'moderate_to_severe',
        treatment: 'CPAP machine, lifestyle changes, dental devices',
        emergency_signs: ['choking during sleep', 'severe daytime drowsiness', 'chest pain']
      },
      {
        id: 'fibromyalgia_1',
        topic: 'Fibromyalgia',
        content: 'Fibromyalgia causes widespread musculoskeletal pain along with fatigue, sleep, memory and mood issues. Exact cause unknown but likely involves how brain processes pain signals.',
        symptoms: ['widespread pain', 'fatigue', 'cognitive difficulties', 'sleep problems', 'depression'],
        severity: 'chronic_condition',
        treatment: 'Pain medications, exercise, stress management, sleep hygiene',
        emergency_signs: ['severe depression', 'suicidal thoughts', 'severe pain crisis']
      },
      {
        id: 'gout_1',
        topic: 'Gout',
        content: 'Gout is a form of arthritis caused by excess uric acid. Causes sudden, severe attacks of pain, swelling, and redness. Diet and lifestyle factors can trigger attacks.',
        symptoms: ['severe joint pain', 'swelling', 'redness', 'limited movement', 'warmth in joint'],
        severity: 'moderate_to_severe',
        treatment: 'Anti-inflammatory medications, dietary changes, preventive medications',
        emergency_signs: ['severe pain with fever', 'joint infection signs', 'multiple joint involvement']
      },
      {
        id: 'diverticulitis_1',
        topic: 'Diverticulitis',
        content: 'Diverticulitis occurs when small pouches in the digestive tract become inflamed or infected. Common in older adults. Diet plays important role in prevention.',
        symptoms: ['abdominal pain', 'fever', 'nausea', 'changed bowel habits', 'bloating'],
        severity: 'moderate_to_severe',
        treatment: 'Antibiotics, liquid diet, surgery in severe cases',
        emergency_signs: ['severe abdominal pain', 'high fever', 'inability to pass stool']
      },
      {
        id: 'bells_palsy_1',
        topic: 'Bell\'s Palsy',
        content: 'Bell\'s palsy causes sudden weakness in facial muscles. Usually affects one side of face. Most cases improve without treatment within months.',
        symptoms: ['facial drooping', 'difficulty smiling', 'drooling', 'eye problems', 'taste changes'],
        severity: 'moderate',
        treatment: 'Corticosteroids, eye protection, physical therapy',
        emergency_signs: ['complete paralysis', 'other neurological symptoms', 'severe pain']
      },
      {
        id: 'meningitis_1',
        topic: 'Meningitis',
        content: 'Meningitis is inflammation of membranes surrounding brain and spinal cord. Can be bacterial, viral, or fungal. Bacterial meningitis is medical emergency requiring immediate treatment.',
        symptoms: ['severe headache', 'stiff neck', 'fever', 'confusion', 'sensitivity to light'],
        severity: 'severe',
        treatment: 'Immediate antibiotics if bacterial, supportive care, hospitalization',
        emergency_signs: ['severe headache', 'neck stiffness', 'rapid deterioration']
      },
      {
        id: 'addisons_1',
        topic: 'Addison\'s Disease',
        content: 'Addison\'s disease occurs when adrenal glands don\'t produce enough hormones. Can be life-threatening if untreated. Regular medication essential.',
        symptoms: ['fatigue', 'muscle weakness', 'low blood pressure', 'skin darkening', 'salt craving'],
        severity: 'chronic_condition',
        treatment: 'Hormone replacement therapy, stress dose steroids when needed',
        emergency_signs: ['severe weakness', 'confusion', 'severe abdominal pain']
      },
      {
        id: 'peripheral_neuropathy_1',
        topic: 'Peripheral Neuropathy',
        content: 'Peripheral neuropathy results from damage to peripheral nerves. Can cause weakness, numbness, and pain. Common in diabetics and those with vitamin deficiencies.',
        symptoms: ['numbness', 'tingling', 'burning pain', 'muscle weakness', 'coordination problems'],
        severity: 'chronic_progressive',
        treatment: 'Pain management, treating underlying cause, physical therapy',
        emergency_signs: ['sudden weakness', 'severe pain', 'injury due to numbness']
      },
      {
        id: 'ulcerative_colitis_1',
        topic: 'Ulcerative Colitis',
        content: 'Ulcerative colitis is inflammatory bowel disease causing inflammation in digestive tract. Can lead to serious complications if untreated. Symptoms often come and go.',
        symptoms: ['abdominal pain', 'bloody diarrhea', 'urgency', 'weight loss', 'fatigue'],
        severity: 'chronic_condition',
        treatment: 'Anti-inflammatory drugs, immune system suppressors, surgery if needed',
        emergency_signs: ['severe bleeding', 'severe abdominal pain', 'high fever']
      },
      {
        id: 'multiple_sclerosis_1',
        topic: 'Multiple Sclerosis',
        content: 'Multiple sclerosis is a disease where immune system attacks protective covering of nerves. Causes communication problems between brain and body. Symptoms vary widely.',
        symptoms: ['fatigue', 'vision problems', 'numbness', 'balance problems', 'cognitive changes'],
        severity: 'chronic_progressive',
        treatment: 'Disease-modifying medications, symptom management, rehabilitation',
        emergency_signs: ['sudden vision loss', 'severe weakness', 'difficulty speaking']
      },
      {
        id: 'rheumatoid_arthritis_1',
        topic: 'Rheumatoid Arthritis',
        content: 'Rheumatoid arthritis is autoimmune disorder causing joint inflammation. Can damage various body systems. Early treatment can help prevent joint destruction.',
        symptoms: ['joint pain', 'swelling', 'stiffness', 'fatigue', 'fever'],
        severity: 'chronic_progressive',
        treatment: 'Disease-modifying drugs, anti-inflammatory medications, physical therapy',
        emergency_signs: ['severe joint pain', 'difficulty breathing', 'chest pain']
      },
      {
        id: 'chronic_fatigue_1',
        topic: 'Chronic Fatigue Syndrome',
        content: 'Chronic fatigue syndrome causes extreme fatigue that can\'t be explained by underlying medical condition. Activities may worsen symptoms but rest doesn\'t improve them.',
        symptoms: ['severe fatigue', 'sleep problems', 'difficulty concentrating', 'muscle pain', 'headaches'],
        severity: 'chronic_condition',
        treatment: 'Activity management, sleep hygiene, treating specific symptoms',
        emergency_signs: ['severe depression', 'suicidal thoughts', 'severe pain']
      },
      {
        id: 'interstitial_cystitis_1',
        topic: 'Interstitial Cystitis',
        content: 'Interstitial cystitis is chronic bladder condition causing bladder pressure and pain. Can cause frequent urination and pain. No cure but treatments can help manage symptoms.',
        symptoms: ['pelvic pain', 'urgent urination', 'frequent urination', 'pain during intercourse'],
        severity: 'chronic_condition',
        treatment: 'Medications, bladder instillations, dietary modifications',
        emergency_signs: ['severe pain', 'inability to urinate', 'fever with symptoms']
      },
      {
        id: 'sjogrens_1',
        topic: 'Sjögren\'s Syndrome',
        content: 'Sjögren\'s syndrome is autoimmune disorder affecting moisture-producing glands. Commonly affects eyes and mouth. Can occur with other autoimmune conditions.',
        symptoms: ['dry eyes', 'dry mouth', 'joint pain', 'fatigue', 'swollen salivary glands'],
        severity: 'chronic_condition',
        treatment: 'Artificial tears, saliva substitutes, medications for inflammation',
        emergency_signs: ['severe eye pain', 'inability to swallow', 'severe joint pain']
      },
      {
        id: 'hemochromatosis_1',
        topic: 'Hemochromatosis',
        content: 'Hemochromatosis causes body to absorb too much iron. Can damage organs if untreated. Early detection and treatment prevent complications.',
        symptoms: ['joint pain', 'fatigue', 'abdominal pain', 'skin darkening', 'diabetes symptoms'],
        severity: 'chronic_condition',
        treatment: 'Regular blood removal, avoiding iron supplements, monitoring iron levels',
        emergency_signs: ['severe abdominal pain', 'irregular heartbeat', 'confusion']
      },
      {
        id: 'cluster_headache_1',
        topic: 'Cluster Headaches',
        content: 'Cluster headaches cause severe pain on one side of head. Occur in clusters or cycles. One of most painful types of headache.',
        symptoms: ['severe one-sided pain', 'eye tearing', 'nasal congestion', 'restlessness', 'eye redness'],
        severity: 'severe',
        treatment: 'Oxygen therapy, medications, preventive treatments',
        emergency_signs: ['worst headache ever', 'confusion', 'seizures']
      },
      {
        id: 'temporal_arteritis_1',
        topic: 'Temporal Arteritis',
        content: 'Temporal arteritis causes inflammation of temporal arteries. Can lead to vision loss if untreated. Requires immediate treatment to prevent complications.',
        symptoms: ['headache', 'scalp tenderness', 'jaw pain', 'vision problems', 'fever'],
        severity: 'severe',
        treatment: 'High-dose steroids, monitoring for complications',
        emergency_signs: ['sudden vision changes', 'double vision', 'severe headache']
      },
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

  /**
   * Get advice for specific medical condition
   * @function getConditionAdvice
   * @param {string} condition - Medical condition to find advice for
   * @returns {Object|null} Condition data if found, null otherwise
   * @description Searches knowledge base for specific condition and returns:
   * - Detailed condition description
   * - Common symptoms and severity
   * - Treatment recommendations
   * - Emergency warning signs
   */
  getConditionAdvice(condition) {
    // Search for condition in medical knowledge base
    const conditionData = this.getMedicalKnowledgeData().find(
      item => item.topic.toLowerCase().includes(condition.toLowerCase())
    );
    
    // Return condition data or null if not found
    return conditionData || null;
  }

  /**
   * Assess severity of reported symptoms
   * @function assessSymptomSeverity
   * @param {string} symptoms - Description of symptoms to assess
   * @returns {string} Severity level: 'EMERGENCY', 'URGENT', or 'ROUTINE'
   * @description Analyzes symptoms for severity using keyword matching:
   * - Checks for emergency conditions requiring immediate care
   * - Identifies urgent symptoms needing prompt attention
   * - Categorizes routine symptoms for regular care
   * - Uses predefined keyword lists for classification
   */
  assessSymptomSeverity(symptoms) {
    // Keywords indicating emergency conditions
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
      'severe bleeding', 'high fever', 'severe abdominal pain', 'stroke symptoms',
      'heart attack', 'severe allergic reaction', 'cannot breathe', 'choking'
    ];

    // Keywords indicating urgent conditions
    const urgentKeywords = [
      'persistent fever', 'severe pain', 'vomiting blood', 'severe dizziness',
      'vision problems', 'severe nausea', 'dehydration', 'confusion'
    ];

    // Convert symptoms to lowercase for case-insensitive matching
    const symptomText = symptoms.toLowerCase();
    
    // Check for emergency symptoms first
    if (emergencyKeywords.some(keyword => symptomText.includes(keyword))) {
      return 'EMERGENCY';  // Immediate medical attention needed
    } 
    // Then check for urgent symptoms
    else if (urgentKeywords.some(keyword => symptomText.includes(keyword))) {
      return 'URGENT';     // Prompt medical attention needed
    } 
    // Default to routine if no serious symptoms found
    else {
      return 'ROUTINE';    // Regular medical care appropriate
    }
  }
}

export default new RAGService();
