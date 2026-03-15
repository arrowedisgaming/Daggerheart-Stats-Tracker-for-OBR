# Development & Deployment Guide

## Local Development

### Prerequisites

- **Node.js 18+** — download from [nodejs.org](https://nodejs.org/)
- **pnpm** package manager — install via `npm install -g pnpm`

### Setup

```bash
# Clone the repository
git clone https://github.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR.git
cd Daggerheart-Stats-Tracker-for-OBR

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server starts at `http://localhost:5173`.

### Adding the Local Extension to Owlbear Rodeo

1. Go to [owlbear.rodeo](https://www.owlbear.rodeo) and sign in
2. Click your **profile icon** (top right) → **Extensions** → **Add Extension**
3. Paste: `http://localhost:5173/manifest.json`
4. Click **Add**

The local dev manifest plugin automatically rewrites `manifest.json` URLs to point to your local server.

### Building for Production

```bash
pnpm build
```

Output goes to `dist/`. You can host this on any static hosting service (GitHub Pages, Cloudflare Pages, Netlify, etc.).

### Linting

```bash
pnpm lint
```

ESLint is configured with zero warnings allowed.

---

## Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Set to **Public** (required for free GitHub Pages)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **Create repository**

### Step 2: Push Your Code

```bash
# Navigate to your project directory
cd your-project-directory

# Add your GitHub repo as remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push your code
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Click **Save**

### Step 4: Wait for Build

1. Go to the **Actions** tab in your repository
2. Wait for the workflow to complete (green checkmark) — takes 1-2 minutes

### Step 5: Get Your Extension URL

Once the build is complete, your extension will be available at:

```
https://YOUR-USERNAME.github.io/REPO-NAME/manifest.json
```

### Step 6: Add to Owlbear Rodeo

1. Go to [owlbear.rodeo](https://www.owlbear.rodeo)
2. Click your **profile icon** → **Extensions** → **Add Extension**
3. Paste your manifest URL
4. Click **Add**

### Making Updates

Whenever you push changes to `main`, GitHub Actions automatically rebuilds and redeploys:

```bash
git add .
git commit -m "Description of what you changed"
git push
```

---

## Troubleshooting

### Extension doesn't appear
- Ensure the dev server is running (`pnpm dev`)
- Check the manifest URL is correct
- Look for errors in the browser console

### Badges don't render
- Check that tokens are on the CHARACTER layer
- Verify the extension is toggled on in the room
- Check browser console (F12) for errors

### Stats don't persist
- Stats are stored in room metadata — they persist within a room but not across different rooms
- Check browser console for save/load errors

### Build fails in GitHub Actions
- Check the Actions tab for error messages
- Common issues: TypeScript errors, missing dependencies

### Extension doesn't load from GitHub Pages
- Make sure the URL ends with `/manifest.json`
- Check that GitHub Pages is enabled
- Wait 1-2 minutes after the build completes
- Try hard-refresh (Cmd+Shift+R / Ctrl+Shift+R)
