/**
 * Projects Page Script
 * Handles the full projects gallery page
 */

(async function() {
    'use strict';
    
    function showError(message) {
        const mainContentEl = document.getElementById('main-content');
        if (mainContentEl) {
            mainContentEl.innerHTML = `
                <div class="error-message">
                    <h2>⚠️ Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    function removeSkeletons() {
        document.querySelectorAll('.skeleton-loading').forEach(el => {
            el.classList.remove('skeleton-loading');
        });
        document.querySelectorAll('.skeleton-text').forEach(el => {
            el.classList.remove('skeleton-text', 'skeleton-multiline');
        });
        document.querySelectorAll('.skeleton-card').forEach(el => {
            el.remove();
        });
    }
    
    function setCurrentYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    
    async function renderAllProjects() {
        const grid = document.getElementById('projects-grid');
        const filterContainer = document.getElementById('filter-container');
        if (!grid) return;
        
        const projectsConfig = ConfigLoader.getProjects();
        const items = projectsConfig.items || [];
        const allTags = new Set();
        
        // Remove skeleton cards first
        grid.querySelectorAll('.skeleton-card').forEach(el => el.remove());
        
        // Process each project
        for (const project of items) {
            // Fetch GitHub data if needed
            if (projectsConfig.auto_fetch_github && project.github_url) {
                const githubInfo = await GitHubFetcher.fetchRepoInfo(project.github_url);
                
                if (githubInfo) {
                    if (!project.title) project.title = githubInfo.name;
                    if (!project.description) project.description = githubInfo.description;
                    if (!project.image) project.image = githubInfo.social_image;
                    if (!project.tags || project.tags.length === 0) {
                        project.tags = [...(githubInfo.topics || []), ...(githubInfo.languages || [])];
                    }
                    if (!project.url) project.url = githubInfo.url;
                }
            }
            
            // Collect tags
            if (project.tags) {
                project.tags.forEach(t => allTags.add(t));
            }
            
            const card = ContentRenderer.createProjectCard(project);
            card.dataset.tags = (project.tags || []).join(',').toLowerCase();
            grid.appendChild(card);
        }
        
        // Create filter buttons
        if (filterContainer) {
            // Add click handler to existing "All" button
            const allBtn = filterContainer.querySelector('[data-filter="all"]');
            if (allBtn) {
                allBtn.addEventListener('click', () => filterByTag('all'));
            }
            
            allTags.forEach(tag => {
                const btn = document.createElement('button');
                btn.className = 'filter-tag';
                btn.dataset.filter = tag.toLowerCase();
                btn.textContent = tag;
                btn.addEventListener('click', () => filterByTag(tag.toLowerCase()));
                filterContainer.appendChild(btn);
            });
        }
    }
    
    function filterByTag(tag) {
        const grid = document.getElementById('projects-grid');
        const buttons = document.querySelectorAll('.filter-tag');
        
        // Update active button
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === tag);
        });
        
        // Filter cards
        const cards = grid.querySelectorAll('.card');
        cards.forEach(card => {
            if (tag === 'all') {
                card.style.display = '';
            } else {
                const cardTags = card.dataset.tags || '';
                card.style.display = cardTags.includes(tag) ? '' : 'none';
            }
        });
    }
    
    // Make filter function global
    window.filterByTag = filterByTag;
    
    try {
        await ConfigLoader.load();
        
        // Check if page is enabled
        if (!ConfigLoader.isPageEnabled('projects')) {
            window.location.href = 'index.html';
            return;
        }
        
        ConfigLoader.applyTheme();
        ContentRenderer.init(ConfigLoader.config);
        ContentRenderer.renderNavbar();
        
        await renderAllProjects();
        setCurrentYear();
        removeSkeletons();
        
    } catch (error) {
        console.error('Failed to load projects:', error);
        showError(error.message);
    }
})();

