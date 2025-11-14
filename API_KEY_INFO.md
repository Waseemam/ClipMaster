# Embedded API Key Information 🔑

## Current Setup

Your OpenAI API key is now **embedded directly in the app** at `src/config.js`.

This allows you to distribute a single EXE file to friends without them needing their own API keys!

## Location

**File:** `src/config.js`

```javascript
const CONFIG = {
  OPENAI_API_KEY: 'sk-proj--xfw9nCPrrkz6DIlZRVL32pfb-NAi...',
  // ... other settings
};
```

## ⚠️ Important Considerations

### Cost Sharing
- ✅ All users share the **same API key**
- ⚠️ **You pay for all API usage** from all users
- 💰 Monitor usage at: https://platform.openai.com/usage

### Usage Costs (gpt-4o-mini)
- **$0.150** per 1M input tokens
- **$0.600** per 1M output tokens
- Example: 1,000 AI operations ≈ $0.10 - $1.00 (very affordable!)

### Security
- ✅ Key is compiled into the app (not easily extractable)
- ✅ Still relatively secure for friend/family distribution
- ⚠️ Don't distribute publicly to thousands of users

## How to Change the API Key

### Option 1: Update in config.js
1. Open `src/config.js`
2. Change `OPENAI_API_KEY: 'your-new-key-here'`
3. Rebuild: `npm run make`
4. Distribute new installer

### Option 2: Get a New Key
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Update in `src/config.js`
4. Rebuild the app

## Monitoring Usage

### Check Your OpenAI Usage
1. Visit: https://platform.openai.com/usage
2. View daily/monthly usage
3. Set up usage alerts (recommended!)

### Set Usage Limits
1. Go to: https://platform.openai.com/account/limits
2. Set monthly spending limit (e.g., $10/month)
3. You'll get notifications if exceeded

## Recommended Limits

For sharing with **5-10 friends:**
- **Soft Limit:** $5-10/month
- **Hard Limit:** $20/month

Typical usage per friend:
- Light use: $0.10-0.50/month
- Moderate use: $1-2/month
- Heavy use: $3-5/month

## Alternative: Give Friends Their Own Keys

If costs become an issue, you can:
1. Revert to env-based config
2. Ask each friend to get their own OpenAI key
3. They add it to their own `.env` file

**To revert:**
```javascript
// src/lib/ai.js
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
```

## Current Distribution Model

✅ **Best for:** Small groups (family, close friends)  
✅ **Pros:** Super easy for users, no setup needed  
✅ **Cons:** You pay for all usage  
✅ **Cost:** Very affordable with gpt-4o-mini ($0.10-$1 per person/month)  

---

**Monitor your usage and set limits to avoid surprises!** 💡

