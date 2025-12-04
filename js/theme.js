/**
 * Theme Switcher Logic
 * Handles light/dark mode toggling and persistence
 */

(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Get theme preference from localStorage, default to 'dark'
        function getThemePreference() {
            const saved = localStorage.getItem('theme-preference');
            return saved === 'light' ? 'light' : 'dark';
        }

        function applyTheme(theme) {
            if (theme === 'light') {
                document.documentElement.classList.add('theme-light');
            } else {
                document.documentElement.classList.remove('theme-light');
            }
            updateToggleIcon(theme);
        }

        function updateToggleIcon(theme) {
            const toggleBtn = document.getElementById('themeToggle');
            if (!toggleBtn) return;
            
            const sunIcon = toggleBtn.querySelector('.sun-icon');
            const moonIcon = toggleBtn.querySelector('.moon-icon');
            
            if (!sunIcon || !moonIcon) return;

            if (theme === 'light') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }

        // Toggle theme manually
        window.toggleTheme = function() {
            const currentTheme = document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme-preference', newTheme);
            applyTheme(newTheme);
        };

        // Set initial theme
        const initialTheme = getThemePreference();
        applyTheme(initialTheme);
    });
    
    // Apply theme immediately to prevent flash (optional, if script is in head)
    const saved = localStorage.getItem('theme-preference');
    if (saved === 'light') {
        document.documentElement.classList.add('theme-light');
    }
})();
