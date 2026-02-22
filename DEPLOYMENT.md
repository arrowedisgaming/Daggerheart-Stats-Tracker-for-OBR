# Deployment Guide: GitHub Pages

Your Daggerheart Tracker is ready to deploy! Follow these steps to get it online.

## Step 1: Create a GitHub Repository

1. Go to https://github.com and sign in (or create an account)
2. Click the **+** icon in the top right, select **New repository**
3. **Repository name**: `DHOBRStats` (exactly this name!)
4. **Description**: "Daggerheart stat tracker for Owlbear Rodeo"
5. Set to **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **Create repository**

## Step 2: Push Your Code

GitHub will show you commands after creating the repo. Use these:

```bash
# Navigate to your project (you're already here!)
cd /Users/edmundoneill/Library/CloudStorage/Dropbox/RPG/Tools/OBR-DH/DHOBRStats

# Add your GitHub repo as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/DHOBRStats.git

# Push your code
git push -u origin main
```

**Replace `YOUR-USERNAME`** with your actual GitHub username!

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Click **Save**

## Step 4: Wait for Build

1. Go to the **Actions** tab in your repository
2. You should see a workflow running (yellow dot)
3. Wait for it to complete (green checkmark) - takes 1-2 minutes
4. The workflow will automatically deploy to GitHub Pages

## Step 5: Get Your Extension URL

Once the build is complete, your extension will be available at:

```
https://YOUR-USERNAME.github.io/DHOBRStats/manifest.json
```

**Replace `YOUR-USERNAME`** with your GitHub username!

## Step 6: Add to Owlbear Rodeo

1. Go to https://www.owlbear.rodeo
2. Click your **profile icon** (top right)
3. Go to **Extensions**
4. Click **Add Extension**
5. Paste your manifest URL: `https://YOUR-USERNAME.github.io/DHOBRStats/manifest.json`
6. Click **Add**

## Step 7: Test It!

1. Create or open an Owlbear Rodeo room
2. Click the **Extensions** button (puzzle piece icon)
3. Toggle on **"Daggerheart Tracker"**
4. Add a CHARACTER token to the scene
5. Right-click the token → **"Add Daggerheart Stats"**
6. Set HP, Stress, Hope, Armor values
7. You should see colored segment bars appear above the token!

## Making Updates

Whenever you make changes to your code:

```bash
# Stage your changes
git add .

# Commit with a message
git commit -m "Description of what you changed"

# Push to GitHub
git push

# GitHub Actions will automatically rebuild and redeploy!
```

## Troubleshooting

### Build fails in GitHub Actions
- Check the Actions tab for error messages
- Common issues:
  - TypeScript errors - check the logs
  - Missing dependencies - should auto-install

### Extension doesn't load
- Make sure the URL ends with `/manifest.json`
- Check that GitHub Pages is enabled
- Wait 1-2 minutes after the build completes
- Try hard-refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Bars don't appear
- Make sure tokens are on the CHARACTER layer
- Check browser console (F12) for errors
- Verify the extension is toggled on in the room

## Your Extension is Live! 🎉

Once deployed, anyone can use your extension with the manifest URL!

---

**Need help?** Check the main README.md or open an issue on GitHub.
