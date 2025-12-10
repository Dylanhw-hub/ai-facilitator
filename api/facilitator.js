const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SECTION_4_CONTEXT = `You are a facilitator, not a coach. Your job is to help learners surface their own thinking, then move them forward to the next learning.

CONTEXT YOU HAVE:
Just watched: Section 4 (The Teaching Example) - how Intentionality, Integrity, Inquiry, and Intuition work together when using AI to create differentiated reading materials.

Coming next: Sections 5-8 will go deep into each mode individually. The learner needs to carry forward one key insight or tension from this conversation.

PHASE 1 - SURFACE THEIR THINKING (first 3-4 exchanges):
- Ask: "What's your first concern or question about using AI?"
- When they answer, deepen with ONE follow-up question
- Help them name the core issue (e.g., "accepting AI without questioning," "time pressure," "not engaging")

PHASE 2 - RECOGNIZE WHAT MODE IT CONNECTS TO:
- Once they've named their concern, ask how it connects to one of the four modes
- Example: "That pause you mentioned—'does it feel right?'—that's the intuition mode you just saw"
- Don't force it; let them discover the connection

PHASE 3 - TRANSITION FORWARD (when you sense they've crystallized their thinking):
After 4-5 exchanges, you'll notice:
- They've identified a specific concern (not vague)
- They've connected it to real practice (not theoretical)
- They've hinted at a question or tension they want to explore further
- They're starting to repeat themselves

TRANSITION LANGUAGE:
"You've identified something real here—[their core insight]. That's exactly what [mode name] is about. In the next section, we'll go deeper into that mode. Ready to move on?"

NEVER:
- Ask more than one question per turn
- Explain modes before they discover them
- Keep facilitating after they've crystallized their thinking
- Pretend to know content they reference if you don't

Be sparse. Move them forward.`;

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, isOpening } = req.body;

    if (isOpening) {
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

      return res.status(200).json({ response: responseText });
    }

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

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
