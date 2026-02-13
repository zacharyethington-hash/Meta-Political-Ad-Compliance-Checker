const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'dist')));

// --- Claude API call ---
async function callClaude(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 529 || response.status === 503) {
      if (attempt < maxRetries) {
        console.log('Claude overloaded, retrying in ' + (attempt + 1) * 2 + 's...');
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }
      throw new Error('OVERLOADED');
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Claude API error');
    }

    const data = await response.json();
    return { data, provider: 'claude' };
  }
  throw new Error('OVERLOADED');
}

// --- OpenAI fallback ---
async function callOpenAI(body) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Cannot fall back.');

  // Convert from Claude format to OpenAI format
  const messages = [];

  // System prompt
  if (body.system) {
    messages.push({ role: 'system', content: body.system });
  }

  // User messages - convert Claude's content blocks to OpenAI format
  for (const msg of body.messages) {
    if (typeof msg.content === 'string') {
      messages.push({ role: msg.role, content: msg.content });
    } else if (Array.isArray(msg.content)) {
      const parts = [];
      for (const block of msg.content) {
        if (block.type === 'text') {
          parts.push({ type: 'text', text: block.text });
        } else if (block.type === 'image') {
          parts.push({
            type: 'image_url',
            image_url: {
              url: 'data:' + block.source.media_type + ';base64,' + block.source.data,
            },
          });
        }
      }
      messages.push({ role: msg.role, content: parts });
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: body.max_tokens || 4096,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();

  // Convert OpenAI response back to Claude format so the frontend works unchanged
  return {
    data: {
      content: [{ type: 'text', text: data.choices[0].message.content }],
    },
    provider: 'openai',
  };
}

// --- Main endpoint ---
app.post('/api/analyze', async (req, res) => {
  try {
    // Try Claude first
    const result = await callClaude(req.body);
    console.log('Response from: ' + result.provider);
    res.json(result.data);
  } catch (err) {
    if (err.message === 'OVERLOADED') {
      console.log('Claude overloaded after retries. Falling back to OpenAI...');
      try {
        const result = await callOpenAI(req.body);
        console.log('Response from: ' + result.provider + ' (fallback)');
        res.json(result.data);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr.message);
        res.status(500).json({
          error: { message: 'Both Claude and OpenAI failed. ' + fallbackErr.message },
        });
      }
    } else {
      console.error('API error:', err.message);
      res.status(500).json({ error: { message: err.message } });
    }
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});

