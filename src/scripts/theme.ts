type Theme = 'light' | 'dark';

interface ThemeManager {
    currentTheme: Theme;
    toggle(): void;
    setTheme(theme: Theme): void;
}

class ThemeController implements ThemeManager {
    private readonly htmlElement: HTMLElement;
    private readonly themeSwitch: HTMLInputElement | null;
    private readonly mediaQuery: MediaQueryList;
    private isTransitioning: boolean = false;
    
    constructor() {
        this.htmlElement = document.documentElement;
        this.themeSwitch = document.getElementById('themeSwitch') as HTMLInputElement;
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.initialize();
    }

    get currentTheme(): Theme {
        return this.htmlElement.getAttribute('data-theme') as Theme || 'light';
    }

    private initialize(): void {
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') as Theme;
        const systemTheme: Theme = this.mediaQuery.matches ? 'dark' : 'light';
        this.setTheme(savedTheme || systemTheme);

        // Set up event listeners
        if (this.themeSwitch) {
            this.themeSwitch.checked = this.currentTheme === 'dark';
            this.themeSwitch.addEventListener('change', this.toggle.bind(this));
        }

        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                const newTheme: Theme = e.matches ? 'dark' : 'light';
                this.setTheme(newTheme);
            }
        });

        // Remove no-transitions class after a small delay to prevent initial transition
        setTimeout(() => {
            document.body.classList.remove('no-transitions');
        }, 50);
    }

    public toggle(): void {
        if (this.isTransitioning) return;
        
        const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    public setTheme(theme: Theme): void {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Add transition class
        document.body.classList.add('theme-transitioning');
        
        // Set the new theme
        this.htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (this.themeSwitch) {
            this.themeSwitch.checked = theme === 'dark';
        }

        // Remove transition class after animation completes
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
            this.isTransitioning = false;
        }, 200); // Match this with --theme-transition-duration
    }
}

class NavigationController {
    private readonly menuButton: HTMLElement | null;
    private readonly navMenu: HTMLElement | null;
    private readonly navLinks: NodeListOf<HTMLElement>;

    constructor() {
        this.menuButton = document.querySelector('.menu-button');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.initialize();
    }

    private initialize(): void {
        if (!this.menuButton || !this.navMenu) return;

        // Toggle menu
        this.menuButton.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking outside
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Handle escape key
        document.addEventListener('keydown', this.handleKeyPress.bind(this));

        // Add keyboard navigation for menu items
        this.navLinks.forEach(link => {
            link.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    link.click();
                }
            });
        });
    }

    private toggleMenu(force?: boolean): void {
        const isExpanded = force ?? this.menuButton?.getAttribute('aria-expanded') !== 'true';
        this.menuButton?.setAttribute('aria-expanded', String(isExpanded));
        this.navMenu?.classList.toggle('show', isExpanded);
    }

    private handleOutsideClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-button') && !target.closest('.nav-menu')) {
            this.toggleMenu(false);
        }
    }

    private handleKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Escape' && this.navMenu?.classList.contains('show')) {
            this.toggleMenu(false);
            this.menuButton?.focus();
        }
    }
}

// Only initialize if we're in the browser
if (typeof window !== 'undefined') {
    // Initialize theme as early as possible to prevent flash
    new ThemeController();

    // Initialize navigation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new NavigationController();
        });
    } else {
        new NavigationController();
    }
}
