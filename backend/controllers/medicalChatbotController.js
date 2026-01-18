const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MedicalAccount, MedicalRecord, MedicalBill, MedicalFile } = require('../models');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with AI about medical records
exports.chatWithAI = async (req, res) => {
  try {
    const medicalAccountId = req.user.id;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Fetch patient's medical data for context
    const medicalAccount = await MedicalAccount.findByPk(medicalAccountId);
    
    if (!medicalAccount) {
      return res.status(404).json({
        success: false,
        message: 'Medical account not found'
      });
    }

    // Get medical records
    const records = await MedicalRecord.findAll({
      where: { medical_account_id: medicalAccountId },
      limit: 10,
      order: [['record_date', 'DESC']]
    });

    // Get recent bills
    const bills = await MedicalBill.findAll({
      where: { medical_account_id: medicalAccountId },
      limit: 5,
      order: [['bill_date', 'DESC']]
    });

    // Build context from patient data
    const patientContext = `
Patient Medical Profile:
- Allergies: ${medicalAccount.allergies || 'None reported'}
- Chronic Conditions: ${medicalAccount.chronic_conditions || 'None reported'}
- Current Medications: ${medicalAccount.current_medications || 'None reported'}
- Blood Group: ${medicalAccount.blood_group || 'Not specified'}

Recent Medical Records (${records.length} records):
${records.map(r => `- ${r.record_date}: ${r.title} - ${r.description}`).join('\n')}

Recent Bills (${bills.length} bills):
${bills.map(b => `- ${b.bill_date}: ${b.description} - Amount: ₹${b.amount}`).join('\n')}
    `.trim();

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create prompt with context
    const prompt = `You are a helpful medical assistant AI. You have access to the patient's medical records and history.

${patientContext}

Patient's Question: ${message}

Please provide a helpful, accurate, and empathetic response based on the patient's medical history. If the question requires professional medical advice, remind the patient to consult with their doctor. Keep the response concise and easy to understand.`;

    // Generate AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your question. Please try again.'
    });
  }
};
