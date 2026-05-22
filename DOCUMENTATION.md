# Portfolio Documentation

A highly configurable portfolio template for backend engineers, designed for GitHub Pages deployment.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Schema](#configuration-schema)
3. [Themes](#themes)
4. [Smart Features](#smart-features)
5. [Deployment](#deployment)
6. [Customization](#customization)

---

## Quick Start

1. **Fork or clone this repository**
2. **Edit `config/content.yml`** with your information
3. **Choose a theme** by setting `site.theme`
4. **Deploy to GitHub Pages** (see [Deployment](#deployment))

That's it! No need to edit HTML files.

---

## Configuration Schema

The portfolio is configured via `config/content.yml` (or `config/content.json` as an alternative).

### Site Settings

```yaml
site:
  theme: "dark-hacker"  # Theme name (see Themes section)
```

### Page Toggles

Enable or disable entire pages:

```yaml
pages:
  projects: true   # Enable/disable projects page
  courses: true    # Enable/disable courses page
  articles: true   # Enable/disable articles page
```

### Home Sections

Control which sections appear on the home page and their order:

```yaml
home_sections:
  - id: "hero"
    enabled: true
  - id: "social_links"
    enabled: true
  - id: "summary"
    enabled: true
  - id: "skills"
    enabled: true
  - id: "work_experience"
    enabled: true
  - id: "education"
    enabled: true
  - id: "projects"
    enabled: true
  - id: "courses"
    enabled: true
  - id: "publications"
    enabled: true
```

**Available Section IDs:**
- `hero` - Profile photo, name, and title
- `social_links` - Linktree-style social links
- `summary` - About me text
- `skills` - Skill tags
- `work_experience` - Work history timeline
- `education` - Education timeline
- `projects` - Horizontal scrolling project cards
- `courses` - Horizontal scrolling course cards
- `publications` - Horizontal scrolling article cards

**To hide a section:** Set `enabled: false`  
**To reorder:** Change the order in the YAML array

### Profile

```yaml
profile:
  name: "Your Name"
  title: "Your Job Title"
  photo: "path/to/photo.jpg"  # Local path or URL
  summary: |
    Multi-line summary text about yourself.
    Supports markdown-style line breaks.
```

### Skills

```yaml
skills:
  auto_generate: true   # Generate from tags in other sections
  max_count: 15         # Maximum skills to show
  manual_skills:        # Used if auto_generate is false
    - Python
    - JavaScript
```

**Auto-generation:** When `auto_generate: true`, skills are automatically extracted from:
- Project tags
- Course tags
- Work experience tags
- Education tags
- Publication tags

Skills are ranked by frequency (most used first).

### Social Links

```yaml
social_links:
  - platform: "github"
    url: "https://github.com/username"
    label: "GitHub"  # Optional, defaults to platform name
    
  - platform: "email"
    value: "email@example.com"  # Use 'value' for email/phone
    
  - platform: "cv"
    url: "assets/resume.pdf"
```

**Supported Platforms:**
| Platform | Icon |
|----------|------|
| `github` | GitHub icon |
| `linkedin` | LinkedIn icon |
| `stackoverflow` | Stack Overflow icon |
| `leetcode` | LeetCode icon |
| `twitter` | X/Twitter icon |
| `email` | Email icon |
| `phone` | Phone icon |
| `cv` | Document icon |
| `website` | Globe icon |

### Work Experience

```yaml
work_experience:
  - company: "Company Name"
    role: "Job Title"
    period: "2020 - Present"
    description: "What you did there..."
    tags:
      - Python
      - AWS
```

### Education

```yaml
education:
  - institution: "University Name"
    degree: "Degree Title"
    period: "2016 - 2020"
    description: "Optional description"
    tags:
      - Computer Science
```

### Projects

```yaml
projects:
  auto_fetch_github: true  # Fetch info from GitHub repos
  
  items:
    # GitHub auto-fetch example (leave fields empty)
    - github_url: "https://github.com/user/repo"
      featured: true
      
    # Manual data example
    - title: "Project Name"
      description: "Project description"
      github_url: "https://github.com/user/repo"  # Optional
      url: "https://project-demo.com"             # Alternative link
      image: "path/to/image.jpg"
      tags:
        - Python
        - Django
      featured: true  # Show on homepage
```

**Auto-fetch from GitHub:**  
When `auto_fetch_github: true`, the following are automatically fetched:
- Repository name → `title`
- Repository description → `description`
- Topics + Languages → `tags`
- Open Graph image → `image`

Leave fields empty to use auto-fetched data, or provide values to override.

### Courses

```yaml
courses:
  items:
    - title: "Course Name"
      provider: "Coursera"  # Platform name
      url: "https://course-url.com"
      image: "path/to/image.jpg"  # Optional
      tags:
        - Topic 1
        - Topic 2
      completed: "2023"  # Year completed
```

**Recognized Providers:**
- Coursera, Udemy, Pluralsight, LinkedIn Learning, YouTube

### Publications / Articles

```yaml
publications:
  auto_fetch_metadata: true  # Fetch title/image from URLs
  
  items:
    - title: "Article Title"      # Or leave empty for auto-fetch
      url: "https://article-url.com"
      platform: "medium"          # Publishing platform
      image: "path/to/image.jpg"  # Or leave empty for auto-fetch
      tags:
        - Topic 1
      date: "2023-06-15"
```

**Supported Platforms:**
| Platform | Icon |
|----------|------|
| `medium` | Medium icon |
| `substack` | Substack icon |
| `devto` / `dev.to` | DEV icon |
| `hashnode` | Hashnode icon |
| `github` | GitHub icon |
| `reddit` | Reddit icon |
| `youtube` | YouTube icon |

---

## Themes

Five themes are included:

### 1. Liquid Glass (`liquid-glass`)
Apple-inspired glassmorphism with:
- Frosted glass effects
- Animated gradient backgrounds
- Smooth transitions
- Modern, premium feel

### 2. Dark Hacker (`dark-hacker`)
Terminal/hacker aesthetic with:
- Matrix green on black
- Monospace fonts (Fira Code)
- Scanline effects
- Blinking cursor animations

### 3. Windows ME (`windows-me`)
90's nostalgic style with:
- Classic Windows colors
- 3D beveled buttons
- Pixel-style fonts
- Window frame UI

### 4. Retro Japanese (`retro-japanese`)
80's arcade/synthwave with:
- Neon pink, cyan, purple
- Pixel art aesthetic
- Starfield background
- Glowing effects

### 5. Scientific (`scientific`)
Academic/LaTeX style with:
- Serif typography (Crimson Pro)
- Clean, minimal design
- Print-friendly
- Paper-like appearance

**To change theme:** Edit `site.theme` in your config file.

---

## Smart Features

### Auto-generated Skills

When `skills.auto_generate: true`, the system:
1. Collects all tags from projects, courses, work, education, publications
2. Counts frequency of each tag
3. Sorts by frequency (most common first)
4. Returns top N skills (`skills.max_count`)

This ensures your skills always reflect your actual experience.

### GitHub Repository Auto-fetch

When `projects.auto_fetch_github: true`, for any project with a `github_url`:
- **Title**: Fetched from repo name if not provided
- **Description**: Fetched from repo description if not provided
- **Tags**: Fetched from repo topics + languages if not provided
- **Image**: GitHub OpenGraph preview image if not provided

**Rate Limiting:** GitHub's public API allows 60 requests/hour. Data is cached in localStorage for 1 hour.

### Article Metadata Auto-fetch

When `publications.auto_fetch_metadata: true`:
- **Title**: Extracted from Open Graph `og:title`
- **Image**: Extracted from Open Graph `og:image`

Uses a CORS proxy (allorigins.win) to fetch metadata from external URLs.

### Platform Auto-detection

For publications, if `platform` is not specified, it's automatically detected from the URL:
- `medium.com` → Medium
- `dev.to` → DEV
- `substack.com` → Substack
- etc.

---

## Deployment

### GitHub Pages

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`), folder: `/ (root)`

2. **Push your changes:**
   ```bash
   git add .
   git commit -m "Update portfolio"
   git push
   ```

3. **Access your site:**
   - `https://yourusername.github.io/repository-name/`
   - Or configure a custom domain

### Local Development

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

---

## Customization

### Adding Custom CSS

Create a file `themes/custom.css` and set `site.theme: "custom"`.

Copy the structure from an existing theme and modify as needed.

### Modifying HTML Structure

Edit the HTML files directly if you need to add new sections or change the layout.

**Files:**
- `index.html` - Main portfolio page
- `projects.html` - Full projects list
- `courses.html` - Full courses list
- `articles.html` - Full articles list

### Adding New Icons

Edit `js/icons.js` to add new SVG icons. Add entries to the `ICONS` object:

```javascript
ICONS.newplatform = `<svg>...</svg>`;
```

---

## File Structure

```
portfolio/
├── index.html              # Main page
├── projects.html           # Projects page
├── courses.html            # Courses page
├── articles.html           # Articles page
├── DOCUMENTATION.md        # This file
│
├── config/
│   ├── content.yml         # Main configuration (YAML)
│   └── content.json        # Alternative (JSON)
│
├── themes/
│   ├── liquid-glass.css
│   ├── dark-hacker.css
│   ├── windows-me.css
│   ├── retro-japanese.css
│   └── scientific.css
│
├── js/
│   ├── main.js             # Entry point
│   ├── config-loader.js    # YAML/JSON loader
│   ├── content-renderer.js # DOM rendering
│   ├── github-fetcher.js   # GitHub API
│   ├── metadata-fetcher.js # OG metadata
│   ├── skills-generator.js # Skill aggregation
│   └── icons.js            # SVG icons
│
└── assets/
    └── (your images, resume, etc.)
```

---

## Troubleshooting

### Configuration not loading

- Ensure `config/content.yml` exists and is valid YAML
- Check browser console for parse errors
- Try the JSON alternative if YAML parsing fails

### GitHub data not fetching

- Check if the repository is public
- Verify the URL format: `https://github.com/owner/repo`
- Check rate limiting (60 req/hour for unauthenticated)
- Check browser console for API errors

### Images not showing

- Verify image URLs are accessible
- For local images, ensure they're in the correct path
- External images may be blocked by CORS

### Theme not applying

- Verify theme name matches exactly (case-sensitive)
- Check that the CSS file exists in `themes/`
- Clear browser cache

---

## License

MIT License - Feel free to use and modify for your own portfolio!
