import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Required for Electron renderer process
});

/**
 * Function 1: Auto Markdown
 * Converts text to proper markdown format without changing content significantly
 */
export async function autoMarkdown(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a markdown formatter. Convert the given text to proper markdown format. Keep the content exactly the same, only add markdown formatting like headers, lists, bold, italic, code blocks where appropriate. Do not change the meaning or add new content."
      }, {
        role: "user",
        content: text
      }],
      max_tokens: 2000,
      temperature: 0.3
    });
    return {
      success: true,
      text: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Auto Markdown Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to format as markdown'
    };
  }
}

/**
 * Function 2: Summarize Text
 * Creates a concise summary for temporary view
 */
export async function summarizeText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a text summarizer. Create a concise, clear summary of the given text. Focus on key points and main ideas. Keep it brief but informative."
      }, {
        role: "user",
        content: text
      }],
      max_tokens: 500,
      temperature: 0.3
    });
    return {
      success: true,
      text: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Summarize Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to summarize text'
    };
  }
}

/**
 * Function 3: Fix and Clear Up Text
 * Improves grammar, clarity, and readability
 */
export async function fixAndClearText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a text editor. Fix grammar, spelling, and punctuation errors. Improve clarity and readability while maintaining the original meaning and tone. Keep the same structure and don't change the content significantly."
      }, {
        role: "user",
        content: text
      }],
      max_tokens: 2000,
      temperature: 0.3
    });
    return {
      success: true,
      text: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Fix Text Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fix text'
    };
  }
}

/**
 * Function 4: Generate Clipboard Title
 * Creates a short, descriptive title for clipboard content
 */
export async function generateClipboardTitle(text) {
  try {
    // Don't generate title for very short text
    if (text.length < 20) {
      return {
        success: true,
        title: text.substring(0, 50)
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a title generator. Create a short, descriptive title (max 60 characters) that captures the essence of the given text. The title should be clear, concise, and informative. Return ONLY the title, nothing else."
      }, {
        role: "user",
        content: text.substring(0, 500) // Only use first 500 chars for efficiency
      }],
      max_tokens: 30,
      temperature: 0.3
    });
    
    return {
      success: true,
      title: response.choices[0].message.content.trim().replace(/^["']|["']$/g, '') // Remove quotes if present
    };
  } catch (error) {
    console.error('Generate Title Error:', error);
    // Fallback to first line or truncated text
    const fallbackTitle = text.split('\n')[0].substring(0, 60).trim();
    return {
      success: true,
      title: fallbackTitle || 'Clipboard Item'
    };
  }
}

/**
 * Function 5: Auto Title and Tagging
 * Generates a title and relevant tags for the content
 */
export async function autoTitleAndTags(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a content analyzer. Generate a concise, descriptive title (max 60 characters) and 3-5 relevant tags for the given text. Return ONLY a JSON object with 'title' (string) and 'tags' (array of strings). No additional text or explanation."
      }, {
        role: "user",
        content: text
      }],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return {
      success: true,
      title: result.title || 'Untitled',
      tags: result.tags || []
    };
  } catch (error) {
    console.error('Auto Title/Tags Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate title and tags'
    };
  }
}

