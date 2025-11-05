# AI Features Setup Guide

## 🎉 What's New

Your ClipMaster app now has **4 powerful AI features**:

1. **🔤 Auto Markdown** - Converts text to proper markdown format
2. **📝 Summarize** - Creates a quick summary (temporary view)
3. **✨ Fix & Clear** - Improves grammar and clarity
4. **🏷️ Auto Title & Tags** - Generates smart titles and tags

## 🚀 Setup Instructions

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy your API key (starts with `sk-...`)

### Step 2: Add API Key to Your App

1. Open the `.env` file in your project root
2. Replace `your-openai-api-key-here` with your actual API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Save the file

### Step 3: Restart the App

Stop and restart your app for the changes to take effect:

```bash
npm start
```

## 💰 Cost Estimate

Using **GPT-4o Mini** (cheapest model):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Example costs:**
- Processing 1000 notes (~500 words each): ~$0.10 total
- Single note operations: ~$0.0001 each (basically free!)

## 🎯 How to Use

1. **Create or open a note** with some content
2. **Look for the AI Tools toolbar** below the tags section
3. **Click any AI button:**
   - **Auto Markdown**: Formats your text with markdown
   - **Summarize**: Shows a temporary summary above the editor
   - **Fix & Clear**: Improves and cleans up your text
   - **Auto Title & Tags**: Generates title and tags automatically

## 🔧 Features

- ✅ Buttons are **disabled** when there's no content
- ✅ **Processing indicator** shows when AI is working
- ✅ **Error messages** display if something goes wrong
- ✅ **Summary view** appears above editor (dismissable)
- ✅ Changes trigger **save button** automatically

## 🛠️ Troubleshooting

### "Failed to ..." error message

1. Check your `.env` file has the correct API key
2. Make sure you restarted the app after adding the key
3. Verify your OpenAI account has billing enabled
4. Check your API key hasn't expired

### Buttons are disabled

- Make sure you have content in the note editor
- The buttons require at least some text to work

### API key not working

1. Make sure there are no extra spaces in the `.env` file
2. The key should start with `sk-`
3. Try regenerating a new API key from OpenAI

## 📊 Model Information

This app uses **GPT-4o Mini** for optimal cost-effectiveness:
- Fast responses (usually < 2 seconds)
- High quality for note-taking tasks
- Extremely affordable
- Perfect for summarization, formatting, and basic text improvements

---

**Enjoy your AI-powered note-taking! 🚀**

