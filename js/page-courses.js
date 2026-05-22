/**
 * Courses Page Script
 * Handles the full courses gallery page
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
    
    async function renderAllCourses() {
        const grid = document.getElementById('courses-grid');
        const filterContainer = document.getElementById('filter-container');
        if (!grid) return;
        
        const coursesConfig = ConfigLoader.getCourses();
        const items = coursesConfig.items || [];
        const allTags = new Set();
        
        // Remove skeleton cards first
        grid.querySelectorAll('.skeleton-card').forEach(el => el.remove());
        
        for (const course of items) {
            // Auto-fetch image from URL if not provided
            if (!course.image && course.url) {
                const metadata = await MetadataFetcher.fetchMetadata(course.url);
                if (metadata && metadata.image) {
                    course.image = metadata.image;
                }
            }
            
            // Collect tags
            if (course.tags) {
                course.tags.forEach(t => allTags.add(t));
            }
            
            const card = ContentRenderer.createCourseCard(course);
            card.dataset.tags = (course.tags || []).join(',').toLowerCase();
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
        const grid = document.getElementById('courses-grid');
        const buttons = document.querySelectorAll('.filter-tag');
        
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === tag);
        });
        
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
    
    window.filterByTag = filterByTag;
    
    try {
        await ConfigLoader.load();
        
        if (!ConfigLoader.isPageEnabled('courses')) {
            window.location.href = 'index.html';
            return;
        }
        
        ConfigLoader.applyTheme();
        ContentRenderer.init(ConfigLoader.config);
        ContentRenderer.renderNavbar();
        
        await renderAllCourses();
        setCurrentYear();
        removeSkeletons();
        
    } catch (error) {
        console.error('Failed to load courses:', error);
        showError(error.message);
    }
})();
