/**
 * ClipMaster Configuration
 * 
 * This file contains hardcoded configuration including the OpenAI API key.
 * The key is embedded in the built app for easy distribution.
 * 
 * ⚠️ IMPORTANT:
 * - Your API key will be embedded in the app
 * - All users will share your API usage quota
 * - Monitor your OpenAI usage at: https://platform.openai.com/usage
 */

const CONFIG = {
  // OpenAI API Key - embedded for distribution
  OPENAI_API_KEY: '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',
  
  // App Settings
  APP_NAME: 'ClipMaster',
  APP_VERSION: '1.0.0',
  
  // AI Settings
  AI_MODEL: 'gpt-4o-mini',
  AI_MAX_TOKENS: 2000,
  AI_TEMPERATURE: 0.3,
};

export default CONFIG;

