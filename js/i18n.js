(() => {
  "use strict";

  const STORAGE_KEY = "carrotlab-language";
  const DEFAULT_LANGUAGE = "zh-TW";

  const LANGUAGE_SETTINGS = {
    "zh-TW": {
      htmlLang: "zh-Hant",
    },
    en: {
      htmlLang: "en",
    },
    ja: {
      htmlLang: "ja",
    },
  };

  /**
   * 語系切換順序
   */
  const LANGUAGE_ORDER = ["zh-TW", "en", "ja"];

  // 取得已載入的翻譯字典
  const dictionaries = window.CarrotLabDictionaries || {};

  /**
   * 取得目前使用的語言
   */
  function getLanguage() {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);

    if (savedLanguage && dictionaries[savedLanguage]) {
      return savedLanguage;
    }

    if (dictionaries[DEFAULT_LANGUAGE]) {
      return DEFAULT_LANGUAGE;
    }

    return Object.keys(dictionaries)[0] || DEFAULT_LANGUAGE;
  }

  /**

* 更新語系選擇器的顯示狀態
    */
  function updateLanguageSwitcher(lang) {
    const dictionary = dictionaries[lang];

    if (!dictionary) return;

    // 更新手機版中央按鈕
    const currentButton = document.getElementById("mobileLanguageCurrent");

    if (currentButton) {
      const languageNames = {
        "zh-TW": dictionary["language.zhTW"] || "繁體中文",
        en: dictionary["language.en"] || "English",
        ja: dictionary["language.ja"] || "日本語",
      };

      currentButton.textContent = languageNames[lang];
    }

    // 更新桌面版與手機版所有語系選項
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === lang;

      button.classList.toggle("active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  /**

* 取得下一個語系
    */
  function getNextLanguage(currentLanguage, step) {
    const currentIndex = LANGUAGE_ORDER.indexOf(currentLanguage);

    if (currentIndex === -1) {
      return LANGUAGE_ORDER[0];
    }

    const nextIndex =
      (currentIndex + step + LANGUAGE_ORDER.length) % LANGUAGE_ORDER.length;

    return LANGUAGE_ORDER[nextIndex];
  }

  /**

* 初始化手機版語系左右箭頭
    */
  /**

* 手機版語言切換動畫
    */
  function initMobileLanguageArrows() {
    document.querySelectorAll("[data-language-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const currentLanguage = getLanguage();
        const step = Number(button.dataset.languageStep);
        const nextLanguage = getNextLanguage(currentLanguage, step);
        if (!dictionaries[nextLanguage] || nextLanguage === currentLanguage) {
          return;
        }
        const currentButton = document.getElementById("mobileLanguageCurrent");
        if (!currentButton) {
          applyTranslations(nextLanguage);
          return;
        }
        // 設定動畫方向
        currentButton.style.setProperty(
          "–choice-exit-x",
          step > 0 ? "-8px" : "8px",
        );
        currentButton.style.setProperty(
          "–choice-enter-x",
          step > 0 ? "8px" : "-8px",
        );
        // 先讓舊文字淡出
        currentButton.classList.add("is-changing");
        window.setTimeout(() => {
          applyTranslations(nextLanguage);

          // 讓瀏覽器先完成文字更新
          currentButton.classList.remove("is-changing");
          // 重新觸發進場動畫
          void currentButton.offsetWidth;
          currentButton.classList.add("is-entering");
        }, 120);
        // 動畫結束後清除狀態
        window.setTimeout(() => {
          currentButton.classList.remove("is-entering");
        }, 360);
      });
    });
  }
  /**
   * 更新頁面上的翻譯
   */
  function applyTranslations(lang) {
    const dictionary = dictionaries[lang];

    if (!dictionary) {
      console.warn(`找不到語系字典：${lang}`);
      return;
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const translation = dictionary[key];

      if (translation === undefined) {
        return;
      }

      // 以 data-i18n-html 明確標示允許 HTML 的翻譯
      if (element.hasAttribute("data-i18n-html")) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
    });

    // 翻譯無障礙標籤等 HTML 屬性（例如 aria-label）
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      const translation = dictionary[key];

      if (translation !== undefined) {
        element.setAttribute("aria-label", translation);
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.dataset.i18nTitle;
      const translation = dictionary[key];

      if (translation !== undefined) {
        element.setAttribute("title", translation);
      }
    });

    // 更新 HTML 語言
    document.documentElement.lang = LANGUAGE_SETTINGS[lang]?.htmlLang || lang;

    // 儲存使用者的語言偏好
    localStorage.setItem(STORAGE_KEY, lang);

    // 更新語系選擇器
    updateLanguageSwitcher(lang);

    // 通知其他功能：語言已切換
    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: lang },
      }),
    );
  }

  /**
   * 綁定語言切換按鈕
   */
  function initLanguageSwitcher() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const lang = button.dataset.lang;

        if (!dictionaries[lang]) {
          console.warn(`找不到語系字典：${lang}`);
          return;
        }

        applyTranslations(lang);
      });
    });

    // 初始化手機版左右箭頭
    initMobileLanguageArrows();
  }

  /**
   * 初始化語系
   */
  function init() {
    const initialLanguage = getLanguage();

    if (!dictionaries[initialLanguage]) {
      console.warn("尚未載入任何可用的語系字典。");
      return;
    }

    initLanguageSwitcher();
    applyTranslations(initialLanguage);
  }

  // 提供其他 JavaScript 使用的介面
  window.CarrotLabI18n = {
    getLanguage,
    setLanguage: applyTranslations,
    getDictionaries: () => dictionaries,
  };

  // 確保 DOM 已建立，再更新翻譯
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
