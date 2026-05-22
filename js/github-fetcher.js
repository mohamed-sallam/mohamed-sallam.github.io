/**
 * GitHub Fetcher Module
 * Handles fetching repository information from GitHub API
 * Uses centralized caching from ConfigLoader
 */

const GitHubFetcher = {
    /**
     * Parse GitHub URL to extract owner and repo
     * @param {string} url - GitHub repository URL
     * @returns {Object|null} { owner, repo } or null if invalid
     */
    parseGitHubUrl(url) {
        if (!url) return null;
        
        // Match various GitHub URL formats
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/]+)/,
            /github\.com\/([^\/]+)\/([^\/]+)\.git/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace('.git', '')
                };
            }
        }
        
        return null;
    },
    
    /**
     * Fetch repository information from GitHub API
     * @param {string} url - GitHub repository URL
     * @returns {Promise<Object>} Repository information
     */
    async fetchRepoInfo(url) {
        const parsed = this.parseGitHubUrl(url);
        if (!parsed) {
            return null;
        }
        
        const cacheKey = `github_${parsed.owner}_${parsed.repo}`;
        
        // Check cache first (uses centralized ConfigLoader cache)
        const cached = ConfigLoader.getCache(cacheKey);
        if (cached) {
            console.log(`Using cached data for ${parsed.owner}/${parsed.repo}`);
            return cached;
        }
        
        try {
            // Fetch repo info
            const repoResponse = await fetch(
                `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`
            );
            
            if (!repoResponse.ok) {
                throw new Error(`GitHub API error: ${repoResponse.status}`);
            }
            
            const repoData = await repoResponse.json();
            
            // Fetch languages
            let languages = [];
            try {
                const langResponse = await fetch(repoData.languages_url);
                if (langResponse.ok) {
                    const langData = await langResponse.json();
                    languages = Object.keys(langData);
                }
            } catch (e) {
                console.warn('Failed to fetch languages:', e);
            }
            
            const result = {
                name: repoData.name,
                description: repoData.description || '',
                topics: repoData.topics || [],
                languages: languages,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                url: repoData.html_url,
                homepage: repoData.homepage || null,
                image: repoData.owner?.avatar_url || null,
                default_branch: repoData.default_branch
            };
            
            // Try to get social preview image
            try {
                const ogImage = `https://opengraph.githubassets.com/1/${parsed.owner}/${parsed.repo}`;
                result.social_image = ogImage;
            } catch (e) {
                // Ignore
            }
            
            // Cache the result using centralized cache
            ConfigLoader.setCache(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error(`Failed to fetch GitHub repo info for ${url}:`, error);
            return null;
        }
    },
    
    /**
     * Get tags for a project from GitHub
     * @param {string} url - GitHub repository URL
     * @returns {Promise<Array>} Array of tags (topics + languages)
     */
    async getTags(url) {
        const info = await this.fetchRepoInfo(url);
        if (!info) return [];
        
        // Combine topics and languages, deduplicate
        const allTags = [...(info.topics || []), ...(info.languages || [])];
        return [...new Set(allTags)];
    },
    
    /**
     * Get repository title (name) from GitHub
     * @param {string} url - GitHub repository URL
     * @returns {Promise<string>} Repository name or empty string
     */
    async getTitle(url) {
        const info = await this.fetchRepoInfo(url);
        return info?.name || '';
    },
    
    /**
     * Get repository description from GitHub
     * @param {string} url - GitHub repository URL
     * @returns {Promise<string>} Repository description or empty string
     */
    async getDescription(url) {
        const info = await this.fetchRepoInfo(url);
        return info?.description || '';
    },
    
    /**
     * Get social preview image for a GitHub repo
     * @param {string} url - GitHub repository URL
     * @returns {Promise<string>} Image URL or empty string
     */
    async getImage(url) {
        const info = await this.fetchRepoInfo(url);
        return info?.social_image || '';
    },
    
    /**
     * Check if URL is a GitHub URL
     * @param {string} url - URL to check
     * @returns {boolean} True if GitHub URL
     */
    isGitHubUrl(url) {
        return url && url.includes('github.com');
    }
};

// Export for use in other modules
window.GitHubFetcher = GitHubFetcher;
