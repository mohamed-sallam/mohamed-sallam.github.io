/**
 * Metadata Fetcher Module
 * Handles fetching Open Graph metadata from URLs
 * Uses centralized caching from ConfigLoader
 */

const MetadataFetcher = {
    // Multiple CORS proxies for fallback
    CORS_PROXIES: [
        { url: 'https://corsproxy.io/?', type: 'text', contentKey: null },
        { url: 'https://api.codetabs.com/v1/proxy?quest=', type: 'text', contentKey: null },
        { url: 'https://api.allorigins.win/get?url=', type: 'json', contentKey: 'contents' }
    ],
    
    /**
     * Extract Open Graph metadata from HTML
     * @param {string} html - HTML content
     * @returns {Object} Extracted metadata
     */
    extractMetadata(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const getMetaContent = (property) => {
            // Try og: prefix
            let meta = doc.querySelector(`meta[property="og:${property}"]`);
            if (meta) return meta.getAttribute('content');
            
            // Try twitter: prefix
            meta = doc.querySelector(`meta[name="twitter:${property}"]`);
            if (meta) return meta.getAttribute('content');
            
            // Try name attribute
            meta = doc.querySelector(`meta[name="${property}"]`);
            if (meta) return meta.getAttribute('content');
            
            return null;
        };
        
        // Get title from og:title, twitter:title, or <title> tag
        let title = getMetaContent('title');
        if (!title) {
            const titleTag = doc.querySelector('title');
            title = titleTag ? titleTag.textContent : null;
        }
        
        return {
            title: title || '',
            description: getMetaContent('description') || '',
            image: getMetaContent('image') || '',
            site_name: getMetaContent('site_name') || '',
            type: getMetaContent('type') || '',
            url: getMetaContent('url') || ''
        };
    },
    
    /**
     * Try fetching with a specific proxy
     * @param {string} url - URL to fetch
     * @param {Object} proxy - Proxy configuration
     * @returns {Promise<string|null>} HTML content or null
     */
    async tryProxy(url, proxy) {
        try {
            const proxyUrl = proxy.url + encodeURIComponent(url);
            const response = await fetch(proxyUrl, {
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            if (!response.ok) {
                return null;
            }
            
            if (proxy.type === 'json') {
                const data = await response.json();
                return data[proxy.contentKey] || null;
            } else {
                return await response.text();
            }
        } catch (error) {
            console.log(`Proxy ${proxy.url} failed for ${url}`);
            return null;
        }
    },
    
    /**
     * Fetch metadata for a URL with fallback proxies
     * @param {string} url - URL to fetch metadata from
     * @returns {Promise<Object>} Metadata object
     */
    async fetchMetadata(url) {
        if (!url) return null;
        
        // Create cache key from URL
        const cacheKey = 'metadata_' + btoa(url).replace(/[+/=]/g, '_').substring(0, 50);
        
        // Check cache first (uses centralized ConfigLoader cache)
        const cached = ConfigLoader.getCache(cacheKey);
        if (cached) {
            console.log(`Using cached metadata for ${url}`);
            return cached;
        }
        
        // Try each proxy in order
        let html = null;
        for (const proxy of this.CORS_PROXIES) {
            html = await this.tryProxy(url, proxy);
            if (html) break;
        }
        
        if (!html) {
            console.warn(`Could not fetch metadata for ${url} - all proxies failed`);
            return null;
        }
        
        try {
            const metadata = this.extractMetadata(html);
            metadata.originalUrl = url;
            
            // Cache the result using centralized cache
            ConfigLoader.setCache(cacheKey, metadata);
            
            return metadata;
        } catch (error) {
            console.error(`Failed to parse metadata for ${url}:`, error);
            return null;
        }
    },
    
    /**
     * Get title from URL
     * @param {string} url - URL to get title from
     * @returns {Promise<string>} Title or empty string
     */
    async getTitle(url) {
        const metadata = await this.fetchMetadata(url);
        return metadata?.title || '';
    },
    
    /**
     * Get image from URL
     * @param {string} url - URL to get image from
     * @returns {Promise<string>} Image URL or empty string
     */
    async getImage(url) {
        const metadata = await this.fetchMetadata(url);
        return metadata?.image || '';
    },
    
    /**
     * Get description from URL
     * @param {string} url - URL to get description from
     * @returns {Promise<string>} Description or empty string
     */
    async getDescription(url) {
        const metadata = await this.fetchMetadata(url);
        return metadata?.description || '';
    },
    
    /**
     * Detect platform from URL
     * @param {string} url - URL to analyze
     * @returns {string} Platform name
     */
    detectPlatform(url) {
        if (!url) return 'default';
        
        const platformPatterns = {
            'medium': /medium\.com/,
            'substack': /substack\.com/,
            'reddit': /reddit\.com/,
            'devto': /dev\.to/,
            'hashnode': /hashnode\.dev/,
            'github': /github\.com/,
            'youtube': /youtube\.com|youtu\.be/
        };
        
        for (const [platform, pattern] of Object.entries(platformPatterns)) {
            if (pattern.test(url)) {
                return platform;
            }
        }
        
        return 'default';
    }
};

// Export for use in other modules
window.MetadataFetcher = MetadataFetcher;
