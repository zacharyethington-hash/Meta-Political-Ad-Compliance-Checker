# Political Ad Compliance Checker

AI-powered pre-submission screening tool for political ads on **Meta/Facebook** and **Google/YouTube**. Catches policy violations, flags misclassification risks, and provides actionable fixes — before you submit.

Built on official advertising policies from both platforms and calibrated against real-world ad rejection data.

---

## What It Does

Toggle between Meta and Google, upload your ad creative and enter your copy. The tool analyzes everything against the selected platform's policies and returns:

- **Risk score** (0–100) with LOW / MEDIUM / HIGH rating
- **Issues ranked by severity** — Tier 1 (immediate rejection) through Tier 4 (best practices)
- **Specific policy citations** for every issue found
- **Actionable fix recommendations** for each issue

### Meta / Facebook

- "Paid for by" disclaimer validation and cross-checking
- Ad Authorization and Special Ad Category requirements
- Personal Attributes violations (with Meta's exact approved/prohibited examples)
- Community Standards (hate speech, misinformation, violent content, profanity)
- Discriminatory practices and targeting restrictions
- **Financial Services misclassification detection** — the #1 cause of political ad rejections, trained on real rejection data

### Google / YouTube / Discover Feed

- "Paid for by" disclosure and identity verification requirements
- Character limit validation (headline 30, long headline 90, description 90)
- YouTube and Discover Feed creative quality requirements (clickbait, negative imagery, improper content, racy content, profanity)
- **Election Ad Exemption analysis** — verified election ads are exempt from YouTube/Discover-specific rules but still subject to standard Google Ads policies
- Editorial standards and destination requirements
- Targeting restrictions for political ads

---

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Web App     │────▶│ Express API  │────▶│  Claude API     │
│  (React)    │     │  /api/analyze │     │  (Sonnet 4)     │
└─────────────┘     └──────────────┘     ├─────────────────┤
                     Stores API keys    ▶│  OpenAI (GPT-4o)│
                     securely on server  │  (fallback)     │
                                         └─────────────────┘
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
cd political-ad-compliance-checker
npm install
export ANTHROPIC_API_KEY=sk-ant-your-key-here
export OPENAI_API_KEY=sk-your-key-here    # optional
npm run dev
```

Open **http://localhost:5173**

---

## Deploy to Production

### Railway

1. Push this repo to GitHub
2. Go to https://railway.app → **New Project** → **Deploy from GitHub**
3. Add these **Variables**:
   - `ANTHROPIC_API_KEY` — your Anthropic key
   - `OPENAI_API_KEY` — your OpenAI key (optional)
   - `NODE_ENV` — `production`
   - `API_ACCESS_KEY` — a secret key for API authentication (optional)
4. In **Settings** → **Networking**, generate a domain and set the port to match the Deploy Logs
5. Share the URL with your team

### Render

1. Push code to GitHub
2. Go to https://render.com → **New Web Service** → connect your repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables and deploy

---

## API

### `POST /api/check`

Run a compliance check. The server selects the correct policy prompt based on the platform field.

**Request Body:**

```json
{
  "platform": "meta",
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

For Google ads, use `"platform": "google"` and include `long_headline`, `description`, `keywords`, `website`, and `youtube_video_url` fields.

### `GET /api/health`

Check server status and API key configuration.

---

## Project Structure

```
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite config with API proxy
├── Dockerfile              # Docker build config
├── server/
│   └── index.js            # Express API server
└── src/
    ├── main.jsx            # React entry point
    └── App.jsx             # Frontend (Meta + Google)
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

Each compliance check costs approximately **$0.01–$0.05** depending on the number of images uploaded.

## Accuracy

The system prompts are grounded in:

- **Meta's official Advertising Standards** and **Community Standards** (verbatim policy language)
- **Meta's Privacy Violations and Personal Attributes policy** (with exact approved/prohibited examples)
- **Real-world Meta rejection data** from political ad campaigns
- **Google Ads policies** including Political Content, Misrepresentation, Editorial Standards
- **YouTube and Discover Feed Ad Requirements** (from support.google.com/adspolicy/answer/10249050) including the Election Ad Exemption

The tool is most accurate for US political/electoral ads and issue advocacy ads.

---

## License

MIT
