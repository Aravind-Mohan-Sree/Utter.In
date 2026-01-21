export {};

interface TranslationLanguage {
  title: string;
  name: string;
}

interface GoogleTranslationConfig {
  languages: TranslationLanguage[];
  defaultLanguage: string;
}

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__: GoogleTranslationConfig;
  }
}

if (typeof window !== 'undefined') {
  window.__GOOGLE_TRANSLATION_CONFIG__ = {
    languages: [
      { title: 'English', name: 'en' },
      { title: 'Español', name: 'es' },
      { title: 'Français', name: 'fr' },
      { title: 'Deutsch', name: 'de' },
      { title: '简体中文', name: 'zh-CN' },
      { title: '日本語', name: 'ja' },
      { title: '한국어', name: 'ko' },
      { title: 'हिन्दी', name: 'hi' },
      { title: 'العربية', name: 'ar' },
      { title: 'Русский', name: 'ru' },
      { title: 'Português', name: 'pt' },
      { title: 'Italiano', name: 'it' },
      { title: 'Nederlands', name: 'nl' },
      { title: 'Türkçe', name: 'tr' },
      { title: 'Tiếng Việt', name: 'vi' },
    ],
    defaultLanguage: 'en',
  };
}
