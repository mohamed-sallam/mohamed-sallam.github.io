/**
 * Main Entry Point
 * Initializes the portfolio application
 */

(async function() {
    'use strict';
    
    function showError(message) {
        const mainContentEl = document.getElementById('main-content');
        if (mainContentEl) {
            mainContentEl.innerHTML = `
                <div class="error-message">
                    <h2>⚠️ Error Loading Portfolio</h2>
                    <p>${message}</p>
                    <p>Please check the browser console for details.</p>
                </div>
            `;
        }
    }
    
    function setCurrentYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }
    
    try {
        // Load configuration
        console.log('Loading configuration...');
        await ConfigLoader.load();
        
        // Apply theme immediately
        console.log('Applying theme...');
        ConfigLoader.applyTheme();
        
        // Initialize renderer
        ContentRenderer.init(ConfigLoader.config);
        
        // Render static content immediately (no skeleton needed)
        ContentRenderer.renderNavbar();
        ContentRenderer.renderHero();
        ContentRenderer.renderSkills();
        ContentRenderer.renderSocialLinks();
        ContentRenderer.renderWorkExperience();
        ContentRenderer.renderEducation();
        
        // Set current year
        setCurrentYear();
        
        // Render dynamic content (cards) - skeletons will be replaced
        console.log('Rendering dynamic content...');
        await ContentRenderer.renderProjects();
        await ContentRenderer.renderCourses();
        await ContentRenderer.renderPublications();
        
        // Apply section ordering and visibility from config
        ContentRenderer.applySectionOrder();
        
        console.log('Portfolio loaded successfully!');
        
    } catch (error) {
        console.error('Failed to load portfolio:', error);
        showError(error.message);
    }
})();
