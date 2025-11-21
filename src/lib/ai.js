import OpenAI from 'openai';
import { getApiKey, getModel } from './settings';

// Initialize OpenAI client with dynamic API key
function getOpenAIClient() {
  return new OpenAI({
    apiKey: getApiKey(),
    dangerouslyAllowBrowser: true // Required for Electron renderer process
  });
}

// Helper to build request params with correct token parameter based on model
function buildRequestParams(model, messages, maxTokens, temperature) {
  const params = {
    model,
    messages
  };

  // o1 and gpt-5 models use max_completion_tokens and don't support temperature
  if (model.includes('o1') || model.includes('gpt-5')) {
    params.max_completion_tokens = maxTokens;
    // Don't include temperature - these models only support default value
  }
  // gpt-4o models use max_completion_tokens and support temperature
  else if (model.includes('gpt-4o')) {
    params.max_completion_tokens = maxTokens;
    params.temperature = temperature;
  }
  // Older models use max_tokens and support temperature
  else {
    params.max_tokens = maxTokens;
    params.temperature = temperature;
  }

  return params;
}

/**
 * Function 1: Auto Markdown
 * Converts text to proper markdown format without changing content significantly
 */
export async function autoMarkdown(text) {
  try {
    const openai = getOpenAIClient();
    const model = getModel();
    const response = await openai.chat.completions.create(
      buildRequestParams(
        model,
        [{
          role: "system",
          content: "You are a markdown formatter. Convert the given text to proper markdown format. Keep the content exactly the same, only add markdown formatting like headers, lists, bold, italic, code blocks where appropriate. Do not change the meaning or add new content."
        }, {
          role: "user",
          content: text
        }],
        2000,
        0.3
      )
    );
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
    const openai = getOpenAIClient();
    const model = getModel();
    const response = await openai.chat.completions.create(
      buildRequestParams(
        model,
        [{
          role: "system",
          content: "You are a text summarizer. Create a concise, clear summary of the given text. Focus on key points and main ideas. Keep it brief but informative."
        }, {
          role: "user",
          content: text
        }],
        500,
        0.3
      )
    );
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
    // Extract and replace images with placeholders
    const imageMap = new Map();
    let imageCounter = 0;
    const textWithPlaceholders = text.replace(/<img[^>]*>/gi, (match) => {
      const placeholder = `[IMAGE_PLACEHOLDER_${imageCounter}]`;
      imageMap.set(placeholder, match);
      imageCounter++;
      return placeholder;
    });

    const openai = getOpenAIClient();
    const model = getModel();
    const response = await openai.chat.completions.create(
      buildRequestParams(
        model,
        [{
          role: "system",
          content: "You are a text editor. Fix grammar, spelling, and punctuation errors. Improve clarity and readability while maintaining the original meaning and tone. The input will be HTML. You MUST preserve all HTML tags, attributes, and structure exactly as they are. Only edit the text content within the tags. Do not add or remove tags. IMPORTANT: Preserve all [IMAGE_PLACEHOLDER_X] markers exactly as they appear."
        }, {
          role: "user",
          content: textWithPlaceholders
        }],
        2000,
        0.3
      )
    );

    let result = response.choices[0].message.content;

    // Restore images from placeholders
    imageMap.forEach((imgTag, placeholder) => {
      result = result.replace(placeholder, imgTag);
    });

    return {
      success: true,
      text: result
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
 * Function 4: Auto Format HTML
 * Restructures HTML content with proper headings, lists, and formatting
 */
export async function autoFormatHTML(html) {
  try {
    // Extract and replace images with placeholders
    const imageMap = new Map();
    let imageCounter = 0;
    const htmlWithPlaceholders = html.replace(/<img[^>]*>/gi, (match) => {
      const placeholder = `[IMAGE_PLACEHOLDER_${imageCounter}]`;
      imageMap.set(placeholder, match);
      imageCounter++;
      return placeholder;
    });

    const openai = getOpenAIClient();
    const model = getModel();
    const response = await openai.chat.completions.create(
      buildRequestParams(
        model,
        [{
          role: "system",
          content: "You are an HTML formatter. Restructure the given HTML content to be well-organized with proper headings (h1, h2, h3), lists (ul, ol), and emphasis (strong, em) where appropriate. Improve the document structure and readability while keeping the original meaning intact. You MUST preserve all existing HTML tags, attributes, and structure. Only reorganize and add formatting tags where they improve clarity. IMPORTANT: Preserve all [IMAGE_PLACEHOLDER_X] markers exactly as they appear. Return valid HTML."
        }, {
          role: "user",
          content: htmlWithPlaceholders
        }],
        2000,
        0.3
      )
    );

    let result = response.choices[0].message.content;

    // Restore images from placeholders
    imageMap.forEach((imgTag, placeholder) => {
      result = result.replace(placeholder, imgTag);
    });

    return {
      success: true,
      text: result
    };
  } catch (error) {
    console.error('Auto Format HTML Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to format HTML'
    };
  }
}

/**
 * Function 5: Generate Clipboard Title
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

    const openai = getOpenAIClient();
    const model = getModel();
    const response = await openai.chat.completions.create(
      buildRequestParams(
        model,
        [{
          role: "system",
          content: "You are a title generator. Create a short, descriptive title (max 60 characters) that captures the essence of the given text. The title should be clear, concise, and informative. Return ONLY the title, nothing else."
        }, {
          role: "user",
          content: text.substring(0, 500) // Only use first 500 chars for efficiency
        }],
        30,
        0.3
      )
    );

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
 * Function 6: Auto Title and Tagging
 * Generates a title and relevant tags for the content
 */
export async function autoTitleAndTags(text) {
  try {
    const openai = getOpenAIClient();
    const model = getModel();
    const params = buildRequestParams(
      model,
      [{
        role: "system",
        content: "You are a content analyzer. Generate a concise, descriptive title (max 60 characters) and 3-5 relevant tags for the given text. Return ONLY a JSON object with 'title' (string) and 'tags' (array of strings). Example: {\"title\": \"My Title\", \"tags\": [\"tag1\", \"tag2\"]}"
      }, {
        role: "user",
        content: text
      }],
      200,
      0.3
    );

    // Only add response_format for models that support it (not o1 or gpt-5)
    if (!model.includes('o1') && !model.includes('gpt-5')) {
      params.response_format = { type: "json_object" };
    }

    const response = await openai.chat.completions.create(params);
    const content = response.choices[0].message.content.trim();

    // Try to parse JSON, handle markdown code blocks if present
    let jsonStr = content;
    if (content.startsWith('```')) {
      // Extract JSON from markdown code block
      const match = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) {
        jsonStr = match[1].trim();
      }
    }

    const result = JSON.parse(jsonStr);
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

