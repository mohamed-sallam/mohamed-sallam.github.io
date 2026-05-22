/**
 * Content Renderer Module
 * Handles rendering all portfolio content to the DOM
 */

const ContentRenderer = {
    config: null,
    githubData: {},
    
    /**
     * Initialize renderer with configuration
     * @param {Object} config - Loaded configuration
     */
    init(config) {
        this.config = config;
    },
    
    /**
     * Render navbar with page visibility
     */
    renderNavbar() {
        const navName = document.getElementById('nav-name');
        const navProjects = document.getElementById('nav-projects');
        const navCourses = document.getElementById('nav-courses');
        const navArticles = document.getElementById('nav-articles');
        const navToggle = document.getElementById('nav-toggle');
        const navLinks = document.getElementById('nav-links');
        
        const profile = ConfigLoader.getProfile();
        
        // Set name in navbar
        if (navName && profile.name) {
            navName.textContent = profile.name;
        }
        
        // Hide disabled pages
        if (navProjects && !ConfigLoader.isPageEnabled('projects')) {
            navProjects.style.display = 'none';
        }
        if (navCourses && !ConfigLoader.isPageEnabled('courses')) {
            navCourses.style.display = 'none';
        }
        if (navArticles && !ConfigLoader.isPageEnabled('articles')) {
            navArticles.style.display = 'none';
        }
        
        // Mobile nav toggle
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('nav-open');
                navToggle.classList.toggle('nav-toggle-active');
            });
        }
    },
    
    /**
     * Render the hero/profile section (now includes skills and summary)
     */
    renderHero() {
        const profile = ConfigLoader.getProfile();
        
        const photoEl = document.getElementById('profile-photo');
        const nameEl = document.getElementById('profile-name');
        const titleEl = document.getElementById('profile-title');
        const summaryEl = document.getElementById('profile-summary');
        
        if (photoEl && profile.photo) {
            photoEl.src = profile.photo;
            photoEl.alt = profile.name || 'Profile Photo';
        }
        
        if (nameEl) {
            nameEl.textContent = profile.name || '';
        }
        
        if (titleEl) {
            titleEl.textContent = profile.title || '';
        }
        
        if (summaryEl && profile.summary) {
            summaryEl.textContent = profile.summary;
        }
        
        // Update page title
        if (profile.name) {
            document.title = `${profile.name} | Portfolio`;
        }
    },
    
    /**
     * Render social links section
     */
    renderSocialLinks() {
        const container = document.getElementById('social-links-container');
        if (!container) return;
        
        const links = ConfigLoader.getSocialLinks();
        container.innerHTML = '';
        
        links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'social-link';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            
            // Handle different link types
            if (link.platform === 'email') {
                a.href = `mailto:${link.value || link.url}`;
            } else if (link.platform === 'phone') {
                a.href = `tel:${link.value || link.url}`;
            } else {
                a.href = link.url || '#';
            }
            
            // Add icon and label
            const icon = getIcon(link.platform || link.icon || 'default');
            const label = link.label || this.formatPlatformName(link.platform);
            
            a.innerHTML = `
                <span class="social-icon">${icon}</span>
                <span class="social-label">${label}</span>
            `;
            
            container.appendChild(a);
        });
    },
    
    /**
     * Format platform name for display
     * @param {string} platform - Platform identifier
     * @returns {string} Formatted name
     */
    formatPlatformName(platform) {
        const names = {
            'github': 'GitHub',
            'linkedin': 'LinkedIn',
            'stackoverflow': 'Stack Overflow',
            'leetcode': 'LeetCode',
            'twitter': 'Twitter',
            'email': 'Email',
            'phone': 'Phone',
            'cv': 'Resume/CV',
            'website': 'Website'
        };
        return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
    },
    
    /**
     * Render skills section (now in hero)
     * @param {Array} additionalTags - Additional tags from GitHub
     */
    renderSkills(additionalTags = []) {
        const container = document.getElementById('skills-container');
        if (!container) return;
        
        let skills = SkillsGenerator.generateWithGitHub(
            ConfigLoader.config,
            this.githubData
        );
        
        container.innerHTML = '';
        
        skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skill;
            container.appendChild(tag);
        });
    },
    
    /**
     * Render work experience timeline with company links
     */
    renderWorkExperience() {
        const container = document.getElementById('work-experience-container');
        if (!container) return;
        
        const experience = ConfigLoader.getWorkExperience();
        container.innerHTML = '';
        
        experience.forEach(job => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const tagsHtml = job.tags ? 
                job.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
            
            // Company links (LinkedIn and Website)
            let companyLinksHtml = '';
            if (job.linkedin_url || job.website_url) {
                companyLinksHtml = '<span class="company-links">';
                if (job.linkedin_url) {
                    companyLinksHtml += `<a href="${job.linkedin_url}" class="company-link company-linkedin" target="_blank" rel="noopener noreferrer" title="Company LinkedIn">${getIcon('linkedin')}</a>`;
                }
                if (job.website_url) {
                    companyLinksHtml += `<a href="${job.website_url}" class="company-link company-website" target="_blank" rel="noopener noreferrer" title="Company Website">${getIcon('website')}</a>`;
                }
                companyLinksHtml += '</span>';
            }
            
            item.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h3 class="timeline-title">${job.role || ''}</h3>
                        <span class="timeline-period">${job.period || ''}</span>
                    </div>
                    <p class="timeline-company">${job.company || ''}${companyLinksHtml}</p>
                    <p class="timeline-description">${job.description || ''}</p>
                    <div class="timeline-tags">${tagsHtml}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    },
    
    /**
     * Render education timeline
     */
    renderEducation() {
        const container = document.getElementById('education-container');
        if (!container) return;
        
        const education = ConfigLoader.getEducation();
        container.innerHTML = '';
        
        education.forEach(edu => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const tagsHtml = edu.tags ? 
                edu.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
            
            item.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h3 class="timeline-title">${edu.degree || ''}</h3>
                        <span class="timeline-period">${edu.period || ''}</span>
                    </div>
                    <p class="timeline-company">${edu.institution || ''}</p>
                    <p class="timeline-description">${edu.description || ''}</p>
                    <div class="timeline-tags">${tagsHtml}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    },
    
    /**
     * Create a project card element with clickable title/image
     * @param {Object} project - Project data
     * @returns {HTMLElement} Card element
     */
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'card project-card';
        
        const tagsHtml = project.tags ? 
            project.tags.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('') : '';
        
        const imageUrl = project.image || project.social_image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23333" width="400" height="200"/><text fill="%23666" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
        const linkUrl = project.url || project.github_url || '#';
        
        card.innerHTML = `
            <a href="${linkUrl}" class="card-image-link" target="_blank" rel="noopener noreferrer">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${project.title || 'Project'}" loading="lazy">
                </div>
            </a>
            <div class="card-content">
                <a href="${linkUrl}" class="card-title-link" target="_blank" rel="noopener noreferrer">
                    <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                </a>
                <p class="card-description">${project.description || ''}</p>
                <div class="card-tags">${tagsHtml}</div>
            </div>
            <a href="${linkUrl}" class="card-link" target="_blank" rel="noopener noreferrer">
                View Project ${getIcon('external')}
            </a>
        `;
        
        return card;
    },
    
    /**
     * Render projects section (horizontal scroll)
     * @param {boolean} showAll - Whether to show all projects or just featured
     */
    async renderProjects(showAll = false) {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        const projectsConfig = ConfigLoader.getProjects();
        const items = projectsConfig.items || [];
        
        container.innerHTML = '';
        
        // Filter to featured if not showing all
        const projectsToShow = showAll ? items : items.filter(p => p.featured !== false).slice(0, 6);
        
        for (const project of projectsToShow) {
            // Fetch GitHub data if needed
            if (projectsConfig.auto_fetch_github && project.github_url) {
                const githubInfo = await GitHubFetcher.fetchRepoInfo(project.github_url);
                
                if (githubInfo) {
                    this.githubData[project.github_url] = githubInfo;
                    
                    // Fill in missing data
                    if (!project.title) project.title = githubInfo.name;
                    if (!project.description) project.description = githubInfo.description;
                    if (!project.image) project.image = githubInfo.social_image;
                    if (!project.tags || project.tags.length === 0) {
                        project.tags = [...(githubInfo.topics || []), ...(githubInfo.languages || [])];
                    }
                    if (!project.url) project.url = githubInfo.url;
                }
            }
            
            const card = this.createProjectCard(project);
            container.appendChild(card);
        }
        
        // Hide "See More" if page is disabled
        const seeMoreLink = document.getElementById('projects-see-more');
        if (seeMoreLink && !ConfigLoader.isPageEnabled('projects')) {
            seeMoreLink.style.display = 'none';
        }
    },
    
    /**
     * Create a course card element with clickable title/image
     * @param {Object} course - Course data
     * @returns {HTMLElement} Card element
     */
    createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'card course-card';
        
        const tagsHtml = course.tags ? 
            course.tags.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('') : '';
        
        const providerIcon = getProviderIcon(course.provider || '');
        const imageUrl = course.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23333" width="400" height="200"/><text fill="%23666" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">Course</text></svg>';
        const linkUrl = course.url || '#';
        
        card.innerHTML = `
            <a href="${linkUrl}" class="card-image-link" target="_blank" rel="noopener noreferrer">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${course.title || 'Course'}" loading="lazy">
                    <span class="card-provider-badge">${providerIcon}</span>
                </div>
            </a>
            <div class="card-content">
                <a href="${linkUrl}" class="card-title-link" target="_blank" rel="noopener noreferrer">
                    <h3 class="card-title">${course.title || 'Untitled Course'}</h3>
                </a>
                <p class="card-meta">${course.provider || ''} ${course.completed ? `• ${course.completed}` : ''}</p>
                <div class="card-tags">${tagsHtml}</div>
            </div>
            ${course.url ? `
            <a href="${course.url}" class="card-link" target="_blank" rel="noopener noreferrer">
                View Course ${getIcon('external')}
            </a>
            ` : ''}
        `;
        
        return card;
    },
    
    /**
     * Render courses section
     * @param {boolean} showAll - Whether to show all courses
     */
    async renderCourses(showAll = false) {
        const container = document.getElementById('courses-container');
        if (!container) return;
        
        const coursesConfig = ConfigLoader.getCourses();
        const items = coursesConfig.items || [];
        
        container.innerHTML = '';
        
        const coursesToShow = showAll ? items : items.slice(0, 6);
        
        for (const course of coursesToShow) {
            // Auto-fetch image from URL if not provided
            if (!course.image && course.url) {
                const metadata = await MetadataFetcher.fetchMetadata(course.url);
                if (metadata && metadata.image) {
                    course.image = metadata.image;
                }
            }
            
            const card = this.createCourseCard(course);
            container.appendChild(card);
        }
        
        // Hide "See More" if page is disabled
        const seeMoreLink = document.getElementById('courses-see-more');
        if (seeMoreLink && !ConfigLoader.isPageEnabled('courses')) {
            seeMoreLink.style.display = 'none';
        }
    },
    
    /**
     * Create a publication card element with clickable title/image
     * @param {Object} publication - Publication data
     * @returns {HTMLElement} Card element
     */
    createPublicationCard(publication) {
        const card = document.createElement('div');
        card.className = 'card publication-card';
        
        const tagsHtml = publication.tags ? 
            publication.tags.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('') : '';
        
        const platform = publication.platform || MetadataFetcher.detectPlatform(publication.url);
        const platformIcon = getPlatformIcon(platform);
        const imageUrl = publication.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23333" width="400" height="200"/><text fill="%23666" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">Article</text></svg>';
        const linkUrl = publication.url || '#';
        
        card.innerHTML = `
            <a href="${linkUrl}" class="card-image-link" target="_blank" rel="noopener noreferrer">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${publication.title || 'Article'}" loading="lazy">
                    <span class="card-platform-badge">${platformIcon}</span>
                </div>
            </a>
            <div class="card-content">
                <a href="${linkUrl}" class="card-title-link" target="_blank" rel="noopener noreferrer">
                    <h3 class="card-title">${publication.title || 'Untitled Article'}</h3>
                </a>
                <p class="card-meta">${publication.date || ''}</p>
                <div class="card-tags">${tagsHtml}</div>
            </div>
            <a href="${linkUrl}" class="card-link" target="_blank" rel="noopener noreferrer">
                Read Article ${getIcon('external')}
            </a>
        `;
        
        return card;
    },
    
    /**
     * Render publications section
     * @param {boolean} showAll - Whether to show all publications
     */
    async renderPublications(showAll = false) {
        const container = document.getElementById('publications-container');
        if (!container) return;
        
        const pubsConfig = ConfigLoader.getPublications();
        const items = pubsConfig.items || [];
        
        container.innerHTML = '';
        
        const pubsToShow = showAll ? items : items.slice(0, 6);
        
        for (const pub of pubsToShow) {
            // Fetch metadata if needed
            if (pubsConfig.auto_fetch_metadata && pub.url) {
                if (!pub.title || !pub.image) {
                    const metadata = await MetadataFetcher.fetchMetadata(pub.url);
                    
                    if (metadata) {
                        if (!pub.title) pub.title = metadata.title;
                        if (!pub.image) pub.image = metadata.image;
                    }
                }
            }
            
            const card = this.createPublicationCard(pub);
            container.appendChild(card);
        }
        
        // Hide "See More" if page is disabled
        const seeMoreLink = document.getElementById('publications-see-more');
        if (seeMoreLink && !ConfigLoader.isPageEnabled('articles')) {
            seeMoreLink.style.display = 'none';
        }
    },
    
    /**
     * Apply section ordering and visibility
     */
    applySectionOrder() {
        const sections = ConfigLoader.getHomeSections();
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        // Get navbar and footer to ensure they stay in position
        const navbar = mainContent.querySelector('.navbar');
        const footer = mainContent.querySelector('.footer');
        
        // Hide disabled sections (skills and summary are now part of hero)
        sections.forEach(sectionConfig => {
            // Skip skills and summary as they are now in hero
            if (sectionConfig.id === 'skills' || sectionConfig.id === 'summary') {
                // Control visibility via hero-skills and hero-summary
                const heroSkills = document.querySelector('.hero-skills');
                const heroSummary = document.querySelector('.hero-summary');
                
                if (sectionConfig.id === 'skills' && heroSkills) {
                    heroSkills.style.display = sectionConfig.enabled === false ? 'none' : '';
                }
                if (sectionConfig.id === 'summary' && heroSummary) {
                    heroSummary.style.display = sectionConfig.enabled === false ? 'none' : '';
                }
                return;
            }
            
            const section = document.getElementById(sectionConfig.id);
            if (section) {
                if (sectionConfig.enabled === false) {
                    section.style.display = 'none';
                } else {
                    section.style.display = '';
                }
            }
        });
        
        // Reorder sections (skip hero as it should always be first after navbar)
        sections.forEach(sectionConfig => {
            if (sectionConfig.enabled !== false && 
                sectionConfig.id !== 'hero' && 
                sectionConfig.id !== 'skills' && 
                sectionConfig.id !== 'summary') {
                const section = document.getElementById(sectionConfig.id);
                if (section && footer) {
                    mainContent.insertBefore(section, footer);
                }
            }
        });
    },
    
    /**
     * Set current year in footer
     */
    setCurrentYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    },
    
    /**
     * Render all content
     */
    async renderAll() {
        this.renderNavbar();
        this.renderHero();
        this.renderSocialLinks();
        
        // Render projects first to collect GitHub data
        await this.renderProjects();
        
        // Now render skills with GitHub data
        this.renderSkills();
        
        this.renderWorkExperience();
        this.renderEducation();
        this.renderCourses();
        await this.renderPublications();
        
        this.applySectionOrder();
        this.setCurrentYear();
    }
};

// Export for use in other modules
window.ContentRenderer = ContentRenderer;
