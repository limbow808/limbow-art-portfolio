// Theme toggle functionality
console.log('theme.js loaded');

(function() {
  const HTML = document.documentElement;
  const STORAGE_KEY = 'limbow-theme';

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

    console.log('Setting theme to:', theme);
    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Apply transform to the icon container
    const iconContainer = document.querySelector('.theme-toggle__icon');
    console.log('Icon container found:', iconContainer);
    if (iconContainer) {
      if (theme === THEMES.dark) {
        iconContainer.style.transform = 'rotate(180deg)';
        console.log('Applied 180deg rotation');
      } else {
        iconContainer.style.transform = 'rotate(0deg)';
        console.log('Applied 0deg rotation');
      }
    } else {
      console.warn('Icon container not found!');
    }
  }

  // Toggle theme
  function toggleTheme() {
    console.log('toggleTheme called');
    const currentTheme = HTML.getAttribute('data-theme') || getPreferredTheme();
    console.log('Current theme:', currentTheme);
    const newTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
    console.log('New theme:', newTheme);
    setTheme(newTheme);
  }

  // Initialize theme on page load
  function init() {
    console.log('Theme init starting...');
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    console.log('Theme initialized:', preferredTheme);

    // Use setTimeout to ensure DOM is really ready
    setTimeout(function() {
      const THEME_TOGGLE_BTN = document.getElementById('theme-toggle-btn');
      console.log('Button element found:', !!THEME_TOGGLE_BTN);

      if (THEME_TOGGLE_BTN) {
        THEME_TOGGLE_BTN.addEventListener('click', function(e) {
          console.log('Button clicked!');
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        });
        console.log('Click listener attached');
      } else {
        console.warn('Theme toggle button not found!');
      }
    }, 100);

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
    console.log('Document still loading, attaching DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('Document already ready, running init immediately');
    init();
  }
})();

console.log('theme.js execution complete');
