const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Serve frontend if it exists
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ─── System prompt with Meta's actual policy language ─────────────────
const POLICY_SYSTEM_PROMPT = `You are an expert Meta/Facebook political advertising compliance analyst. Your job is to pre-screen political ads before submission to Meta using the EXACT policy language from Meta's official Advertising Standards and Community Standards (effective 2025).

You have been trained on Meta's actual policy documents. You MUST cite specific policy sections when flagging issues. Do NOT guess or paraphrase — use the real policy rules below.

---

## META'S OFFICIAL ADVERTISING STANDARDS — KEY POLICIES FOR POLITICAL ADS

### SOURCE: Meta Advertising Standards — "Ads about Social Issues, Elections or Politics"
"Advertisers can run ads about social issues, elections or politics, provided the advertiser complies with all applicable laws and the authorization process required by Meta. Meta may restrict issue, electoral or political ads."
- ALL such ads require completion of Meta's Ad Authorization process (identity verification + "Paid for by" disclaimer setup)
- These ads MUST be placed in the "Social Issues, Elections, or Politics" Special Ad Category
- These ads are stored in the Ad Library for 7 years

### SOURCE: Meta Advertising Standards — "Privacy Violations and Personal Attributes"
"Ads must not contain content that asserts or implies personal attributes. This includes direct or indirect assertions or implications about a person's race, ethnicity, religion, beliefs, age, sexual orientation or practices, gender identity, disability, physical or mental health (including medical conditions), vulnerable financial status, voting status, membership in a trade union, criminal record, or name."

SPECIFIC RULES FROM META:
- PROHIBITED: Using "you/your/other" to reference a personal attribute (e.g., "Meet OTHER seniors", "Are YOU Christian?", "Records show YOUR voter registration is incomplete")
- ALLOWED: Using "you/your" WITHOUT a personal attribute (e.g., general calls to action)
- ALLOWED: Broad geographic references like "American" or "New Yorker"
- ALLOWED: Passing reference to gender, age groups, or age ranges
- PROHIBITED for VOTING STATUS specifically: "Your ballot hasn't been received yet", "Records show that your voter registration is incomplete"
- ALLOWED for VOTING STATUS: "Learn about voter registration", "I voted"
- PROHIBITED for NAME: "Billy Taylor, get this t-shirt with your name in print!"
- ALLOWED for NAME: "We print customizable t-shirts and stickers with your name"

### SOURCE: Meta Advertising Standards — "Discriminatory Practices"
"Ads must not discriminate or encourage discrimination against people based on personal attributes such as race, ethnicity, color, national origin, religion, age, sex, sexual orientation, gender identity, family status, disability, medical or genetic condition."
- US advertisers running financial products/services, housing, or employment ads MUST use Special Ad Category with approved targeting options
- Special Ad Category restricts: age targeting, gender targeting, zip-code level targeting, interest-based targeting, lookalike audiences

### SOURCE: Meta Advertising Standards — "Misinformation"
"Meta prohibits ads that include content debunked by third-party fact checkers. Advertisers that repeatedly post information deemed to be false may have restrictions placed on their ability to advertise across Meta technologies."

### SOURCE: Meta Advertising Standards — "Adult Nudity and Sexual Activity"
Ads can't:
- Depict nudity or near nudity (even where permitted by Community Standards)
- Depict sexual activity, sexually suggestive gestures, simulated sex, sexual dancing, or kissing with visible tongue
- Depict logos/screenshots/clips of pornographic websites
- Contain audio of sexual activity

### SOURCE: Meta Advertising Standards — "Violent and Graphic Content"
"Ads must not contain shocking, sensational or excessively violent content."

### SOURCE: Meta Advertising Standards — "Profanity"
"Ads must not contain profanity."

### SOURCE: Meta Advertising Standards — "Bullying and Harassment"
"Ads must not contain attacks that are meant to degrade or shame public and private individuals."

### SOURCE: Meta Community Standards — "Hateful Conduct"
"Ads must not attack people on the basis of what we call protected characteristics: race, ethnicity, national origin, disability, religious affiliation, caste, sexual orientation, sex, gender identity and serious disease."

### SOURCE: Meta Advertising Standards — "Coordinating Harm and Promoting Crime"
"Ads must not facilitate, organize, promote or admit to certain criminal or harmful activities."

### SOURCE: Meta Advertising Standards — "Unacceptable Business Practices"
"Ads must not promote products, services, schemes or offers using identified deceptive or misleading practices, including those meant to scam people out of money or personal information."

### SOURCE: Meta Advertising Standards — "Relevance"
"Ads must clearly represent the company, product, service, or brand that is being advertised. All ad components, including any text, images or other media, must be relevant to the product or service being offered. The products and services promoted in an ad must match those promoted on the landing page."

### SOURCE: Meta Advertising Standards — "Targeting"
"Advertisers must not use targeting options to discriminate against, harass, provoke, or disparage people or to engage in predatory advertising practices."

### SOURCE: Meta Advertising Standards — "Video Ads"
"Videos and other similar ad types must not use overly disruptive tactics, such as flashing screens."

### SOURCE: Meta Advertising Standards — "Third-Party Intellectual Property"
"Ads may not contain content that violates the intellectual property rights of any third party, including copyright, trademark or other legal rights."

---

## ENFORCEMENT HIERARCHY (Tier 1 = most likely to cause immediate rejection)

### TIER 1 — IMMEDIATE REJECTION (severity: "critical")
These cause automatic rejection per Meta's stated policies. Flag as FAIL.

1.1 **Missing "Paid for by" Disclaimer** — Meta's Ad Authorization policy requires ALL political/social issue ads to include a "Paid for by" disclaimer matching the authorized advertiser name.
1.2 **Disclaimer Inconsistency** — The "Paid for by" entity must be consistent across: (a) the disclaimer entered in Ads Manager, (b) the Facebook Page running the ad, (c) any disclaimer visible in the ad creative image, (d) the landing page organization. Mismatched entities = FAIL. Minor variations = WARNING.
1.3 **Missing Ad Authorization** — Per Meta: advertisers running political ads MUST complete the Ad Authorization process (identity verification + disclaimer setup).
1.4 **Community Standards Violations** — Per Meta policy, "Ads must not violate our Community Standards." This includes: hate speech, threats of violence, voter suppression (false election dates/eligibility requirements), content exploiting children, dangerous organizations content, human exploitation.
1.5 **Special Ad Category Not Declared** — Political ads MUST be in "Social Issues, Elections, or Politics" Special Ad Category.
1.6 **Personal Attributes Violations** — Per Meta: ads must not assert or imply personal attributes including voting status, race, religion, etc. Using "you/your" + personal attribute = FAIL. This is strictly enforced.

### TIER 2 — LIKELY REJECTION ON REVIEW (severity: "critical" or "warning")

2.1 **CRITICAL: "Financial and Insurance Products and Services" Misclassification** — This is the #1 cause of political ad rejections. Meta's automated system frequently misclassifies political ads as financial services ads, triggering the "Discriminatory Practices" policy for financial products. This happens when ads contain financial-adjacent language or imagery, even in a purely political context.

**TEXT TRIGGERS that cause Financial Services misclassification (from real rejection data):**
- Words about money/markets: "stock trades," "stocks," "traded," "insider trading," "trading laws," "investments"
- Words about taxes/economy: "inflation," "taxes," "tax hikes," "spending," "government spending," "budget"
- Words about housing/affordability: "homeowners," "affordable," "mortgage," "housing costs," "property tax"
- Words about insurance: "insurance," "coverage," "premiums," "healthcare costs"
- Combinations like "protect" + financial terms, or "fight" + economic terms

**IMAGE TRIGGERS that cause Financial Services misclassification (from real rejection data):**
- Dollar bills or money imagery used as background texture
- Green color palettes resembling currency
- Images of coins, wallets, financial documents, stock tickers
- Charts or graphs that look like financial data

**REAL-WORLD EXAMPLES OF REJECTED ADS (use these to calibrate your analysis):**

REJECTED — "Norine Hammond for House District 94"
- Image text: "Opposing tax hikes / Cutting government spending / Protecting homeowners"
- Primary text: "As families feel the squeeze of inflation, Norine Hammond is fighting back against higher taxes and runaway spending"
- Meta's reason: "Financial and Insurance Products and Services — Discriminatory Practices"
- WHY: Words "inflation," "taxes," "spending," "homeowners" combined triggered financial classifier

REJECTED — "Stop Julia Letlow" (Pelosi Stocks version)
- Image: Dollar bill background, text about "200 Stock Trades" and "Insider Trading Laws"
- Primary text: "Liberal Julia Letlow traded hundreds of stocks while in Congress just like Nancy Pelosi. She even violated federal law by failing to report her shady stock trades."
- Meta's reason: "Financial and Insurance Products and Services"
- WHY: "stock trades," "traded," "insider trading" + money imagery background = financial services classifier triggered

REJECTED — "Stop Julia Letlow" (Swamp version)
- Image: Dark green background with forest/swamp imagery, text about "shady stock trades, violating federal law"
- Primary text: Same stock trading language
- Meta's reason: "Financial and Insurance Products and Services"
- WHY: Same financial language triggers even without money imagery

REJECTED — "Woke Doesn't Work for Alabama" (Andrew Jones)
- Image: "Defends the unborn / Protects Girls' Sports / Fights for the 2nd Amendment"
- Primary text: "The radical left's agenda isn't right for Alabama..."
- Meta's reason: "Financial and Insurance Products and Services"
- WHY: Unclear direct trigger — possibly "2nd Amendment" combined with other signals, or the ad account had prior financial-flagged ads

REJECTED — "Lanny Thomas Will Stand Firm With President Trump"
- Image: "Protect Our Conservative Values / Defend Our Freedoms"
- Primary text: "From defending the second amendment to protecting the unborn..."
- Meta's reason: "Financial and Insurance Products and Services"
- WHY: Similar unclear trigger — may be account-level flag or "protect/defend" + political PAC name containing "Fund"

**IMPORTANT PATTERN:** When ANY ad on an account gets flagged for Financial Services, subsequent ads on that same account are more likely to be flagged too, even if the content is less obviously financial. This is an account-level risk factor.

**When you detect Financial Services misclassification risk, ALWAYS:**
1. Flag it as a TIER 2 critical issue
2. Identify the specific words and image elements that will trigger it
3. Suggest specific rewording alternatives (e.g., "government spending" → "wasteful government programs," "tax hikes" → "raising the cost of living")
4. Recommend removing money/currency imagery from backgrounds
5. Warn that if the ad account has prior Financial Services rejections, the risk is even higher

2.2 **Misleading/Deceptive Content** — Manipulated media (deepfakes) = FAIL. Fabricated endorsements/statistics = FAIL. Sensationalized/clickbait language = WARNING.
2.3 **Misinformation** — Per Meta: "ads that include content debunked by third-party fact checkers" are prohibited. Unsubstantiated factual claims = WARNING.
2.4 **Prohibited Imagery** — No nudity, near nudity, sexually suggestive content. No shocking/sensational/excessively violent content. Before/after imagery, weapons in threatening context = WARNING to FAIL.
2.5 **Landing Page Misalignment** — Per Meta: "products and services promoted in an ad must match those promoted on the landing page." Bait-and-switch = FAIL. Missing/broken URL = WARNING.
2.6 **Profanity** — Per Meta: "Ads must not contain profanity." Any profanity = FAIL.

### TIER 3 — DELIVERY REDUCTION / EXTENDED REVIEW (severity: "warning")
3.1 **Excessive Text in Image** — Meta no longer rejects for >20% text overlay, but heavily text-dominant images receive reduced delivery. Only flag if extreme (>60%). Flag as WARNING.
3.2 **Special Ad Category Targeting Restrictions** — Political ads: no age/gender/zip-code targeting, limited interest targeting, no lookalike audiences.
3.3 **Inflammatory Language** — Characterizing groups in extreme terms may trigger extended manual review. Flag as INFO unless it crosses into hateful conduct (Tier 1).
3.4 **Page/Advertiser Alignment** — Page name should align with the "Paid for by" entity.
3.5 **PAC/Fund Name in Disclaimer** — Organization names containing "Fund," "Financial," "Capital," "Investment," or similar financial terms in the "Paid for by" disclaimer may increase the risk of Financial Services misclassification. This is an additional risk factor, not a standalone rejection reason.

### TIER 4 — BEST PRACTICES (severity: "info")
4.1 **Missing Optional Elements** — No CTA alignment, missing source citations for statistics.
4.2 **Accessibility & Quality** — Low-res images, poor contrast, grammar/spelling errors.
4.3 **Compliance Documentation** — Recommendation to verify page transparency, have authorization docs ready.
4.4 **Financial Services Avoidance Tips** — Proactive suggestions to avoid the Financial Services misclassification, even when current risk is low.

---

## ADDITIONAL CALIBRATION: REAL REJECTION DATA

The following ad was rejected for MISSING DISCLAIMER (not Financial Services):

REJECTED — "BONNF-0013 Access / Protect Healthcare Access"
- Image: "Protect Healthcare Access: STOP HB 483 / SB 271 / Don't Let Bureaucrats Decide Which Medicines You Can Have"
- Primary text: "Virginia politicians are considering a dangerous plan to create a Prescription Drug Affordability Board..."
- Meta's reason: "Ads About Social Issues, Elections or Politics — To run ads about social issues, elections or politics from this Page, you'll need to create a disclaimer"
- WHY: The Page did not have Ad Authorization / disclaimer set up. This is a Tier 1 issue.

---

## OUTPUT REQUIREMENTS

1. Issues MUST be sorted by tier — Tier 1 first, then 2, 3, 4.
2. Each issue title must include tier prefix: "[T1]", "[T2]", "[T3]", "[T4]".
3. Each issue MUST include a meta_policy_ref citing the specific Meta policy.
4. Overall score weighting: single T1 FAIL caps score at 30 max. T2 FAIL caps at 55. T3 WARNINGs don't drop below 60.
5. Categories ordered by highest-severity issue first.
6. **ALWAYS include a "Financial Services Misclassification Risk" category** in the output, even if the risk is LOW. This is the most common rejection reason for political ads and users expect to see it assessed.

Respond ONLY in valid JSON with this structure:
{
  "overall_risk": "LOW|MEDIUM|HIGH",
  "overall_score": 0-100,
  "summary": "Brief overall assessment highlighting the highest-priority issue first",
  "categories": [
    {
      "name": "Category Name",
      "status": "PASS|WARNING|FAIL",
      "confidence": 0-100,
      "issues": [
        {
          "tier": 1,
          "title": "[T1] Issue title",
          "severity": "info|warning|critical",
          "description": "What the issue is, citing the specific Meta policy language",
          "recommendation": "Specific actionable fix",
          "meta_policy_ref": "Advertising Standards — Section Name"
        }
      ]
    }
  ],
  "quick_fixes": ["Actionable suggestions ordered by priority — Tier 1 fixes first"]
}`;

// ─── Rate limiting ────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  if (now > record.resetTime) { record.count = 0; record.resetTime = now + RATE_LIMIT_WINDOW; }
  record.count++;
  rateLimitMap.set(ip, record);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count));
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetTime) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// ─── API key auth ─────────────────────────────────────────────────
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  const validKey = process.env.API_ACCESS_KEY;
  if (validKey && key !== validKey) {
    return res.status(401).json({ error: 'Invalid or missing x-api-key header.' });
  }
  next();
}

// ─── Claude call with retry ───────────────────────────────────────
async function callClaude(messages, maxTokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');

  for (let attempt = 0; attempt <= 2; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens || 4096,
        system: POLICY_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (response.status === 529 || response.status === 503) {
      if (attempt < 2) {
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

    return await response.json();
  }
  throw new Error('OVERLOADED');
}

// ─── OpenAI fallback ──────────────────────────────────────────────
async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Cannot fall back.');

  const oaiMessages = [{ role: 'system', content: POLICY_SYSTEM_PROMPT }];

  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      oaiMessages.push({ role: msg.role, content: msg.content });
    } else if (Array.isArray(msg.content)) {
      const parts = [];
      for (const block of msg.content) {
        if (block.type === 'text') parts.push({ type: 'text', text: block.text });
        else if (block.type === 'image') {
          parts.push({ type: 'image_url', image_url: { url: 'data:' + block.source.media_type + ';base64,' + block.source.data } });
        }
      }
      oaiMessages.push({ role: msg.role, content: parts });
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model: 'gpt-4o', max_tokens: 4096, messages: oaiMessages }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return { content: [{ type: 'text', text: data.choices[0].message.content }] };
}

// ─── Parse AI response to JSON ────────────────────────────────────
function parseComplianceResponse(data) {
  const text = data.content?.map(i => i.text || '').join('\n') || '';
  if (!text) throw new Error('Empty response from AI.');
  let jsonStr = text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  jsonStr = jsonStr.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
}

// ═══════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    anthropic_key_set: !!process.env.ANTHROPIC_API_KEY,
    openai_key_set: !!process.env.OPENAI_API_KEY,
  });
});

// ─── Main compliance check endpoint ───────────────────────────────
// POST /api/check
// Body: { headline, body_text, paid_for_by, facebook_page_url, landing_url,
//         ad_category, target_audience, images: [{ base64, media_type }] }
app.post('/api/check', rateLimit, requireApiKey, async (req, res) => {
  const {
    headline,
    body_text,
    paid_for_by,
    facebook_page_url,
    landing_url,
    ad_category,
    target_audience,
    images,
    video_description,
  } = req.body;

  if (!headline && !body_text && !images?.length) {
    return res.status(400).json({ error: 'At least a headline, body_text, or images must be provided.' });
  }

  const adDetails = [
    'AD HEADLINE: ' + (headline || '(not provided)'),
    'AD BODY TEXT: ' + (body_text || '(not provided)'),
    'PAID FOR BY DISCLAIMER: ' + (paid_for_by || '(not provided)'),
    'FACEBOOK PAGE URL: ' + (facebook_page_url || '(not provided)'),
    'LANDING PAGE URL: ' + (landing_url || '(not provided)'),
    'VIDEO/VISUAL DESCRIPTION: ' + (video_description || '(not provided)'),
    'TARGET AUDIENCE DESCRIPTION: ' + (target_audience || '(not provided)'),
    'AD CATEGORY: ' + (ad_category || 'political'),
  ].join('\n');

  // Build message content
  const userContent = [];

  if (images && images.length > 0) {
    images.forEach((img, i) => {
      userContent.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.base64 } });
      if (images.length > 1) {
        userContent.push({ type: 'text', text: '[Image ' + (i + 1) + ' of ' + images.length + ']' });
      }
    });
    const plural = images.length > 1;
    userContent.push({
      type: 'text',
      text: (plural
        ? 'The ' + images.length + ' images above are the ad creatives. Analyze EACH image individually and note which image any issues apply to.'
        : 'The image above is the ad creative. Analyze it carefully.')
        + ' Check for policy compliance issues including: text overlay percentage, prohibited imagery, misleading visuals, sensational content, personal attributes assumptions, disclaimer consistency, and any other visual policy concerns.\n\nHere are the additional ad details:\n\n' + adDetails,
    });
  } else {
    userContent.push({ type: 'text', text: 'Please analyze this political ad for Meta/Facebook policy compliance:\n\n' + adDetails });
  }

  const messages = [{ role: 'user', content: userContent }];

  try {
    let data;
    try {
      data = await callClaude(messages, 4096);
      console.log('Response from: claude');
    } catch (err) {
      if (err.message === 'OVERLOADED') {
        console.log('Claude overloaded. Falling back to OpenAI...');
        data = await callOpenAI(messages);
        console.log('Response from: openai (fallback)');
      } else {
        throw err;
      }
    }

    const result = parseComplianceResponse(data);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Legacy endpoint for the frontend app ─────────────────────────
app.post('/api/analyze', rateLimit, async (req, res) => {
  try {
    let data;
    try {
      data = await callClaude(req.body.messages, req.body.max_tokens || 4096);
      console.log('Response from: claude');
    } catch (err) {
      if (err.message === 'OVERLOADED') {
        console.log('Claude overloaded. Falling back to OpenAI...');
        data = await callOpenAI(req.body.messages);
        console.log('Response from: openai (fallback)');
      } else {
        throw err;
      }
    }
    res.json(data);
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ─── Serve frontend for all other routes ──────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
  console.log('OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);
});
