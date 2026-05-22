/**
 * Configuration Loader Module
 * Handles loading and parsing of YAML/JSON configuration files
 * Includes caching mechanism with configurable TTL and cache version
 */

const ConfigLoader = {
    config: null,
    
    // Cache settings
    CACHE_PREFIX: 'portfolio_cache_',
    CACHE_TTL: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    
    /**
     * Load configuration from YAML or JSON file
     * @returns {Promise<Object>} Parsed configuration object
     */
    async load() {
        if (this.config) {
            return this.config;
        }
        
        // Try YAML first, then JSON
        try {
            const response = await fetch('config/content.yml');
            if (response.ok) {
                const yamlText = await response.text();
                this.config = jsyaml.load(yamlText);
                console.log('Loaded configuration from YAML');
                this.validateCache();
                return this.config;
            }
        } catch (e) {
            console.log('YAML not found, trying JSON...');
        }
        
        // Fallback to JSON
        try {
            const response = await fetch('config/content.json');
            if (response.ok) {
                this.config = await response.json();
                console.log('Loaded configuration from JSON');
                this.validateCache();
                return this.config;
            }
        } catch (e) {
            console.error('Failed to load JSON configuration');
        }
        
        throw new Error('No configuration file found. Please create config/content.yml or config/content.json');
    },
    
    /**
     * Validate cache against cache_version in config
     * Clears cache if version mismatch
     */
    validateCache() {
        const configVersion = this.getCacheVersion();
        const storedVersion = localStorage.getItem(this.CACHE_PREFIX + 'version');
        
        if (storedVersion !== null && String(storedVersion) !== String(configVersion)) {
            console.log(`Cache version mismatch (stored: ${storedVersion}, config: ${configVersion}). Clearing cache.`);
            this.clearAllCache();
        }
        
        // Store current version
        localStorage.setItem(this.CACHE_PREFIX + 'version', String(configVersion));
    },
    
    /**
     * Get cache version from config
     * @returns {number|string} Cache version
     */
    getCacheVersion() {
        return this.config?.site?.cache_version ?? 1;
    },
    
    /**
     * Check if caching is enabled
     * @returns {boolean}
     */
    isCacheEnabled() {
        return this.config?.site?.cache_version !== 0;
    },
    
    /**
     * Set item to cache with TTL
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    setCache(key, data) {
        if (!this.isCacheEnabled()) return;
        
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                version: this.getCacheVersion()
            };
            localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheItem));
        } catch (e) {
            console.warn('Failed to cache data:', e);
        }
    },
    
    /**
     * Get item from cache
     * @param {string} key - Cache key
     * @returns {*|null} Cached data or null if expired/missing
     */
    getCache(key) {
        if (!this.isCacheEnabled()) return null;
        
        try {
            const stored = localStorage.getItem(this.CACHE_PREFIX + key);
            if (!stored) return null;
            
            const cacheItem = JSON.parse(stored);
            
            // Check version match
            if (String(cacheItem.version) !== String(this.getCacheVersion())) {
                localStorage.removeItem(this.CACHE_PREFIX + key);
                return null;
            }
            
            // Check TTL
            if (Date.now() - cacheItem.timestamp > this.CACHE_TTL) {
                localStorage.removeItem(this.CACHE_PREFIX + key);
                return null;
            }
            
            return cacheItem.data;
        } catch (e) {
            return null;
        }
    },
    
    /**
     * Clear all portfolio cache
     */
    clearAllCache() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.CACHE_PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`Cleared ${keys.length} cached items`);
    },
    
    /**
     * Get site configuration
     * @returns {Object} Site settings
     */
    getSiteConfig() {
        return this.config?.site || {
            theme: 'dark-hacker',
            config_format: 'yml',
            cache_version: 1
        };
    },
    
    /**
     * Get pages configuration
     * @returns {Object} Page visibility settings
     */
    getPagesConfig() {
        return this.config?.pages || {
            projects: true,
            courses: true,
            articles: true
        };
    },
    
    /**
     * Get home sections configuration with ordering
     * @returns {Array} Ordered array of section configurations
     */
    getHomeSections() {
        const defaultSections = [
            { id: 'hero', enabled: true },
            { id: 'social_links', enabled: true },
            { id: 'summary', enabled: true },
            { id: 'skills', enabled: true },
            { id: 'work_experience', enabled: true },
            { id: 'education', enabled: true },
            { id: 'projects', enabled: true },
            { id: 'courses', enabled: true },
            { id: 'publications', enabled: true }
        ];
        
        return this.config?.home_sections || defaultSections;
    },
    
    /**
     * Get profile information
     * @returns {Object} Profile data
     */
    getProfile() {
        return this.config?.profile || {};
    },
    
    /**
     * Get skills configuration
     * @returns {Object} Skills settings
     */
    getSkillsConfig() {
        return this.config?.skills || {
            auto_generate: true,
            max_count: 15,
            manual_skills: []
        };
    },
    
    /**
     * Get social links
     * @returns {Array} Social link configurations
     */
    getSocialLinks() {
        return this.config?.social_links || [];
    },
    
    /**
     * Get work experience
     * @returns {Array} Work experience entries
     */
    getWorkExperience() {
        return this.config?.work_experience || [];
    },
    
    /**
     * Get education
     * @returns {Array} Education entries
     */
    getEducation() {
        return this.config?.education || [];
    },
    
    /**
     * Get projects configuration
     * @returns {Object} Projects settings and items
     */
    getProjects() {
        return this.config?.projects || {
            auto_fetch_github: true,
            items: []
        };
    },
    
    /**
     * Get courses
     * @returns {Object} Courses configuration
     */
    getCourses() {
        return this.config?.courses || {
            items: []
        };
    },
    
    /**
     * Get publications configuration
     * @returns {Object} Publications settings and items
     */
    getPublications() {
        return this.config?.publications || {
            auto_fetch_metadata: true,
            items: []
        };
    },
    
    /**
     * Check if a specific page is enabled
     * @param {string} pageName - Name of the page
     * @returns {boolean} Whether the page is enabled
     */
    isPageEnabled(pageName) {
        const pages = this.getPagesConfig();
        return pages[pageName] !== false;
    },
    
    /**
     * Check if a home section is enabled
     * @param {string} sectionId - Section ID
     * @returns {boolean} Whether the section is enabled
     */
    isSectionEnabled(sectionId) {
        const sections = this.getHomeSections();
        const section = sections.find(s => s.id === sectionId);
        return section ? section.enabled !== false : false;
    },
    
    /**
     * Get the theme name
     * @returns {string} Theme name
     */
    getTheme() {
        return this.getSiteConfig().theme || 'dark-hacker';
    },
    
    /**
     * Apply theme to the page
     */
    applyTheme() {
        const theme = this.getTheme();
        const themeLink = document.getElementById('theme-stylesheet');
        if (themeLink) {
            themeLink.href = `themes/${theme}.css`;
        }
        document.body.setAttribute('data-theme', theme);
    }
};

// Export for use in other modules
window.ConfigLoader = ConfigLoader;
