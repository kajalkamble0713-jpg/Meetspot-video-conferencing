# 🚀 GitHub Setup Guide

This guide will help you upload your MeetSpot project to GitHub safely and securely.

## ✅ Pre-Upload Checklist

Before uploading to GitHub, ensure you've completed these steps:

- [x] Created `.gitignore` file
- [x] Created `.env.example` files (backend and frontend)
- [x] Removed hardcoded credentials from code
- [x] Updated code to use environment variables
- [x] Created comprehensive README.md
- [x] Created LICENSE file
- [x] Created CONTRIBUTING.md
- [x] Created SECURITY.md

## 📋 Step-by-Step Upload Process

### Step 1: Create .env File (Local Only)

Create a `.env` file in the `backend` directory with your actual credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your real credentials:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-actual-app-password
```

**⚠️ IMPORTANT:** The `.env` file is in `.gitignore` and will NOT be uploaded to GitHub!

### Step 2: Initialize Git Repository

```bash
# Navigate to project root
cd /path/to/meetspot

# Initialize git (if not already done)
git init

# Add all files
git add .

# Check what will be committed (verify .env is NOT listed)
git status

# Commit
git commit -m "Initial commit: MeetSpot video conferencing application"
```

### Step 3: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `meetspot` (or your preferred name)
4. Description: "A modern video conferencing web application"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README (we already have one)
7. Click **Create repository**

### Step 4: Connect and Push

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/meetspot.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Verify Upload

1. Go to your GitHub repository
2. Check that these files are **PRESENT**:
   - ✅ README.md
   - ✅ LICENSE
   - ✅ .gitignore
   - ✅ backend/.env.example
   - ✅ frontend/.env.example
   - ✅ All source code files

3. Check that these files are **NOT PRESENT** (should be ignored):
   - ❌ backend/.env
   - ❌ frontend/.env
   - ❌ node_modules/
   - ❌ .vscode/
   - ❌ package-lock.json (optional)

### Step 6: Update README.md

Update the following in README.md:

1. Replace `YOUR_USERNAME` with your GitHub username
2. Add your name and contact information
3. Add screenshots (optional)
4. Update the repository URL

```bash
# After editing README.md
git add README.md
git commit -m "Update README with personal information"
git push
```

## 🔒 Security Verification

### Double-Check These Files

Run these commands to ensure no sensitive data is in your repository:

```bash
# Check if .env is ignored
git check-ignore backend/.env
# Should output: backend/.env

# Search for potential credentials in tracked files
git grep -i "mongodb+srv://" -- ':!*.md' ':!*.example'
# Should return nothing or only example files

# Search for email passwords
git grep -i "EMAIL_PASSWORD" -- ':!*.md' ':!*.example'
# Should return nothing or only example files
```

### If You Accidentally Committed Credentials

If you accidentally committed sensitive data:

```bash
# Remove file from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ use with caution)
git push origin --force --all
```

**Better approach:** Delete the repository and create a new one.

## 📝 Post-Upload Tasks

### 1. Add Repository Description

On GitHub:
- Go to repository settings
- Add description: "A modern video conferencing web application built with React, Node.js, WebRTC, and Socket.io"
- Add topics: `video-conferencing`, `webrtc`, `react`, `nodejs`, `socketio`, `mongodb`

### 2. Enable GitHub Pages (Optional)

If you want to host documentation:
- Settings → Pages
- Source: Deploy from branch
- Branch: main, folder: /docs
- Save

### 3. Set Up Branch Protection (Optional)

- Settings → Branches
- Add rule for `main` branch
- Require pull request reviews
- Require status checks

### 4. Add Collaborators (Optional)

- Settings → Collaborators
- Add team members

## 🌐 Deployment Options

### Option 1: Render.com (Recommended)

**Backend:**
1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables from `.env`

**Frontend:**
1. New → Static Site
2. Connect GitHub repository
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `build`

### Option 2: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create meetspot-backend

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password

# Deploy
git push heroku main
```

### Option 3: Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

## 🔄 Updating Your Repository

### Making Changes

```bash
# Make your changes
# ...

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push origin main
```

### Creating a New Feature

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request on GitHub
```

## 📊 Repository Statistics

Add badges to your README.md:

```markdown
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/meetspot)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/meetspot)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/meetspot)
![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/meetspot)
```

## ❓ Troubleshooting

### Problem: "Permission denied (publickey)"

**Solution:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Copy output and add to GitHub → Settings → SSH Keys
```

### Problem: "Repository not found"

**Solution:**
- Verify repository URL
- Check repository visibility (public/private)
- Verify GitHub username

### Problem: Large files rejected

**Solution:**
```bash
# Remove large files
git rm --cached large-file.zip

# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Commit
git commit -m "Remove large file"
```

## 📞 Need Help?

- GitHub Docs: https://docs.github.com
- Git Documentation: https://git-scm.com/doc
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

---

## ✅ Final Checklist

Before considering your upload complete:

- [ ] Repository is created on GitHub
- [ ] All code is pushed
- [ ] .env files are NOT in repository
- [ ] README.md is complete and accurate
- [ ] LICENSE file is present
- [ ] .gitignore is working correctly
- [ ] Repository description and topics are added
- [ ] Personal information is updated in README
- [ ] No sensitive data is visible in repository
- [ ] Repository is set to public/private as desired

---

**Congratulations! Your MeetSpot project is now on GitHub! 🎉**
