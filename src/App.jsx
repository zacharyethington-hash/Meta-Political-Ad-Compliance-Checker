import { useState, useEffect, useRef } from "react";

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

1.6 **Personal Attributes Violations** — Per Meta: ads must not assert or imply personal attributes including voting status, race, religion, etc. Using "you/your" + personal attribute = FAIL. This is strictly enforced. Use the EXACT examples from Meta's policy to evaluate.

### TIER 2 — LIKELY REJECTION ON REVIEW (severity: "critical" or "warning")

2.1 **Misleading/Deceptive Content** — Per Meta: "Ads must not promote products, services, schemes or offers using deceptive or misleading practices." Manipulated media (deepfakes) = FAIL. Fabricated endorsements/statistics = FAIL. Sensationalized/clickbait language = WARNING.

2.2 **Misinformation** — Per Meta: "ads that include content debunked by third-party fact checkers" are prohibited. Unsubstantiated factual claims = WARNING.

2.3 **Prohibited Imagery** — Per Meta's Adult Nudity policy: no nudity, near nudity, sexually suggestive content. Per Violent/Graphic Content policy: no shocking/sensational/excessively violent content. Before/after imagery, weapons in threatening context = WARNING to FAIL.

2.4 **Landing Page Misalignment** — Per Meta: "products and services promoted in an ad must match those promoted on the landing page." Bait-and-switch = FAIL. Missing/broken URL = WARNING.

2.5 **Profanity** — Per Meta: "Ads must not contain profanity." Any profanity = FAIL.

### TIER 3 — DELIVERY REDUCTION / EXTENDED REVIEW (severity: "warning")

3.1 **Excessive Text in Image** — Meta no longer rejects for >20% text overlay, but heavily text-dominant images receive reduced delivery. Political ads commonly use text-heavy designs — only flag if extreme (>60%). Flag as WARNING with delivery impact note.

3.2 **Special Ad Category Targeting Restrictions** — Political ads have restricted targeting: no age/gender/zip-code targeting, limited interest targeting, no lookalike audiences (replaced by Special Ad Audiences).

3.3 **Inflammatory Language** — Characterizing groups in extreme terms ("radical," "enemy") may trigger extended manual review. Common in political ads — flag as INFO unless it crosses into hateful conduct (Tier 1).

3.4 **Page/Advertiser Alignment** — Page name should align with the "Paid for by" entity. New pages running political ads get extra scrutiny.

### TIER 4 — BEST PRACTICES (severity: "info")

4.1 **Missing Optional Elements** — No CTA alignment, missing source citations for statistics.
4.2 **Accessibility & Quality** — Low-res images, poor contrast, grammar/spelling errors.
4.3 **Compliance Documentation** — Recommendation to verify page transparency, have authorization docs ready.

---

## OUTPUT REQUIREMENTS

1. Issues MUST be sorted by tier — Tier 1 first, then 2, 3, 4.
2. Each issue title must include tier prefix: "[T1]", "[T2]", "[T3]", "[T4]".
3. Each issue MUST include a meta_policy_ref citing the specific Meta policy (e.g., "Advertising Standards — Privacy Violations and Personal Attributes").
4. Overall score weighting: single T1 FAIL caps score at 30 max. T2 FAIL caps at 55. T3 WARNINGs don't drop below 60.
5. Categories ordered by highest-severity issue first.
6. When evaluating Personal Attributes violations, compare the ad text against the EXACT approved/prohibited examples from Meta's policy documentation above.
7. When evaluating image content, check against the specific prohibitions in the Adult Nudity, Violent/Graphic Content, and Coordinating Harm policies above.

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

const GOOGLE_POLICY_SYSTEM_PROMPT = `You are an expert Google Ads political advertising compliance analyst. Your job is to pre-screen political and election ads before submission to Google, covering Google Discover Feed ads and YouTube ads.

You must analyze ads against Google's Political Content policies, Google Ads policies, and YouTube ad policies. Issues must be ranked hierarchically by enforcement severity.

---

## GOOGLE'S OFFICIAL POLITICAL AD POLICIES

### SOURCE: Google Ads — "Political Content"
Google requires election ads to comply with local legal requirements in addition to Google Ads policies. In the United States:
- All election ads MUST include a "Paid for by" disclosure that clearly identifies who paid for the ad
- The disclosure must be within the ad itself (not just the landing page)
- Advertisers running election ads MUST complete Google's identity verification process
- Advertisers must submit an FEC ID or be verified as an individual or organization

### SOURCE: Google Ads — Election Ad Restrictions
- Election ads include ads that feature: a current officeholder or candidate for federal, state, or local office; a federal, state, or local political party; ads related to ballot measures
- Issue ads about controversial political topics may also be classified as election ads
- Google maintains an Election Ads Transparency Report and Ad Library

### SOURCE: Google Ads — "Misrepresentation"
"Google Ads doesn't allow ads or destinations that deceive users by excluding relevant product information or providing misleading information about products, services, or businesses."
- Ads must not make misleading claims about identity, qualifications, or political affiliations
- Ads must not contain demonstrably false claims that could undermine participation in elections
- Manipulated media (deepfakes, doctored images/video) that mislead about political candidates are PROHIBITED
- Google prohibits "demonstrably false claims that could significantly undermine participation or trust in an electoral or democratic process"

### SOURCE: Google Ads — "Inappropriate Content"
- Ads must not promote content that is shocking, sensational, or gratuitously violent
- Ads must not contain hate speech targeting individuals or groups based on race, ethnicity, religion, disability, age, nationality, veteran status, sexual orientation, gender, gender identity, or similar characteristics
- Ads must not bully, intimidate, or harass individuals

### SOURCE: Google Ads — "Restricted Content: Political Content"
- Political ads have restricted targeting: cannot use audience segments based on public voter records, political affiliation, or political opinions for targeting
- Remarketing lists cannot be used for election ads based on political affiliation
- Custom audience targeting using political terms is restricted

### SOURCE: Google Ads — "Editorial Standards"
- Headlines: max 30 characters for standard headlines, max 90 characters for long headlines
- Descriptions: max 90 characters
- No excessive capitalization (e.g., "FREE" is ok, but "BUY NOW FREE SHIPPING" all caps is not)
- No excessive punctuation or symbols
- No misleading use of clickbait tactics
- Grammar and spelling should be correct

### SOURCE: Google Ads — "Destination Requirements"
- Landing page must be functional and match the ad content
- Landing page must not contain malware, auto-downloads, or deceptive elements
- The promoted product/service on the landing page must match what the ad describes

### SOURCE: Google Ads — "Trademark Policies"
- Ads must not infringe on trademarks
- Use of competitor trademarks in ad text may be restricted

### SOURCE: YouTube-Specific Policies
- YouTube video ads must comply with YouTube Community Guidelines in addition to Google Ads policies
- Video content must not contain misleading election information
- YouTube has additional content suitability requirements for ads

### SOURCE: Google Discover Feed Policies
- Content must be relevant, useful, and not misleading
- Clickbait headlines that exaggerate or are misleading will be disapproved
- Images must be high quality (at least 1200px wide recommended)
- Images must not be overly edited, manipulated, or contain excessive text overlay

### SOURCE: YouTube and Discover Feed Ad Requirements (Official Google Policy — support.google.com/adspolicy/answer/10249050)

YouTube and Discover Feed ads are subject to standard Google Ads policies PLUS additional creative quality requirements. These are the PROHIBITED categories:

**EXAGGERATED OR INACCURATE CLAIMS (CLICKBAIT)**
Ads containing exaggerated or inaccurate claims that promote unrealistic expectations are NOT allowed:
- Ads promising overnight financial success or "free money" without clear legitimate steps (e.g., "Make $5,000 in 5 minutes!")
- Ads with misleading/exaggerated claims about price, availability, quality, or effectiveness (e.g., advertising a $1,000 item for "$1 ONLY!")
- Ads using language to elicit strong negative emotional reactions or create false urgency (e.g., "Only 5 minutes to save a life!")
- Ads with false/exaggerated health claims — promising secret cures, guaranteeing unrealistic transformation, misleading before-and-after images, claiming "100% effective" (e.g., "Cure all allergies instantly!")
- ALLOWED: Ads promising money that clearly indicate legitimate steps required. User testimonials without exaggerated claims.

**NEGATIVE EVENTS AND IMAGERY**
- PROHIBITED: Ads showing funerals with people weeping/mourning/screaming, severe emotional breakdowns
- PROHIBITED: Ads designed to scare intentionally — simulated/real footage of distressing accidents, natural disasters, civil unrest, riots, jump-scares
- PROHIBITED: Ads focusing on abuse or addiction likely to cause distress — depictions of domestic violence, emotional abuse, graphic self-harm, overdose symptoms
- PROHIBITED: Disturbing/repulsive content related to injuries or death — excessively gory content, gratuitous blood/bodily fluids, exposed organs
- ALLOWED: Content presented neutrally avoiding distressing themes. Factual presentation of sensitive topics.

**IMPROPER CONTENT — Body Parts and Health Conditions**
- PROHIBITED: Ads showing medical/dental surgery with blood, gore, bodily fluids, tooth decay
- PROHIBITED: Ads showing bodily symptoms like fluids, rashes, visible pus, close-ups of infections
- PROHIBITED: Ads emphasizing body parts likely to make viewers feel self-conscious (close-ups of wrinkles, stretch marks, acne with negative sentiment)
- ALLOWED: Ads for weight loss, hair loss, skin conditions if imagery isn't disturbing

**IMPROPER CONTENT — Violent and Dangerous Acts**
- PROHIBITED: Realistic/graphic depictions of violent acts, harm with weapons, graphic wounds, excessive bloodshed
- PROHIBITED: Content depicting weapons or illegal activity (drug trafficking, close-up military-grade weapons being used)
- PROHIBITED: Dangerous actions that could result in bodily harm or encourage imitation

**IMPROPER CONTENT — Racy Content**
- PROHIBITED: Adult content where majority of ad focuses on nudity or sexual topics (visible genitalia, exposed breasts, focus on groin, majority of buttocks exposed, sexually suggestive poses)
- PROHIBITED: Dating promotion using sexually suggestive imagery/language ("hook-up", "no strings attached", "naughty singles")
- PROHIBITED: Sexual entertainment (strip clubs, sexually suggestive live streaming, suggestive role playing games)
- ALLOWED: Swimwear/spa promotion that is not overtly sexualized. Displays of affection that are not sexually suggestive. Sexual health products if not sexualized (must mention brand name).

**IMPROPER CONTENT — Recreational Drugs**
- PROHIBITED: Ads showing sale, consumption, or glorification of recreational drugs, illegal substances, cannabis, marijuana, nicotine products, or accessories (bongs, pipes, rolling papers)
- ALLOWED: Educational purposes like addiction prevention, provided no explicit/sensationalized imagery

**IMPROPER CONTENT — Inappropriate Language**
- PROHIBITED: Obscene, profane, or offensive language or gestures (including all translations, variations, misspellings of profane language, and hand gestures)
- PROHIBITED: Derogatory language inciting hatred, promoting discrimination, or disparaging individuals/groups associated with systemic discrimination (slurs relating to race, sexuality, etc.)

**SENSITIVE APPLICATIONS**
- PROHIBITED on YouTube/Discover: Social apps with adult content, apps primarily for meeting new people, apps primarily for dating/relationships (UNLESS the app has no live stream features, no live chats with strangers, and no racy/suggestive content)

**QUALITY CHECKS**
- Assets must have clarity, correct spelling, proper capitalization and symbols
- Images must not be blurred, distorted, or poorly cropped

**CRITICAL: ELECTION ADS EXCEPTION**
"Election ads are exempt from the YouTube and Discover Feed ad requirements, though they remain subject to the Google Ads policies. To qualify for this exception, an advertiser must be verified under the Election Ads verification process for the region where the ad will run."
This means political/election ads that are properly verified are NOT subject to the YouTube/Discover-specific restrictions above (clickbait, negative imagery, improper content), BUT they ARE still subject to all standard Google Ads policies (misrepresentation, hate speech, etc.).

---

## ENFORCEMENT HIERARCHY

### TIER 1 — IMMEDIATE DISAPPROVAL (severity: "critical")
1.1 **Missing "Paid for by" Disclosure** — ALL election ads must include a "Paid for by" disclosure.
1.2 **Missing Identity Verification** — Advertisers must complete Google's election ad verification. Without this, the election ad exemption from YouTube/Discover requirements does NOT apply.
1.3 **Demonstrably False Election Claims** — False election dates, procedures, or integrity claims = FAIL. This applies even with election ad exemption.
1.4 **Manipulated Media** — Deepfakes or doctored images of political figures = FAIL. This applies even with election ad exemption.
1.5 **Hate Speech** — Content targeting groups based on protected characteristics = FAIL. This applies even with election ad exemption.
1.6 **Misrepresentation** — Deceiving about advertiser identity or political affiliations = FAIL. This applies even with election ad exemption.

### TIER 2 — LIKELY DISAPPROVAL (severity: "critical" or "warning")
2.1 **Editorial Violations** — Excessive capitalization, punctuation, clickbait = WARNING to FAIL.
2.2 **Character Limit Violations** — Headlines >30 chars, long headlines >90 chars, descriptions >90 chars = FAIL. COUNT CHARACTERS CAREFULLY.
2.3 **Destination Mismatch** — Landing page doesn't match ad claims = FAIL.
2.4 **Inappropriate/Shocking Content** — Violent, sensational imagery or language = FAIL. NOTE: If advertiser is verified for election ads, this is downgraded to INFO for YouTube/Discover (but still applies under standard Google Ads policies).
2.5 **Trademark Violations** — Unauthorized trademark use = WARNING to FAIL.
2.6 **Profanity/Inappropriate Language** — Per YouTube/Discover policy: obscene, profane language, variations and misspellings of profanity, derogatory slurs = FAIL.

### TIER 3 — RESTRICTED DELIVERY / REVIEW (severity: "warning")
3.1 **Targeting Restrictions** — Political ads cannot use political affiliation targeting.
3.2 **Image Quality Issues (Discover)** — Low resolution, blurred, distorted, poorly cropped images, excessive text overlay = WARNING.
3.3 **Clickbait Language** — Exaggerated claims, false urgency, strong negative emotional manipulation = WARNING. NOTE: Verified election ads are exempt from YouTube/Discover clickbait rules, but the ad may still violate standard Google Ads misrepresentation policies.
3.4 **YouTube Video Quality** — Low production quality or misleading thumbnails.
3.5 **Negative Imagery Risk** — Ads using distressing imagery (funerals, accidents, disasters, abuse). Verified election ads are exempt from YouTube/Discover rules on this, but FLAG as INFO so advertiser is aware.

### TIER 4 — BEST PRACTICES (severity: "info")
4.1 **Keyword Optimization** — Keyword alignment with ad copy.
4.2 **Ad Format Best Practices** — Character usage, image sizing, CTA effectiveness.
4.3 **Compliance Documentation** — Verification status, FEC requirements.
4.4 **Election Ad Exemption Status** — ALWAYS note whether the ad qualifies for the election ad exemption from YouTube/Discover requirements, and explain which rules still apply vs. which are exempted.

---

## OUTPUT REQUIREMENTS
1. Issues sorted by tier. Each title includes "[T1]", "[T2]", "[T3]", "[T4]".
2. Each issue includes meta_policy_ref citing the specific Google policy.
3. Score weighting: T1 FAIL caps at 30, T2 FAIL caps at 55, T3 WARNINGs don't drop below 60.
4. **CHARACTER COUNT CHECK**: Always count and report character counts for headlines (max 30), long headlines (max 90), and descriptions (max 90).
5. **ALWAYS include an "Election Ad Exemption" category** that explains whether the ad qualifies for the YouTube/Discover exemption and what that means for the specific issues found.

Respond ONLY in valid JSON with this structure:
{
  "overall_risk": "LOW|MEDIUM|HIGH",
  "overall_score": 0-100,
  "summary": "Brief overall assessment",
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
          "description": "What the issue is",
          "recommendation": "Specific fix",
          "meta_policy_ref": "Google Ads Policy — Section Name"
        }
      ]
    }
  ],
  "quick_fixes": ["Actionable suggestions ordered by priority"]
}`;

const StatusBadge = ({ status }) => {
  const styles = {
    PASS: { bg: "#0a2e1a", border: "#22c55e", text: "#4ade80", label: "PASS" },
    WARNING: { bg: "#2e2a0a", border: "#eab308", text: "#facc15", label: "WARNING" },
    FAIL: { bg: "#2e0a0a", border: "#ef4444", text: "#f87171", label: "FAIL" },
  };
  const s = styles[status] || styles.PASS;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      padding: "2px 10px", borderRadius: "4px", fontSize: "11px",
      fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace"
    }}>{s.label}</span>
  );
};

const RiskGauge = ({ score, risk }) => {
  const colors = { LOW: "#22c55e", MEDIUM: "#eab308", HIGH: "#ef4444" };
  const color = colors[risk] || "#666";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a2e" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="28" fontWeight="800"
          fontFamily="'JetBrains Mono', monospace">{score}</text>
        <text x="60" y="72" textAnchor="middle" fill="#666" fontSize="10"
          fontFamily="'JetBrains Mono', monospace">/ 100</text>
      </svg>
      <div style={{
        background: color + "18", border: `1px solid ${color}40`, color,
        padding: "4px 16px", borderRadius: "4px", fontSize: "12px",
        fontWeight: 800, letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace"
      }}>{risk} RISK</div>
    </div>
  );
};

const IssueCard = ({ issue }) => {
  const colors = {
    critical: { bg: "#1a0808", border: "#991b1b", accent: "#f87171", icon: "✕" },
    warning: { bg: "#1a1508", border: "#92400e", accent: "#fbbf24", icon: "!" },
    info: { bg: "#081a1a", border: "#155e75", accent: "#67e8f9", icon: "i" },
  };
  const c = colors[issue.severity] || colors.info;
  const tierColors = {
    1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#6b7280"
  };
  const tierLabels = {
    1: "IMMEDIATE REJECTION", 2: "LIKELY REJECTION", 3: "DELIVERY IMPACT", 4: "BEST PRACTICE"
  };
  const tier = issue.tier || 4;

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}40`,
      borderRadius: "6px", padding: "14px 16px", marginBottom: "8px",
      borderLeft: `3px solid ${c.accent}`
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
        <span style={{
          width: "20px", height: "20px", borderRadius: "50%",
          background: c.accent + "20", color: c.accent, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "11px",
          fontWeight: 800, flexShrink: 0
        }}>{c.icon}</span>
        <span style={{
          background: tierColors[tier] + "20", color: tierColors[tier],
          border: `1px solid ${tierColors[tier]}40`,
          padding: "1px 8px", borderRadius: "3px", fontSize: "10px",
          fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.06em", flexShrink: 0
        }}>T{tier} · {tierLabels[tier]}</span>
        <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{issue.title?.replace(/^\[T\d\]\s*/, "")}</span>
      </div>
      <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, margin: "0 0 8px 28px" }}>
        {issue.description}
      </p>
      {issue.recommendation && (
        <div style={{
          margin: "0 0 0 28px", padding: "8px 12px",
          background: "#0f172a", borderRadius: "4px", fontSize: "12px",
          color: "#67e8f9", lineHeight: 1.5, borderLeft: `2px solid ${c.accent}40`
        }}>
          <span style={{ fontWeight: 700, marginRight: "4px" }}>Fix:</span>
          {issue.recommendation}
        </div>
      )}
      {issue.meta_policy_ref && (
        <div style={{
          margin: "6px 0 0 28px", fontSize: "11px", color: "#475569",
          fontFamily: "'JetBrains Mono', monospace", fontStyle: "italic"
        }}>
          📋 {issue.meta_policy_ref}
        </div>
      )}
    </div>
  );
};

export default function MetaAdComplianceChecker() {
  const [adText, setAdText] = useState("");
  const [headline, setHeadline] = useState("");
  const [platform, setPlatform] = useState("meta"); // "meta" or "google"
  // Meta-specific
  const [paidForBy, setPaidForBy] = useState("");
  const [facebookPageUrl, setFacebookPageUrl] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  // Google-specific
  const [googleKeywords, setGoogleKeywords] = useState("");
  const [googleWebsite, setGoogleWebsite] = useState("");
  const [googleLongHeadline, setGoogleLongHeadline] = useState("");
  const [googleDescription, setGoogleDescription] = useState("");
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [images, setImages] = useState([]); // Array of { file, preview, base64, mediaType }
  const [isDragging, setIsDragging] = useState(false);
  const [mediaMode, setMediaMode] = useState("image"); // "image" or "video"
  const [targetAudience, setTargetAudience] = useState("");
  const [adCategory, setAdCategory] = useState("political");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const resultsRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 10;

  const handleImageFiles = (files) => {
    const fileList = Array.from(files);
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const remaining = MAX_IMAGES - images.length;

    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const toAdd = fileList.slice(0, remaining);
    const invalid = toAdd.find(f => !validTypes.includes(f.type));
    if (invalid) {
      setError("Only JPG, PNG, GIF, and WebP images are supported.");
      return;
    }
    const tooLarge = toAdd.find(f => f.size > 20 * 1024 * 1024);
    if (tooLarge) {
      setError(`"${tooLarge.name}" exceeds the 20MB limit.`);
      return;
    }

    setError(null);

    toAdd.forEach(file => {
      const preview = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        setImages(prev => [...prev, { file, preview, base64, mediaType: file.type }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileList.length > remaining) {
      setError(`Only ${remaining} more image(s) can be added. ${fileList.length - remaining} file(s) were skipped.`);
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearAllImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleImageFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  useEffect(() => {
    if (results) {
      setAnimateIn(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [results]);

  const analyzeAd = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setAnimateIn(false);

    let adDetails;
    let systemPrompt;
    let platformLabel;

    if (platform === "meta") {
      systemPrompt = POLICY_SYSTEM_PROMPT;
      platformLabel = "Meta/Facebook";
      adDetails = `
AD HEADLINE: ${headline || "(not provided)"}
AD BODY TEXT: ${adText || "(not provided)"}
PAID FOR BY DISCLAIMER: ${paidForBy || "(not provided)"}
FACEBOOK PAGE URL: ${facebookPageUrl || "(not provided)"}
LANDING PAGE URL: ${landingUrl || "(not provided)"}
VIDEO/VISUAL DESCRIPTION: ${imageDescription || "(not provided)"}
TARGET AUDIENCE DESCRIPTION: ${targetAudience || "(not provided)"}
AD CATEGORY: ${adCategory}
      `.trim();
    } else {
      systemPrompt = GOOGLE_POLICY_SYSTEM_PROMPT;
      platformLabel = "Google Discover/YouTube";
      adDetails = `
KEYWORDS: ${googleKeywords || "(not provided)"}
WEBSITE: ${googleWebsite || "(not provided)"}
HEADLINE: ${headline || "(not provided)"} [${(headline || "").length} characters — max 30]
LONG HEADLINE: ${googleLongHeadline || "(not provided)"} [${(googleLongHeadline || "").length} characters — max 90]
DESCRIPTION: ${googleDescription || "(not provided)"} [${(googleDescription || "").length} characters — max 90]
YOUTUBE VIDEO URL: ${youtubeVideoUrl || "(not provided)"}
VIDEO/VISUAL DESCRIPTION: ${imageDescription || "(not provided)"}
AD CATEGORY: ${adCategory}
      `.trim();
    }

    // Build message content array
    const userContent = [];

    if (images.length > 0) {
      images.forEach((img, i) => {
        userContent.push({
          type: "image",
          source: { type: "base64", media_type: img.mediaType, data: img.base64 }
        });
        if (images.length > 1) {
          userContent.push({
            type: "text",
            text: `[Image ${i + 1} of ${images.length}: ${img.file.name}]`
          });
        }
      });
      const plural = images.length > 1;
      userContent.push({
        type: "text",
        text: `The ${plural ? `${images.length} images above are the ad creatives/visuals` : "image above is the ad creative/visual"} that will be used in this political ad on ${platformLabel}. ${plural ? "Analyze EACH image individually and note which image any issues apply to." : "Please analyze it carefully"} for policy compliance issues.\n\nHere are the additional ad details:\n\n${adDetails}`
      });
    } else {
      userContent.push({
        type: "text",
        text: `Please analyze this political ad for ${platformLabel} policy compliance:\n\n${adDetails}`
      });
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: "user", content: userContent }
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(`API error: ${data.error.message || JSON.stringify(data.error)}`);
        return;
      }

      const text = data.content?.map(i => i.text || "").join("\n") || "";
      if (!text) {
        setError("No response received from the API. Please try again.");
        return;
      }

      // Extract JSON from response - handle markdown fences and leading text
      let jsonStr = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      jsonStr = jsonStr.replace(/```json|```/g, "").trim();

      try {
        const parsed = JSON.parse(jsonStr);
        setResults(parsed);
        setActiveTab(0);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr, "\nRaw response:", text);
        setError("Failed to parse analysis results. The AI response was not valid JSON. Please try again.");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      if (!error) {
        setError(`Analysis failed: ${err.message || "Unknown error"}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasInput = platform === "meta" ? (adText || headline) : (headline || googleLongHeadline || googleDescription);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        textarea, input, select { font-family: inherit; }
        textarea:focus, input:focus, select:focus { outline: none; border-color: #3b82f6 !important; }
        ::selection { background: #3b82f680; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scan {
          0% { top: 0; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        background: "linear-gradient(180deg, #0c0c1a 0%, #080810 100%)",
        padding: "24px 32px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 800, color: "white",
              fontFamily: "'JetBrains Mono', monospace"
            }}>⬡</div>
            <div>
              <h1 style={{
                fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>Political Ad Compliance Checker</h1>
              <p style={{
                fontSize: "12px", color: "#64748b", margin: 0,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em"
              }}>AI-POWERED PRE-SUBMISSION SCREENING</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 32px" }}>
        {/* Input Form */}
        <div style={{
          background: "#0c0c1a", border: "1px solid #1e293b",
          borderRadius: "10px", padding: "24px", marginBottom: "24px"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px"
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#3b82f6", boxShadow: "0 0 8px #3b82f640"
            }} />
            <span style={{
              fontSize: "13px", fontWeight: 600, color: "#94a3b8",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em"
            }}>AD DETAILS</span>
          </div>

          {/* Platform Toggle */}
          <div style={{
            display: "flex", background: "#080810", borderRadius: "8px",
            border: "1px solid #1e293b", overflow: "hidden", marginBottom: "20px"
          }}>
            {[
              { id: "meta", label: "META / FACEBOOK", icon: "\u24C2" },
              { id: "google", label: "GOOGLE / YOUTUBE", icon: "\u25B6" }
            ].map(p => (
              <button key={p.id} onClick={() => { setPlatform(p.id); setResults(null); setError(null); }}
                style={{
                  flex: 1, background: platform === p.id
                    ? (p.id === "meta" ? "linear-gradient(135deg, #1d4ed8, #7c3aed)" : "linear-gradient(135deg, #ea4335, #fbbc04)")
                    : "transparent",
                  border: "none",
                  color: platform === p.id ? "#fff" : "#64748b",
                  padding: "10px 16px", fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.06em", transition: "all 0.3s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}>
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          {/* META FIELDS */}
          {platform === "meta" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Headline</label>
              <input
                value={headline} onChange={e => setHeadline(e.target.value)}
                placeholder="Your ad headline..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>"Paid for by" Disclaimer</label>
              <input
                value={paidForBy} onChange={e => setPaidForBy(e.target.value)}
                placeholder='e.g. "Paid for by Citizens for Progress"'
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Facebook Page URL</label>
            <input
              value={facebookPageUrl} onChange={e => setFacebookPageUrl(e.target.value)}
              placeholder="https://www.facebook.com/YourPageName"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Ad Body Text</label>
            <textarea
              value={adText} onChange={e => setAdText(e.target.value)}
              placeholder="Enter the full ad copy text..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Landing Page URL</label>
              <input
                value={landingUrl} onChange={e => setLandingUrl(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ad Category</label>
              <select
                value={adCategory} onChange={e => setAdCategory(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              >
                <option value="political">Political / Elections</option>
                <option value="social_issue">Social Issue</option>
                <option value="ballot_measure">Ballot Measure</option>
                <option value="candidate">Candidate Ad</option>
                <option value="issue_advocacy">Issue Advocacy</option>
              </select>
            </div>
          </div>
          </>)}

          {/* GOOGLE FIELDS */}
          {platform === "google" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Keywords <span style={{ fontWeight: 400, color: "#475569" }}>(optional)</span></label>
              <input
                value={googleKeywords} onChange={e => setGoogleKeywords(e.target.value)}
                placeholder="e.g. vote, election 2026, candidate name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Website <span style={{ fontWeight: 400, color: "#475569" }}>(optional)</span></label>
              <input
                value={googleWebsite} onChange={e => setGoogleWebsite(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Headline <span style={{ fontWeight: 400, color: "#475569" }}>(max 30 chars)</span></label>
              <input
                value={headline} onChange={e => setHeadline(e.target.value)}
                placeholder="Your ad headline..."
                style={inputStyle}
                maxLength={50}
              />
              <div style={{
                fontSize: "10px", marginTop: "4px",
                fontFamily: "'JetBrains Mono', monospace",
                color: headline.length > 30 ? "#ef4444" : "#475569"
              }}>{headline.length}/30 characters{headline.length > 30 ? " — EXCEEDS LIMIT" : ""}</div>
            </div>
            <div>
              <label style={labelStyle}>Long Headline <span style={{ fontWeight: 400, color: "#475569" }}>(max 90 chars)</span></label>
              <input
                value={googleLongHeadline} onChange={e => setGoogleLongHeadline(e.target.value)}
                placeholder="Longer version of your headline..."
                style={inputStyle}
                maxLength={120}
              />
              <div style={{
                fontSize: "10px", marginTop: "4px",
                fontFamily: "'JetBrains Mono', monospace",
                color: googleLongHeadline.length > 90 ? "#ef4444" : "#475569"
              }}>{googleLongHeadline.length}/90 characters{googleLongHeadline.length > 90 ? " — EXCEEDS LIMIT" : ""}</div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Description <span style={{ fontWeight: 400, color: "#475569" }}>(max 90 chars)</span></label>
            <textarea
              value={googleDescription} onChange={e => setGoogleDescription(e.target.value)}
              placeholder="Describe your ad..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              maxLength={120}
            />
            <div style={{
              fontSize: "10px", marginTop: "4px",
              fontFamily: "'JetBrains Mono', monospace",
              color: googleDescription.length > 90 ? "#ef4444" : "#475569"
            }}>{googleDescription.length}/90 characters{googleDescription.length > 90 ? " — EXCEEDS LIMIT" : ""}</div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>YouTube Video URL <span style={{ fontWeight: 400, color: "#475569" }}>(optional)</span></label>
            <input
              value={youtubeVideoUrl} onChange={e => setYoutubeVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Ad Category</label>
            <select
              value={adCategory} onChange={e => setAdCategory(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
            >
              <option value="political">Political / Elections</option>
              <option value="social_issue">Social Issue</option>
              <option value="ballot_measure">Ballot Measure</option>
              <option value="candidate">Candidate Ad</option>
              <option value="issue_advocacy">Issue Advocacy</option>
            </select>
          </div>
          </>)}

          {/* Media Upload Section */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Ad Creative</label>
              <div style={{
                display: "flex", background: "#080810", borderRadius: "6px",
                border: "1px solid #1e293b", overflow: "hidden"
              }}>
                {["image", "video"].map(mode => (
                  <button key={mode} onClick={() => { setMediaMode(mode); if (mode === "image") setImageDescription(""); else clearAllImages(); }}
                    style={{
                      background: mediaMode === mode ? "#1e293b" : "transparent",
                      border: "none", color: mediaMode === mode ? "#e2e8f0" : "#64748b",
                      padding: "5px 14px", fontSize: "11px", fontWeight: 600,
                      cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.06em", transition: "all 0.2s"
                    }}>
                    {mode === "image" ? "📷 IMAGE" : "🎬 VIDEO"}
                  </button>
                ))}
              </div>
            </div>

            {mediaMode === "image" ? (
              <div>
                {/* Image preview grid */}
                {images.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "8px"
                    }}>
                      <span style={{
                        fontSize: "11px", color: "#4ade80",
                        fontFamily: "'JetBrains Mono', monospace",
                        display: "flex", alignItems: "center", gap: "6px"
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#22c55e", flexShrink: 0
                        }} />
                        {images.length} image{images.length !== 1 ? "s" : ""} · All will be analyzed for policy compliance
                      </span>
                      <button onClick={clearAllImages} style={{
                        background: "#1a080880", border: "1px solid #991b1b60",
                        borderRadius: "4px", padding: "3px 10px", fontSize: "11px",
                        color: "#f87171", cursor: "pointer", fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>Clear all</button>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: "8px"
                    }}>
                      {images.map((img, i) => (
                        <div key={i} style={{
                          position: "relative", borderRadius: "6px", overflow: "hidden",
                          border: "1px solid #1e293b", background: "#0a0a18"
                        }}>
                          <img src={img.preview} alt={`Creative ${i + 1}`} style={{
                            width: "100%",
                            height: images.length === 1 ? "240px" : "120px",
                            objectFit: "contain", display: "block"
                          }} />
                          <div style={{
                            position: "absolute", top: "4px", left: "4px",
                            background: "#0c0c1aee", border: "1px solid #1e293b",
                            borderRadius: "3px", padding: "2px 6px", fontSize: "10px",
                            color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace"
                          }}>{i + 1}</div>
                          <button onClick={() => removeImage(i)} style={{
                            position: "absolute", top: "4px", right: "4px",
                            background: "#1a0808dd", border: "1px solid #991b1b80",
                            borderRadius: "3px", padding: "2px 6px", fontSize: "10px",
                            color: "#f87171", cursor: "pointer", fontWeight: 800,
                            lineHeight: 1.2
                          }}>✕</button>
                          <div style={{
                            padding: "4px 8px", background: "#080810",
                            borderTop: "1px solid #1e293b",
                            fontSize: "10px", color: "#64748b",
                            fontFamily: "'JetBrains Mono', monospace",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                          }}>{img.file.name} · {(img.file.size / 1024).toFixed(0)}KB</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload zone - always show if under limit */}
                {images.length < MAX_IMAGES && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? "#3b82f6" : "#1e293b"}`,
                      borderRadius: "8px",
                      padding: images.length > 0 ? "16px 20px" : "36px 20px",
                      background: isDragging ? "#3b82f608" : "#080810",
                      cursor: "pointer", textAlign: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={e => { handleImageFiles(e.target.files); e.target.value = ""; }}
                      style={{ display: "none" }}
                    />
                    {images.length === 0 && (
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #1d4ed820, #7c3aed20)",
                        border: "1px solid #1e293b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 12px", fontSize: "20px"
                      }}>🖼</div>
                    )}
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 4px" }}>
                      <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                        {images.length > 0 ? "Add more images" : "Click to upload"}
                      </span>
                      {images.length === 0 && " or drag & drop"}
                    </p>
                    <p style={{
                      color: "#475569", fontSize: "11px", margin: 0,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      JPG, PNG, GIF, WebP · Max 20MB each · Up to {MAX_IMAGES} images
                      {images.length > 0 && ` (${MAX_IMAGES - images.length} remaining)`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={imageDescription} onChange={e => setImageDescription(e.target.value)}
                  placeholder="Describe the video content in detail (e.g., '30-second spot: opens with aerial footage of local community, cuts to candidate speaking at town hall, includes text overlays with policy positions, ends with campaign logo and VOTE NOV 5 call-to-action')..."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
                <p style={{
                  fontSize: "11px", color: "#475569", marginTop: "6px",
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  💡 Video upload not yet supported — describe your video content for AI analysis
                </p>
              </div>
            )}
          </div>

          {platform === "meta" && (
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Target Audience</label>
            <input
              value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
              placeholder="e.g., Adults 25-65, interested in politics, located in Ohio"
              style={inputStyle}
            />
          </div>
          )}

          <button
            onClick={analyzeAd}
            disabled={loading || !hasInput}
            style={{
              width: "100%", padding: "14px", border: "none", borderRadius: "8px",
              background: loading ? "#1e293b" : hasInput ? "linear-gradient(135deg, #1d4ed8, #6d28d9)" : "#1e293b",
              color: hasInput && !loading ? "white" : "#475569",
              fontSize: "14px", fontWeight: 700, cursor: hasInput && !loading ? "pointer" : "not-allowed",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
              transition: "all 0.3s ease",
              position: "relative", overflow: "hidden"
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{ animation: "pulse 1.2s infinite" }}>●</span>
                ANALYZING AD COMPLIANCE...
              </span>
            ) : "RUN COMPLIANCE CHECK"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0808", border: "1px solid #991b1b",
            borderRadius: "8px", padding: "16px", marginBottom: "24px",
            color: "#f87171", fontSize: "13px"
          }}>{error}</div>
        )}

        {/* Results */}
        {results && (
          <div ref={resultsRef} style={{
            animation: animateIn ? "slideUp 0.5s ease forwards" : "none",
            opacity: animateIn ? 1 : 0
          }}>
            {/* Score + Summary */}
            <div style={{
              background: "#0c0c1a", border: "1px solid #1e293b",
              borderRadius: "10px", padding: "28px", marginBottom: "20px",
              display: "flex", gap: "32px", alignItems: "center"
            }}>
              <RiskGauge score={results.overall_score} risk={results.overall_risk} />
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0",
                  fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0"
                }}>Compliance Assessment</h2>
                <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                  {results.summary}
                </p>
                {results.quick_fixes?.length > 0 && (
                  <div style={{ marginTop: "14px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color: "#64748b",
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em"
                    }}>QUICK FIXES</span>
                    <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {results.quick_fixes.map((fix, i) => (
                        <span key={i} style={{
                          background: "#1e293b", border: "1px solid #334155",
                          borderRadius: "4px", padding: "4px 10px", fontSize: "12px",
                          color: "#67e8f9"
                        }}>{fix}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{
              display: "flex", gap: "2px", marginBottom: "2px",
              background: "#0c0c1a", borderRadius: "10px 10px 0 0",
              border: "1px solid #1e293b", borderBottom: "none",
              padding: "4px 4px 0 4px", overflowX: "auto"
            }}>
              {results.categories?.map((cat, i) => (
                <button key={i} onClick={() => setActiveTab(i)} style={{
                  background: activeTab === i ? "#141428" : "transparent",
                  border: "none", borderBottom: activeTab === i ? "2px solid #3b82f6" : "2px solid transparent",
                  borderRadius: "6px 6px 0 0",
                  color: activeTab === i ? "#e2e8f0" : "#64748b",
                  padding: "10px 16px", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "all 0.2s"
                }}>
                  <StatusBadge status={cat.status} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Active Category Detail */}
            {results.categories?.[activeTab] && (
              <div style={{
                background: "#0c0c1a", border: "1px solid #1e293b",
                borderRadius: "0 0 10px 10px", padding: "20px"
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "16px"
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                      {results.categories[activeTab].name}
                    </h3>
                  </div>
                  <div style={{
                    fontSize: "12px", color: "#64748b",
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    Confidence: <span style={{ color: "#e2e8f0", fontWeight: 700 }}>
                      {results.categories[activeTab].confidence}%
                    </span>
                  </div>
                </div>

                {results.categories[activeTab].issues?.length > 0 ? (
                  results.categories[activeTab].issues.map((issue, j) => (
                    <IssueCard key={j} issue={issue} />
                  ))
                ) : (
                  <div style={{
                    padding: "24px", textAlign: "center", color: "#4ade80",
                    fontSize: "13px", background: "#0a2e1a20", borderRadius: "6px",
                    border: "1px solid #22c55e20"
                  }}>
                    ✓ No issues detected in this category
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              marginTop: "20px", padding: "14px 18px",
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: "8px", fontSize: "11px", color: "#64748b",
              lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace"
            }}>
              <strong style={{ color: "#94a3b8" }}>DISCLAIMER:</strong> This tool provides an AI-powered
              estimate of policy compliance. It is not a guarantee of ad approval or rejection by Meta.
              Always consult Meta's official Advertising Standards and consider legal review for political
              advertising. Policies change frequently — verify current requirements at{" "}
              <a href="https://transparency.fb.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "#3b82f6", textDecoration: "underline" }}>transparency.fb.com</a>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b",
  marginBottom: "6px", fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.08em", textTransform: "uppercase"
};

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "#080810",
  border: "1px solid #1e293b", borderRadius: "6px", color: "#e2e8f0",
  fontSize: "13px", transition: "border-color 0.2s"
};
