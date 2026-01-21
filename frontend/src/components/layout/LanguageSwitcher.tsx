'use client';
import { useEffect, useState, useRef } from 'react';
import { parseCookies, setCookie } from 'nookies';
import { FaChevronDown } from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';

const COOKIE_NAME = 'googtrans';

interface LanguageDescriptor {
  name: string;
  title: string;
}

interface GoogleTranslationConfig {
  languages: LanguageDescriptor[];
  defaultLanguage: string;
}

interface GoogleTranslateElement {
  new (options: object, elementId: string): void;
  InlineLayout: {
    SIMPLE: number;
    HORIZONTAL: number;
    VERTICAL: number;
  };
}

declare global {
  var __GOOGLE_TRANSLATION_CONFIG__: GoogleTranslationConfig | undefined;
  var google: {
    translate?: {
      TranslateElement?: GoogleTranslateElement;
    };
  };
}

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>();
  const [languageConfig, setLanguageConfig] =
    useState<GoogleTranslationConfig>();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (() => {
      const cookies = parseCookies();
      const existingLanguageCookieValue = cookies[COOKIE_NAME];
      let languageValue: string | undefined;

      if (existingLanguageCookieValue) {
        const sp = existingLanguageCookieValue.split('/');
        if (sp.length > 2) {
          languageValue = sp[2];
        }
      }

      if (globalThis.__GOOGLE_TRANSLATION_CONFIG__) {
        if (!languageValue) {
          languageValue =
            globalThis.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
        }
        setLanguageConfig(globalThis.__GOOGLE_TRANSLATION_CONFIG__);
      }

      if (languageValue) {
        setCurrentLanguage(languageValue);
      }

      const checkGoogleTranslate = () => {
        if (typeof window !== 'undefined' && window.google?.translate) {
          const currentCookies = parseCookies();
          const cookieValue = currentCookies[COOKIE_NAME];
          if (cookieValue) {
            const sp = cookieValue.split('/');
            if (sp.length > 2) {
              const lang = sp[2];
              setTimeout(() => {
                const select = document.querySelector(
                  '.goog-te-combo',
                ) as HTMLSelectElement;
                if (select && select.value !== lang) {
                  select.value = lang;
                }
              }, 500);
            }
          }
        }
      };

      checkGoogleTranslate();
      const t1 = setTimeout(checkGoogleTranslate, 500);
      const t2 = setTimeout(checkGoogleTranslate, 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('languageChanging') === 'true') {
      sessionStorage.removeItem('languageChanging');
      const savedScroll = sessionStorage.getItem('scrollPosition');
      if (savedScroll) {
        sessionStorage.removeItem('scrollPosition');
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
      }
    }
  }, []);

  useEffect(() => {
    if (currentLanguage && typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  if (!currentLanguage || !languageConfig) return null;

  const currentLangName =
    languageConfig.languages.find((ld) => ld.name === currentLanguage)?.name ||
    languageConfig.languages[0].name;

  const switchLanguage = (lang: string) => {
    const cookieValue = `/auto/${lang}`;
    setCookie(null, COOKIE_NAME, cookieValue, { path: '/' });
    setCurrentLanguage(lang);
    setIsOpen(false);

    const scrollPosition = window.scrollY || window.pageYOffset;

    const tryProgrammaticTrigger = () => {
      let triggered = false;
      const triggerSelectElement = (select: HTMLSelectElement) => {
        if (!select) return false;
        if (select.value !== lang) {
          select.value = lang;
          const events = [
            new Event('change', { bubbles: true, cancelable: true }),
            new Event('input', { bubbles: true, cancelable: true }),
          ];
          events.forEach((event) => select.dispatchEvent(event));
          return true;
        }
        return false;
      };

      const selectors = [
        '.goog-te-combo',
        'select.goog-te-combo',
        '#google_translate_element select',
      ];
      for (const selector of selectors) {
        const select = document.querySelector(selector) as HTMLSelectElement;
        if (select && triggerSelectElement(select)) {
          triggered = true;
          break;
        }
      }

      if (!triggered) {
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of Array.from(iframes)) {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              for (const selector of selectors) {
                const iframeSelect = iframeDoc.querySelector(
                  selector,
                ) as HTMLSelectElement;
                if (iframeSelect && triggerSelectElement(iframeSelect)) {
                  triggered = true;
                  break;
                }
              }
            }
          } catch {
            try {
              iframe.contentWindow?.postMessage(
                { type: 'changeLanguage', lang },
                '*',
              );
            } catch {
              /* empty */
            }
          }
          if (triggered) break;
        }
      }
      return triggered;
    };

    const immediateSuccess = tryProgrammaticTrigger();

    if (!immediateSuccess) {
      const checkInterval = setInterval(() => {
        if (tryProgrammaticTrigger()) {
          clearInterval(checkInterval);
          setTimeout(() => window.scrollTo(0, scrollPosition), 100);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
        sessionStorage.setItem('languageChanging', 'true');
        window.location.reload();
      }, 1000);
    } else {
      setTimeout(() => window.scrollTo(0, scrollPosition), 100);
    }
  };

  return (
    <div className="notranslate relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-gray-600 hover:text-rose-400 transition-colors cursor-pointer"
      >
        <IoLanguage className="text-xl" />
        <span className="text-xs font-semibold">
          {currentLangName.toUpperCase()}
        </span>
        <FaChevronDown
          className={`text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px] max-h-64 overflow-y-auto">
          <div className="py-1">
            {languageConfig.languages.map((ld) => (
              <button
                key={ld.name}
                onClick={() => switchLanguage(ld.name)}
                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                  currentLanguage === ld.name
                    ? 'bg-rose-50 text-rose-400'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-rose-400'
                }`}
              >
                {ld.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { LanguageSwitcher, COOKIE_NAME };
