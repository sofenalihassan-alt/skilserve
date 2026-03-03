
# SEO and Professional Polish

## What will change

### 1. Update `index.html` -- SEO Meta Tags and Favicon
- Replace the placeholder OG image URL with the site's own logo (`/assets/logo.png`)
- Update `twitter:site` from `@Lovable` to `@SkillServe`
- Add canonical URL pointing to `https://skillserveweb.lovable.app`
- Add `theme-color` meta tag
- Set the existing `logo.png` as the favicon (it already exists in `src/assets/`)
- Copy `src/assets/logo.png` to `public/favicon.png` so it can be referenced as `/favicon.png`

### 2. New component: `src/components/StatsCounter.tsx`
An animated stats section showing key platform numbers with a count-up effect:
- "500+" Verified Providers
- "24/7" Emergency Support  
- "10,000+" Happy Customers
- "50+" Service Categories

Uses a simple `useEffect` + `useState` counter animation that triggers when the section scrolls into view (IntersectionObserver). Clean grid layout, 4 columns on desktop, 2 on mobile.

### 3. New component: `src/components/Testimonials.tsx`
A testimonials carousel section with 4-5 realistic reviews:
- Each card shows: star rating, quote text, reviewer name, and role (e.g. "Homeowner", "Business Owner")
- Uses the existing Embla carousel components already in the project
- Professional card design with quote icon
- Auto-scrolling with manual navigation dots

### 4. Update `src/pages/Index.tsx`
Insert new sections in this order:
1. Header
2. Hero
3. **StatsCounter** (new -- right after hero for immediate credibility)
4. ServiceCategories
5. **Testimonials** (new -- social proof before emergency)
6. EmergencyServices
7. "Why Choose" section (existing)
8. Footer

### 5. Update `src/contexts/LanguageContext.tsx`
Add Urdu translations for all new text keys used in StatsCounter and Testimonials sections.

### 6. Update `src/components/Footer.tsx`
- Make Quick Links actual `<Link>` elements that navigate to real routes instead of non-functional `<span>` tags
- Add a "Terms of Service" and "Privacy Policy" placeholder link for professionalism

---

## Technical details

**Files created:**
- `src/components/StatsCounter.tsx` -- animated counter section
- `src/components/Testimonials.tsx` -- carousel testimonials

**Files modified:**
- `index.html` -- meta tags, favicon, OG image
- `src/pages/Index.tsx` -- import and render new sections
- `src/contexts/LanguageContext.tsx` -- add ~15 new translation keys
- `src/components/Footer.tsx` -- working links

**No database changes needed.** No new dependencies required (carousel already installed).
