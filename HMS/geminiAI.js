// geminiAI.js - Google Gemini AI Integration for Health Management System

const { GoogleGenerativeAI } = require('@google/generative-ai');
const natural = require('natural');

class GeminiAI {
  constructor(apiKey) {
    // Enhanced API key handling with multiple sources
    this.apiKey = apiKey ||
                  process.env.GEMINI_API_KEY ||
                  process.env.GOOGLE_AI_API_KEY ||
                  process.env.GOOGLE_AI_STUDIO_API_KEY ||
                  'AIzaSyDummyKeyForTesting'; // Fallback for development

    this.genAI = null;
    this.model = null;
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;

    // Always attempt initialization, even with dummy key for development
    this.initializeGemini();
  }

  initializeGemini() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      });
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  }

  // Analyze symptoms and provide AI-powered insights
  async analyzeSymptoms(symptoms, patientData = {}) {
    if (!this.model) {
      return { error: 'Gemini AI not initialized' };
    }

    try {
      const symptomText = symptoms.map(s =>
        `${s.name} (severity: ${s.severity}/10, system: ${s.system})`
      ).join(', ');

      const patientContext = patientData.age ? `Patient age: ${patientData.age}, gender: ${patientData.gender || 'unknown'}` : '';

      const prompt = `
        As a medical AI assistant, analyze the following symptoms and provide insights:

        Symptoms: ${symptomText}
        ${patientContext}

        Please provide:
        1. Possible conditions that could cause these symptoms (list 3-5 most likely)
        2. Urgency level (low, medium, high, emergency)
        3. Recommended next steps for the patient
        4. When to seek immediate medical attention

        Format your response as JSON with keys: possibleConditions, urgencyLevel, recommendations, seekAttention
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const analysis = JSON.parse(text);
        return {
          success: true,
          analysis: analysis,
          rawResponse: text
        };
      } catch (parseError) {
        // If JSON parsing fails, return structured text response
        return {
          success: true,
          analysis: {
            possibleConditions: this.extractConditions(text),
            urgencyLevel: this.extractUrgency(text),
            recommendations: this.extractRecommendations(text),
            seekAttention: this.extractSeekAttention(text)
          },
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Error analyzing symptoms with Gemini:', error);
      return { error: 'Failed to analyze symptoms' };
    }
  }

  // Generate personalized health recommendations
  async generateHealthRecommendations(patientData, vitals = [], medications = []) {
    if (!this.model) {
      return { error: 'Gemini AI not initialized' };
    }

    try {
      const vitalsText = vitals.slice(-5).map(v =>
        `${v.type}: ${v.value} ${v.unit} (${new Date(v.timestamp).toLocaleDateString()})`
      ).join(', ');

      const medicationsText = medications.map(m =>
        `${m.name} ${m.dose} - ${m.schedule}`
      ).join(', ');

      const prompt = `
        As a medical AI assistant, provide personalized health recommendations based on:

        Patient Profile:
        - Age: ${patientData.age || 'unknown'}
        - Gender: ${patientData.gender || 'unknown'}
        - Chronic conditions: ${patientData.chronicConditions || 'none reported'}
        - Current medications: ${medicationsText || 'none'}

        Recent Vitals: ${vitalsText || 'no recent vitals'}

        Please provide:
        1. Lifestyle recommendations
        2. Medication adherence tips
        3. Preventive care suggestions
        4. Warning signs to watch for

        Format as JSON with keys: lifestyle, medicationTips, preventiveCare, warningSigns
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const recommendations = JSON.parse(text);
        return {
          success: true,
          recommendations: recommendations,
          rawResponse: text
        };
      } catch (parseError) {
        return {
          success: true,
          recommendations: {
            lifestyle: this.extractLifestyle(text),
            medicationTips: this.extractMedicationTips(text),
            preventiveCare: this.extractPreventiveCare(text),
            warningSigns: this.extractWarningSigns(text)
          },
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Error generating health recommendations:', error);
      return { error: 'Failed to generate recommendations' };
    }
  }

  // Analyze health trends and predict risks
  async analyzeHealthTrends(vitals = [], symptoms = [], admissions = []) {
    if (!this.model) {
      return { error: 'Gemini AI not initialized' };
    }

    try {
      const vitalsSummary = this.summarizeVitals(vitals);
      const symptomsSummary = this.summarizeSymptoms(symptoms);
      const admissionSummary = admissions.map(a =>
        `${a.diagnosis} (${new Date(a.admissionDate).toLocaleDateString()})`
      ).join(', ');

      const prompt = `
        Analyze health trends and predict risks based on:

        Vital Signs Trends: ${vitalsSummary}
        Symptom Patterns: ${symptomsSummary}
        Admission History: ${admissionSummary || 'none'}

        Provide:
        1. Overall health trend assessment
        2. Risk level (low, medium, high)
        3. Potential health concerns
        4. Recommended monitoring or interventions

        Format as JSON with keys: trendAssessment, riskLevel, concerns, recommendations
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text);
        return {
          success: true,
          analysis: analysis,
          rawResponse: text
        };
      } catch (parseError) {
        return {
          success: true,
          analysis: {
            trendAssessment: this.extractTrendAssessment(text),
            riskLevel: this.extractRiskLevel(text),
            concerns: this.extractConcerns(text),
            recommendations: this.extractHealthRecommendations(text)
          },
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Error analyzing health trends:', error);
      return { error: 'Failed to analyze health trends' };
    }
  }

  // Process natural language voice commands
  async processVoiceCommand(command, context = {}) {
    if (!this.model) {
      return { error: 'Gemini AI not initialized' };
    }

    try {
      const prompt = `
        Process this voice command for a health management system: "${command}"

        Context: ${JSON.stringify(context)}

        Determine:
        1. Intent category (navigation, data_entry, inquiry, emergency, general)
        2. Specific action to take
        3. Required parameters
        4. Confidence level (0-1)
        5. Response message

        Format as JSON with keys: intent, action, parameters, confidence, response
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const nlpResult = JSON.parse(text);
        return {
          success: true,
          nlp: nlpResult,
          rawResponse: text
        };
      } catch (parseError) {
        return {
          success: true,
          nlp: {
            intent: this.classifyIntent(command),
            action: this.extractAction(command),
            parameters: this.extractParameters(command),
            confidence: 0.8,
            response: 'Command processed'
          },
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      return { error: 'Failed to process voice command' };
    }
  }

  // Generate treatment recommendations
  async generateTreatmentRecommendations(condition, patientData = {}) {
    if (!this.model) {
      return { error: 'Gemini AI not initialized' };
    }

    try {
      const prompt = `
        Provide treatment recommendations for: ${condition}

        Patient context:
        - Age: ${patientData.age || 'unknown'}
        - Gender: ${patientData.gender || 'unknown'}
        - Allergies: ${patientData.allergies || 'none reported'}
        - Current medications: ${patientData.currentMedications || 'none'}

        Provide:
        1. General treatment approaches
        2. Medication options (if applicable)
        3. Lifestyle modifications
        4. When to see a doctor
        5. Home remedies (if safe)

        Format as JSON with keys: treatments, medications, lifestyle, whenToSeeDoctor, homeRemedies
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const recommendations = JSON.parse(text);
        return {
          success: true,
          recommendations: recommendations,
          rawResponse: text
        };
      } catch (parseError) {
        return {
          success: true,
          recommendations: {
            treatments: this.extractTreatments(text),
            medications: this.extractMedications(text),
            lifestyle: this.extractLifestyle(text),
            whenToSeeDoctor: this.extractWhenToSeeDoctor(text),
            homeRemedies: this.extractHomeRemedies(text)
          },
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Error generating treatment recommendations:', error);
      return { error: 'Failed to generate treatment recommendations' };
    }
  }

  // Helper methods for parsing AI responses
  extractConditions(text) {
    const lines = text.split('\n');
    return lines.filter(line => line.includes('condition') || line.includes('possible') || /^\d+\./.test(line)).slice(0, 5);
  }

  extractUrgency(text) {
    const lower = text.toLowerCase();
    if (lower.includes('emergency') || lower.includes('critical')) return 'emergency';
    if (lower.includes('high') || lower.includes('urgent')) return 'high';
    if (lower.includes('medium') || lower.includes('moderate')) return 'medium';
    return 'low';
  }

  extractRecommendations(text) {
    return text.split('\n').filter(line => line.includes('recommend') || line.includes('should') || line.includes('consider'));
  }

  extractSeekAttention(text) {
    return text.split('\n').filter(line => line.includes('seek') || line.includes('see doctor') || line.includes('medical attention'));
  }

  extractLifestyle(text) {
    return text.split('\n').filter(line => line.includes('lifestyle') || line.includes('exercise') || line.includes('diet') || line.includes('sleep'));
  }

  extractMedicationTips(text) {
    return text.split('\n').filter(line => line.includes('medication') || line.includes('take') || line.includes('dosage'));
  }

  extractPreventiveCare(text) {
    return text.split('\n').filter(line => line.includes('preventive') || line.includes('screening') || line.includes('check-up'));
  }

  extractWarningSigns(text) {
    return text.split('\n').filter(line => line.includes('warning') || line.includes('watch for') || line.includes('signs'));
  }

  extractTrendAssessment(text) {
    return text.split('\n').find(line => line.includes('trend') || line.includes('assessment')) || 'Stable health trend';
  }

  extractRiskLevel(text) {
    const lower = text.toLowerCase();
    if (lower.includes('high risk') || lower.includes('high-risk')) return 'high';
    if (lower.includes('medium risk') || lower.includes('moderate')) return 'medium';
    return 'low';
  }

  extractConcerns(text) {
    return text.split('\n').filter(line => line.includes('concern') || line.includes('issue') || line.includes('problem'));
  }

  extractHealthRecommendations(text) {
    return text.split('\n').filter(line => line.includes('recommend') || line.includes('suggest') || line.includes('monitor'));
  }

  extractTreatments(text) {
    return text.split('\n').filter(line => line.includes('treatment') || line.includes('therapy') || line.includes('approach'));
  }

  extractMedications(text) {
    return text.split('\n').filter(line => line.includes('medication') || line.includes('drug') || line.includes('prescribe'));
  }

  extractWhenToSeeDoctor(text) {
    return text.split('\n').filter(line => line.includes('see doctor') || line.includes('consult') || line.includes('when to'));
  }

  extractHomeRemedies(text) {
    return text.split('\n').filter(line => line.includes('home') || line.includes('remedy') || line.includes('natural'));
  }

  classifyIntent(command) {
    const lower = command.toLowerCase();
    if (lower.includes('go to') || lower.includes('open') || lower.includes('show')) return 'navigation';
    if (lower.includes('add') || lower.includes('record') || lower.includes('log')) return 'data_entry';
    if (lower.includes('what') || lower.includes('how') || lower.includes('tell me')) return 'inquiry';
    if (lower.includes('emergency') || lower.includes('help') || lower.includes('urgent')) return 'emergency';
    return 'general';
  }

  extractAction(command) {
    const lower = command.toLowerCase();
    if (lower.includes('dashboard')) return 'load_dashboard';
    if (lower.includes('vitals') || lower.includes('vital')) return 'load_vitals';
    if (lower.includes('symptoms') || lower.includes('symptom')) return 'load_symptoms';
    if (lower.includes('medications') || lower.includes('meds')) return 'load_medications';
    if (lower.includes('appointments') || lower.includes('appointment')) return 'load_appointments';
    return 'unknown';
  }

  extractParameters(command) {
    // Simple parameter extraction - could be enhanced with NLP
    return {};
  }

  summarizeVitals(vitals) {
    if (vitals.length === 0) return 'No vitals recorded';

    const types = {};
    vitals.forEach(v => {
      if (!types[v.type]) types[v.type] = [];
      types[v.type].push(parseFloat(v.value));
    });

    return Object.entries(types).map(([type, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const trend = values.length > 1 ? (values[values.length - 1] > values[0] ? 'increasing' : 'decreasing') : 'stable';
      return `${type}: avg ${avg.toFixed(1)}, trend: ${trend}`;
    }).join('; ');
  }

  summarizeSymptoms(symptoms) {
    if (symptoms.length === 0) return 'No symptoms recorded';

    const symptomCounts = {};
    symptoms.forEach(s => {
      symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
    });

    return Object.entries(symptomCounts).map(([name, count]) =>
      `${name}: ${count} occurrences`
    ).join('; ');
  }
}

module.exports = GeminiAI;
