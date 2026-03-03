// Theme toggle functionality
(function() {
  const HTML = document.documentElement;
  const STORAGE_KEY = 'limbow-theme';
  const THEME_TOGGLE = document.getElementById('theme-toggle-input');

  // Allowed themes
  const THEMES = {
    light: 'light',
    dark: 'dark'
  };

  // Get preferred theme from system or local storage
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.dark;
    }

    return THEMES.light;
  }

  // Set theme
  function setTheme(theme) {
    if (!Object.values(THEMES).includes(theme)) {
      return;
    }

    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update checkbox state
    if (THEME_TOGGLE) {
      THEME_TOGGLE.checked = theme === THEMES.dark;
    }
  }

  // Initialize theme on page load
  function init() {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);

    // Add toggle listener
    if (THEME_TOGGLE) {
      THEME_TOGGLE.addEventListener('change', function() {
        const newTheme = this.checked ? THEMES.dark : THEMES.light;
        setTheme(newTheme);
      });
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', function(e) {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? THEMES.dark : THEMES.light);
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
