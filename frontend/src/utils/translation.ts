export {};

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

function TranslateInit(): void {
  if (
    typeof window === 'undefined' ||
    !window.__GOOGLE_TRANSLATION_CONFIG__ ||
    !window.google?.translate?.TranslateElement
  ) {
    return;
  }

  new window.google.translate.TranslateElement({
    pageLanguage: window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage,
    includedLanguages: window.__GOOGLE_TRANSLATION_CONFIG__.languages
      .map((l) => l.name)
      .join(','),
    autoDisplay: false,
  });
}

export default TranslateInit;
