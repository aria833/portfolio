(() => {
  "use strict";

  const root = document.documentElement;

  // 桌面版與手機版主題控制
  const themeButton = document.getElementById("themeToggle");
  const mobileThemeButton = document.getElementById("mobileThemeToggle");

  // 手機版主題選擇器
  const mobileThemeCurrent = document.getElementById("mobileThemeCurrent");

  /**
   * 取得目前語系字典
   */
  function getCurrentDictionary() {
    return (
      window.CarrotLabI18n?.getDictionaries?.()[
        window.CarrotLabI18n?.getLanguage?.()
      ] || {}
    );
  }

  /**
   * 取得目前主題的翻譯
   */
  function getThemeLabel(theme) {
    const dictionary = getCurrentDictionary();

    const key = theme === "dark" ? "theme.dark" : "theme.light";

    return dictionary[key] || (theme === "dark" ? "深色模式" : "淺色模式");
  }

  const savedTheme = localStorage.getItem("carrotlab-theme");

  const preferredDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  /**

* 套用網站主題
    */
  /**
   * 依照網站目前的主題切換作品圖片
   *
   * data-light-src：淺色模式圖片
   * data-dark-src：深色模式圖片
   */
  function updateThemeImages(theme) {
    document.querySelectorAll(".theme-switch-image").forEach((img) => {
      const lightSrc = img.dataset.lightSrc;
      const darkSrc = img.dataset.darkSrc;

      // 沒有設定完整圖片路徑時，不執行切換
      if (!lightSrc || !darkSrc) return;

      // 依照目前主題選擇圖片
      const nextSrc = theme === "dark" ? darkSrc : lightSrc;

      // 圖片路徑相同時，不重複更新
      if (img.getAttribute("src") !== nextSrc) {
        img.setAttribute("src", nextSrc);
      }
    });
  }

  /**
   * 依照網站語系切換作品圖片
   *
   * 支援類型：
   * page：相冊內頁
   * edit：編輯畫面
   * select：選取明信片
   * preview：預覽相冊
   */
  function updateLanguageImages() {
    // 取得目前網站語系
    const language = window.CarrotLabI18n?.getLanguage?.() || "zh-TW";

    // 圖片類型與各語系檔案的對照表
    const imageMap = {
      page: {
        "zh-TW": "page_tw.png",
        en: "page_en.png",
        ja: "page_jp.png",
      },
      edit: {
        "zh-TW": "edit_tw.png",
        en: "edit_en.png",
        ja: "edit_jp.png",
      },
      select: {
        "zh-TW": "select_tw.png",
        en: "select_en.png",
        ja: "select_jp.png",
      },
      preview: {
        "zh-TW": "preview_tw.png",
        en: "preview_en.png",
        ja: "preview_jp.png",
      },
    };

    // 更新所有需要切換語系的圖片
    document.querySelectorAll("[data-language-image]").forEach((img) => {
      // 讀取圖片類型，未指定時預設為 page
      const imageType = img.dataset.languageImageType || "page";

      // 取得該類型的圖片設定
      const languageImages = imageMap[imageType];

      // 未設定的圖片類型不處理
      if (!languageImages) return;

      // 找出目前語系對應的圖片
      const imageName = languageImages[language] || languageImages["zh-TW"];

      // 取得 Hexo 產生的圖片目錄路徑
      const imageBase = img.dataset.imageBase;

      // 缺少圖片路徑時不處理
      if (!imageBase) return;

      // 組合完整圖片路徑
      const imageUrl = `${imageBase}${imageName}`;

      // 圖片路徑不同時才更新
      if (img.getAttribute("src") !== imageUrl) {
        img.setAttribute("src", imageUrl);
      }
    });
  }
  /**
   * Bloom Memories：切換相冊明信片的語系
   *
   * 封面與封底共用同一張圖片。
   * 只有 21 張明信片會依照網站語系切換。
   */
  function updateBloomAlbumImages() {
    const language = window.CarrotLabI18n?.getLanguage?.() || "zh-TW";

    // 網站語系與圖片檔名後綴的對照
    const languageSuffix = {
      "zh-TW": "tw",
      en: "en",
      ja: "jp",
    };

    // 各語系的圖片替代文字
    const altText = {
      "zh-TW": "日本旅行明信片",
      en: "Japan travel postcard",
      ja: "日本旅行のポストカード",
    };

    const suffix = languageSuffix[language] || "tw";
    const description = altText[language] || altText["zh-TW"];

    // 取得相冊中的 21 張明信片
    const postcards = document.querySelectorAll(
      "#bloomAlbumCarousel [data-bloom-postcard]",
    );

    postcards.forEach((img) => {
      const postcardNumber = img.dataset.bloomPostcard;

      // 從目前圖片路徑取得目錄
      const imageBase = img.src.substring(0, img.src.lastIndexOf("/") + 1);

      const imageUrl = `${imageBase}japan_${postcardNumber}_${suffix}.png`;

      // 只有路徑不同時才更新圖片
      if (img.getAttribute("src") !== imageUrl) {
        img.setAttribute("src", imageUrl);
      }

      // 同步更新無障礙替代文字
      img.alt = `${description} ${postcardNumber}`;
    });
  }

  /**
   * 套用網站主題
   */

  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);

    // 同步切換作品圖片
    updateThemeImages(theme);

    // 更新桌面版檯燈按鈕的無障礙狀態
    themeButton?.setAttribute("aria-pressed", String(theme === "dark"));

    // 更新舊版手機主題按鈕（若仍存在）
    if (mobileThemeButton) {
      mobileThemeButton.innerHTML =
        theme === "dark"
          ? '<i class="bi bi-sun"></i>'
          : '<i class="bi bi-moon-stars"></i>';

      mobileThemeButton.setAttribute("aria-pressed", String(theme === "dark"));
    }

    // 更新手機版主題選擇器文字
    if (mobileThemeCurrent) {
      mobileThemeCurrent.textContent = getThemeLabel(theme);

      mobileThemeCurrent.setAttribute(
        "aria-label",
        getCurrentDictionary()["theme.choose"] || "選擇顯示模式",
      );
    }

    // 更新手機版主題選單的選取狀態
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const isActive = button.dataset.themeChoice === theme;

      button.classList.toggle("active", isActive);

      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  /**

* 初始化主題
    */
  const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : preferredDark
        ? "dark"
        : "light";

  applyTheme(initialTheme);
  updateLanguageImages();
  updateBloomAlbumImages();

  /**

* 播放桌面版貓掌檯燈拉繩動畫
    */
  function playLampAnimation() {
    const pullChainGroup = document.getElementById("pullChainGroup");

    if (!pullChainGroup) return;
    pullChainGroup.classList.remove("pulled");
    // 讓動畫可以重複播放
    void pullChainGroup.getBoundingClientRect();
    pullChainGroup.classList.add("pulled");
    window.setTimeout(() => {
      pullChainGroup.classList.remove("pulled");
    }, 220);
  }

  /**

* 設定網站主題
    */
  function setTheme(theme, animate = false) {
    if (theme !== "light" && theme !== "dark") return;

    if (animate) {
      playLampAnimation();
    }
    applyTheme(theme);
    localStorage.setItem("carrotlab-theme", theme);
  }

  /**

* 切換至另一個主題
    */
  function toggleTheme() {
    const currentTheme = root.getAttribute("data-bs-theme");

    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  }

  /**

* 桌面版與舊版手機主題按鈕
    */
  themeButton?.addEventListener("click", toggleTheme);
  mobileThemeButton?.addEventListener("click", toggleTheme);

  /**

* 手機版主題選擇器：左右切換
    */
  document.querySelectorAll("[data-theme-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-bs-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      const step = Number(button.dataset.themeStep);

      animateThemeLabel(nextTheme, step);
    });
  });

  /**

* 手機版主題選擇器：直接選擇
    */
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeChoice);
    });
  });

  /**

* 高亮目前所在的導覽列項目
    */
  const pathname = window.location.pathname.replace(/\/+/g, "/");

  const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;

  let activeNav = "";

  if (normalizedPath === "/") {
    activeNav = "home";
  } else if (normalizedPath.startsWith("/projects/")) {
    activeNav = "projects";
  } else if (normalizedPath.startsWith("/about/")) {
    activeNav = "about";
  } else if (
    normalizedPath.startsWith("/blog/") ||
    normalizedPath.startsWith("/tags/") ||
    normalizedPath.startsWith("/categories/") ||
    /^\/\d{4}\/\d{2}\/\d{2}\//.test(normalizedPath)
  ) {
    activeNav = "notes";
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    const isActive = link.dataset.nav === activeNav;

    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  // 語系變更時，同步更新主題文字與所有語系圖片
  document.addEventListener("languageChanged", () => {
    const currentTheme = root.getAttribute("data-bs-theme");

    // 更新主題相關文字
    applyTheme(currentTheme);

    // 更新一般作品介紹圖片
    updateLanguageImages();

    // 更新 Bloom Memories 明信片圖片
    updateBloomAlbumImages();
  });
  /**

* 手機版主題選擇器動畫
    */
  function animateThemeLabel(nextTheme, step = 1) {
    if (!mobileThemeCurrent) return;

    const currentTheme = root.getAttribute("data-bs-theme");

    if (currentTheme === nextTheme) return;

    // 設定動畫方向
    mobileThemeCurrent.style.setProperty(
      "–choice-exit-x",
      step > 0 ? "-8px" : "8px",
    );

    mobileThemeCurrent.style.setProperty(
      "–choice-enter-x",
      step > 0 ? "8px" : "-8px",
    );

    mobileThemeCurrent.classList.add("is-changing");

    window.setTimeout(() => {
      setTheme(nextTheme);

      mobileThemeCurrent.classList.remove("is-changing");
      // 強制重新計算，確保動畫可以重播
      void mobileThemeCurrent.offsetWidth;
      mobileThemeCurrent.classList.add("is-entering");
    }, 120);

    window.setTimeout(() => {
      mobileThemeCurrent.classList.remove("is-entering");
    }, 360);
  }
})();

/**

* 手機版「依主題探索」展開與收合圖示
    */
document.addEventListener("DOMContentLoaded", () => {
  const topicCloud = document.getElementById("mobileTopicCloud");
  const topicToggle = document.querySelector(".topic-explorer-toggle");
  const topicIcon = document.querySelector(".topic-explorer-icon");

  if (!topicCloud || !topicToggle || !topicIcon) {
    return;
  }

  topicCloud.addEventListener("shown.bs.collapse", () => {
    topicIcon.classList.remove("bi-plus-lg");
    topicIcon.classList.add("bi-dash-lg");
  });

  topicCloud.addEventListener("hidden.bs.collapse", () => {
    topicIcon.classList.remove("bi-dash-lg");
    topicIcon.classList.add("bi-plus-lg");
  });
});
