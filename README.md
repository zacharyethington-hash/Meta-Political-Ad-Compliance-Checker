# Meta Political Ad Compliance Checker

AI-powered pre-submission screening tool for Meta/Facebook political ads. Catches policy violations, flags misclassification risks, and provides actionable fixes — before you submit to Meta.

Built on Meta's official Advertising Standards and Community Standards, and calibrated against real-world ad rejection data.

---

## What It Does

Upload your ad creative and enter your copy. The tool analyzes everything against Meta's policies and returns:

- **Risk score** (0–100) with LOW / MEDIUM / HIGH rating
- **Issues ranked by severity** — Tier 1 (immediate rejection) through Tier 4 (best practices)
- **Specific policy citations** for every issue found
- **Actionable fix recommendations** for each issue
- **Financial Services misclassification detection** — the #1 cause of political ad rejections

### Policy Coverage

- "Paid for by" disclaimer validation and cross-checking
- Ad Authorization and Special Ad Category requirements
- Personal Attributes violations (with Meta's exact approved/prohibited examples)
- Community Standards (hate speech, misinformation, violent content, profanity)
- Adult content, nudity, and sexually suggestive content
- Discriminatory practices and targeting restrictions
- Landing page alignment
- Text overlay and delivery impact
- Intellectual property concerns

### Financial Services Misclassification Detection

Meta's automated review system frequently misclassifies political ads as "Financial and Insurance Products and Services," triggering automatic rejection. This tool identifies the specific words and image elements that trigger this misclassification, including:

- Financial language in political context (taxes, spending, stocks, inflation, homeowners)
- Money/currency imagery used as backgrounds
- Account-level risk patterns
- Specific rewording suggestions to avoid the trigger

---

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Web App     │────▶│ Express API  │────▶│  Claude API     │
│  (React)    │     │  /api/check  │     │  (Sonnet 4)     │
└─────────────┘     │  /api/analyze│     ├─────────────────┤
                    └──────────────┘────▶│  OpenAI (GPT-4o)│
                     Stores API keys     │  (fallback)     │
                     securely on server  └─────────────────┘
```

- API keys never leave the server
- Auto-retry on API overload (up to 3 attempts)
- Automatic fallback from Claude to OpenAI if Claude is unavailable
- Rate limiting (10 requests/minute per IP)
- Optional API key authentication

---

## Quick Start (Local)

### Prerequisites

- **Node.js 18+** — https://nodejs.org
- **Anthropic API key** — https://console.anthropic.com
- **OpenAI API key** (optional, for fallback) — https://platform.openai.com/api-keys

### Run It

```bash
cd meta-ad-compliance-checker
npm install
export ANTHROPIC_API_KEY=sk-ant-your-key-here
export OPENAI_API_KEY=sk-your-key-here    # optional
npm run dev
```

Open **http://localhost:5173**

---

## Deploy to Production (Railway)

1. Push this repo to GitHub
2. Go to https://railway.app → **New Project** → **Deploy from GitHub**
3. Add these **Variables**:
   - `ANTHROPIC_API_KEY` — your Anthropic key
   - `OPENAI_API_KEY` — your OpenAI key (optional)
   - `NODE_ENV` — `production`
   - `API_ACCESS_KEY` — a secret key for API authentication (optional)
4. In **Settings** → **Networking**, generate a domain and set the port to match the Deploy Logs
5. Done — share the URL with your team

---

## API

The tool exposes a REST API for integration with other tools and scripts.

### `POST /api/check`

Run a compliance check on an ad.

**Headers:**

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `x-api-key` | If configured | API access key (set `API_ACCESS_KEY` in env) |

**Request Body:**

```json
{
  "headline": "Vote YES on Prop 42",
  "body_text": "Better schools for our community.",
  "paid_for_by": "Citizens for Better Schools",
  "facebook_page_url": "https://facebook.com/CitizensForBetterSchools",
  "landing_url": "https://example.com/prop42",
  "ad_category": "political",
  "target_audience": "Adults 25-65 in California",
  "images": [
    {
      "base64": "/9j/4AAQSkZJRg...",
      "media_type": "image/jpeg"
    }
  ]
}
```

At least one of `headline`, `body_text`, or `images` must be provided.

**Response:**

```json
{
  "overall_risk": "MEDIUM",
  "overall_score": 62,
  "summary": "The ad contains language that may trigger Financial Services misclassification.",
  "categories": [
    {
      "name": "Financial Services Misclassification Risk",
      "status": "WARNING",
      "confidence": 85,
      "issues": [
        {
          "tier": 2,
          "title": "[T2] Financial language may trigger misclassification",
          "severity": "critical",
          "description": "The phrase 'opposing tax hikes' and 'cutting government spending' may cause Meta's automated system to flag this as a financial services ad.",
          "recommendation": "Consider rewording to 'fighting wasteful government programs' and 'standing up against higher costs of living'.",
          "meta_policy_ref": "Advertising Standards — Financial and Insurance Products and Services"
        }
      ]
    }
  ],
  "quick_fixes": ["Reword financial-adjacent language to avoid misclassification"]
}
```

### `GET /api/health`

Check server status and API key configuration.

### Example: cURL

```bash
curl -X POST https://your-app.up.railway.app/api/check \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Vote YES on Prop 42",
    "body_text": "As a taxpayer, you deserve better schools.",
    "paid_for_by": "Citizens for Better Schools"
  }'
```

### Example: Python

```python
import requests

result = requests.post("https://your-app.up.railway.app/api/check", json={
    "headline": "Vote YES on Prop 42",
    "body_text": "Better schools for our community.",
    "paid_for_by": "Citizens for Better Schools",
}).json()

print(f"Risk: {result['overall_risk']} (Score: {result['overall_score']})")
for cat in result["categories"]:
    for issue in cat["issues"]:
        print(f"  [{issue['tier']}] {issue['title']}")
```

---

## Project Structure

```
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite config with API proxy
├── Dockerfile              # Docker build config
├── server/
│   └── index.js            # Express API server
│       ├── /api/check      # Compliance check endpoint
│       ├── /api/analyze    # Legacy frontend endpoint
│       └── /api/health     # Health check
└── src/
    ├── main.jsx            # React entry point
    └── App.jsx             # Frontend application
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (`sk-ant-...`) |
| `OPENAI_API_KEY` | No | OpenAI key for fallback (`sk-...`) |
| `NODE_ENV` | For prod | Set to `production` |
| `PORT` | No | Server port (default: 8080) |
| `API_ACCESS_KEY` | No | Require this key in `x-api-key` header for `/api/check` |

## Cost

Each compliance check costs approximately **$0.01–$0.05** depending on the number of images uploaded. Monitor usage at https://console.anthropic.com and https://platform.openai.com.

## Accuracy

The system prompt is grounded in:

- **Meta's official Advertising Standards** (verbatim policy language)
- **Meta's Community Standards**
- **Meta's Privacy Violations and Personal Attributes policy** (with exact approved/prohibited examples)
- **Real-world rejection data** from political ad campaigns, calibrated against actual Meta enforcement outcomes

The tool is most accurate for US political/electoral ads and issue advocacy ads. Accuracy improves over time as more rejection data is fed into the system prompt.

---

## License

MIT
