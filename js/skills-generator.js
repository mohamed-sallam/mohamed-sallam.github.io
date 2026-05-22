/**
 * Skills Generator Module
 * Aggregates and ranks skills from all content sections
 */

const SkillsGenerator = {
    /**
     * Collect all tags from various sources
     * @param {Object} config - Full configuration object
     * @returns {Array} Array of all tags
     */
    collectAllTags(config) {
        const allTags = [];
        
        // From work experience
        if (config.work_experience) {
            config.work_experience.forEach(job => {
                if (job.tags) {
                    allTags.push(...job.tags);
                }
            });
        }
        
        // From education
        if (config.education) {
            config.education.forEach(edu => {
                if (edu.tags) {
                    allTags.push(...edu.tags);
                }
            });
        }
        
        // From projects
        if (config.projects?.items) {
            config.projects.items.forEach(project => {
                if (project.tags) {
                    allTags.push(...project.tags);
                }
            });
        }
        
        // From courses
        if (config.courses?.items) {
            config.courses.items.forEach(course => {
                if (course.tags) {
                    allTags.push(...course.tags);
                }
            });
        }
        
        // From publications
        if (config.publications?.items) {
            config.publications.items.forEach(pub => {
                if (pub.tags) {
                    allTags.push(...pub.tags);
                }
            });
        }
        
        return allTags;
    },
    
    /**
     * Count frequency of each tag
     * @param {Array} tags - Array of tags
     * @returns {Object} Object with tag counts
     */
    countTags(tags) {
        const counts = {};
        
        tags.forEach(tag => {
            // Normalize tag (lowercase, trim)
            const normalizedTag = tag.trim();
            counts[normalizedTag] = (counts[normalizedTag] || 0) + 1;
        });
        
        return counts;
    },
    
    /**
     * Sort tags by frequency
     * @param {Object} tagCounts - Object with tag counts
     * @returns {Array} Sorted array of { tag, count } objects
     */
    sortByFrequency(tagCounts) {
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    },
    
    /**
     * Generate skills list from configuration
     * @param {Object} config - Full configuration object
     * @returns {Array} Array of skill strings
     */
    generate(config) {
        const skillsConfig = config.skills || {};
        
        // If auto-generate is disabled or manual skills provided, use those
        if (!skillsConfig.auto_generate || 
            (skillsConfig.manual_skills && skillsConfig.manual_skills.length > 0)) {
            return skillsConfig.manual_skills || [];
        }
        
        // Collect all tags
        const allTags = this.collectAllTags(config);
        
        // Count and sort
        const tagCounts = this.countTags(allTags);
        const sorted = this.sortByFrequency(tagCounts);
        
        // Get top N skills
        const maxCount = skillsConfig.max_count || 15;
        const topSkills = sorted.slice(0, maxCount).map(item => item.tag);
        
        return topSkills;
    },
    
    /**
     * Generate skills with additional GitHub-fetched tags
     * @param {Object} config - Full configuration object
     * @param {Object} githubData - Fetched GitHub data keyed by URL
     * @returns {Array} Array of skill strings
     */
    generateWithGitHub(config, githubData = {}) {
        const skillsConfig = config.skills || {};
        
        // If manual skills provided and auto-generate is off, use those
        if (!skillsConfig.auto_generate && 
            skillsConfig.manual_skills && 
            skillsConfig.manual_skills.length > 0) {
            return skillsConfig.manual_skills;
        }
        
        // Collect all tags from config
        const allTags = this.collectAllTags(config);
        
        // Add GitHub-fetched tags
        Object.values(githubData).forEach(data => {
            if (data) {
                if (data.topics) allTags.push(...data.topics);
                if (data.languages) allTags.push(...data.languages);
            }
        });
        
        // Count and sort
        const tagCounts = this.countTags(allTags);
        const sorted = this.sortByFrequency(tagCounts);
        
        // Get top N skills
        const maxCount = skillsConfig.max_count || 15;
        const topSkills = sorted.slice(0, maxCount).map(item => item.tag);
        
        return topSkills;
    }
};

// Export for use in other modules
window.SkillsGenerator = SkillsGenerator;
