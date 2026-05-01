const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Fix the model as requested
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Initialize Groq instances
const groqInstances = [];
if (process.env.GROQ_API_KEY1) groqInstances.push(new Groq({ apiKey: process.env.GROQ_API_KEY1 }));
if (process.env.GROQ_API_KEY2) groqInstances.push(new Groq({ apiKey: process.env.GROQ_API_KEY2 }));
if (process.env.GROQ_API_KEY3) groqInstances.push(new Groq({ apiKey: process.env.GROQ_API_KEY3 }));

if (groqInstances.length === 0 && process.env.GROQ_API_KEY) {
    groqInstances.push(new Groq({ apiKey: process.env.GROQ_API_KEY }));
}

let currentIndex = 0;

/**
 * Manually rotates the key for the next frontend request
 */
const rotateKey = () => {
    if (groqInstances.length > 0) {
        currentIndex = (currentIndex + 1) % groqInstances.length;
        console.log(`🔄 Rotated to Groq Key Instance: ${currentIndex + 1}/${groqInstances.length}`);
    }
};

/**
 * Gets the current Groq instance (without rotating)
 */
const getGroq = () => {
    if (groqInstances.length === 0) return null;
    return groqInstances[currentIndex];
};

const predictOutbreak = async (symptomReports, waterData) => {
    const groq = getGroq();
    if (!groq) return { error: 'Groq API key not configured' };

    const prompt = `
    Analyze health and environmental data from a rural community in India.
    Predict water-borne disease outbreak risk.
    
    HEALTH REPORTS: ${JSON.stringify(symptomReports)}
    WATER QUALITY DATA: ${JSON.stringify(waterData)}
    
    Return ONLY a JSON object:
    {
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "probableDisease": "string",
      "confidenceScore": 0-100,
      "recommendations": ["string"],
      "reasoning": "string"
    }
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: DEFAULT_MODEL,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error(`Groq API Error:`, error.message);
        return { error: 'Failed to predict outbreak' };
    }
};

const predictWaterQuality = async (waterSourceData) => {
    const groq = getGroq();
    if (!groq) return { error: 'Groq API key not configured' };

    const prompt = `
    Analyze water quality parameters for a rural Indian water source:
    ${JSON.stringify(waterSourceData)}
    
    Based on WHO/IS 10500 standards, return ONLY a JSON object:
    {
      "contaminationLevel": "SAFE|MODERATE|CONTAMINATED|HIGHLY_CONTAMINATED",
      "probableDisease": "string",
      "precautions": ["string"],
      "solutions": ["string"],
      "reasoning": "string (A single paragraph string)"
    }
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a water quality expert. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ],
            model: DEFAULT_MODEL,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error(`Groq API Error:`, error.message);
        return {
            error: 'Failed to predict water quality',
            contaminationLevel: "ERROR",
            probableDisease: "Service Unavailable",
            precautions: ["Check internet connection", "Try again later"],
            solutions: ["Contact technical support"],
            reasoning: `AI service error: ${error.message}`
        };
    }
};

module.exports = { rotateKey, predictOutbreak, predictWaterQuality };
