export {};

declare global {
  interface TranslationLanguage {
    title: string;
    name: string;
  }

  interface GoogleTranslationConfig {
    languages: TranslationLanguage[];
    defaultLanguage: string;
  }

  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__: GoogleTranslationConfig;

    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
          },
          elementId?: string,
        ) => void;
      };
    };

    googleTranslateElementInit?: () => void;
  }
}
