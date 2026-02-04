# RSC Dashboard - GitHub Setup & Deploy

## Quick Setup

```bash
cd c:\Users\Destiny\Desktop\ai-architect-mmorpg\copy-of-rsc-evolution-ai\rsc-dashboard

# Initialize git
git init
git add .
git commit -m "Initial dashboard setup"

# Create GitHub repo (do this first on GitHub.com)
# Then connect it:
git remote add origin https://github.com/YOUR-USERNAME/rsc-dashboard.git
git branch -M main
git push -u origin main
```

## Cloudflare Pages Setup

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Select your `rsc-dashboard` repository
5. Configure:
   - **Project name:** `rsc-dashboard`
   - **Build command:** (leave empty - static site)
   - **Build output directory:** `/`
6. Click **Save and Deploy**

## Result

Your dashboard will be live at:
- **Dashboard:** `https://rsc-dashboard.pages.dev`
- **Game (linked):** `https://rscaievolution-png.pages.dev/`

## Future Updates

Just push to GitHub - Cloudflare automatically rebuilds:

```bash
git add .
git commit -m "Update dashboard"
git push
```

Done! 🚀
