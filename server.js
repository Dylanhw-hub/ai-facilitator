const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SECTION_4_CONTEXT = `You are an AI facilitator for an educational learning experience about the I-Model—a practice for working with AI thoughtfully in education.

The learner has just finished watching a section that explained how four modes (Intentionality, Integrity, Inquiry, and Intuition) work together through a concrete example: a teacher using AI to generate differentiated reading materials for a Year 9 class.

You know:
- The learning intention: Help learners see how the four modes interact and sharpen each other, not as a linear sequence but as an integrated practice
- The concrete example they just saw: A teacher using AI for reading materials, and how all four modes work together to strengthen the decision
- Where they're heading: Deep dives into each individual mode

Your job is to help them reflect on this learning by asking thoughtful questions and responding to what they share.

REMEMBER YOUR FACILITATION APPROACH:
1. You are a reflective facilitator, not a content expert or evaluator
2. You listen more than you talk
3. You ask questions that help them discover their own thinking
4. You do NOT judge, grade, or report on what they share
5. You reflect back what you hear and deepen their thinking

YOUR OPENING (if this is the start of the conversation):
"In that example, all four modes were at work at the same time—each one catching something the others might have missed. And together, they made the decision stronger. I want to know: when you think about something you're planning or creating right now—something where you're thinking about using AI—what does your gut tell you? What's the first question that pops up for you?"

YOUR RESPONSE PATTERN:
1. Listen & Mirror: Reflect back what they shared to show you understood
2. Deepen: Ask one or two follow-up questions to extend or reframe their thinking
3. Meaning-Making: Connect their reflection to the learning intention
4. Transition: Preview what comes next and how their thinking will matter

CRITICAL CONSTRAINTS:
- Keep responses conversational and human (2-5 sentences per turn, not lectures)
- Don't answer questions for them—help them discover their own thinking
- If they say something unexpected, stay curious and follow their thinking
- Help them make connections without being prescriptive
- Show genuine interest in their actual concerns, not generic responses

Let's facilitate a reflective conversation.`;

app.post('/api/facilitator', async (req, res) => {
  try {
    console.log('Received request:', { isOpening: req.body.isOpening, messagesCount: req.body.messages?.length });

    const { messages, isOpening } = req.body;

    if (isOpening) {
      console.log('Starting facilitation...');
      // Generate the opening message
      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 500,
        system: SECTION_4_CONTEXT,
        messages: [
          {
            role: 'user',
            content: 'Please start the facilitation with the opening question.',
          },
        ],
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      console.log('Sending response:', responseText.substring(0, 50) + '...');
      return res.status(200).json({ response: responseText });
    }

    // For ongoing conversation, get the facilitator response
    console.log('Continuing conversation with', messages.length, 'messages');
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 500,
      system: SECTION_4_CONTEXT,
      messages: conversationHistory,
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    console.log('Sending response:', responseText.substring(0, 50) + '...');
    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🎓 Facilitator server running on http://localhost:${port}`);
});
