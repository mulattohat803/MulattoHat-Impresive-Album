# ImpresiveMC — NEURAL//GRID
**Album website. Underground Hip-Hop. Built for GitHub Pages.**

---

## 🚀 How to Host on GitHub Pages (Step by Step)

### Step 1 — Create a GitHub account
If you don't have one: https://github.com/signup (free)

### Step 2 — Create a new repository
1. Go to https://github.com/new
2. Name it **exactly**: `impresivemc` (or whatever you want — just remember it)
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload your files
**Option A — Drag & Drop (easiest):**
1. Open your repo on GitHub
2. Click **"uploading an existing file"** link
3. Drag your entire project folder contents in
4. Click **Commit changes**

**Option B — Git (recommended for future updates):**
```bash
git init
git add .
git commit -m "Launch ImpresiveMC site"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/impresivemc.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. Left sidebar → **Pages**
3. Under **Source**, select: **Deploy from a branch**
4. Branch: **main** / Folder: **/ (root)**
5. Click **Save**

### Step 5 — Your site is live!
After ~1 minute, your site will be at:
```
https://YOURUSERNAME.github.io/impresivemc/
```

---

## ✏️ How to Edit Your Album Info

### Change track names, features, durations:
Open `js/tracks.js` — it's the only file you need to edit for music info.

```js
{
  num:  1,
  name: "YOUR TRACK NAME",   // ← Track title
  feat: "ft. ARTIST NAME",   // ← Featured artist (or "" for none)
  dur:  "3:42",              // ← Duration M:SS
  tag:  "fire",              // ← "fire" | "new" | "feat" | ""
  file: "audio/track01.mp3", // ← Audio file path (or "" if no audio yet)
},
```

### Add real audio files:
1. Create a folder called `audio/` in your project
2. Put your .mp3 files in there
3. Update the `file:` field in each track in `tracks.js`

```js
file: "audio/neural-override.mp3",
```

### Update social links:
Also in `js/tracks.js`, scroll to the bottom:
```js
const SOCIALS = {
  spotify:    "https://open.spotify.com/artist/YOURID",
  soundcloud: "https://soundcloud.com/impresivemc",
  instagram:  "https://instagram.com/impresivemc",
  twitter:    "https://twitter.com/impresivemc",
  youtube:    "https://youtube.com/@impresivemc",
};
```

### Update contact email:
In `index.html`, search for `booking@impresivemc.com` and replace it.

---

## 📁 File Structure

```
impresivemc/
├── index.html          ← Main page (structure)
├── css/
│   └── style.css       ← All styling
├── js/
│   ├── tracks.js       ← YOUR ALBUM DATA (edit this!)
│   └── main.js         ← All logic (visualizer, player, intro)
├── audio/              ← Create this folder, add your .mp3 files
│   └── (your tracks)
└── README.md           ← This file
```

---

## 🔄 Updating the Site After Launch

1. Edit your files locally
2. Go to GitHub → your repo → navigate to the file
3. Click the pencil (edit) icon
4. Make changes → **Commit changes**

Or if using Git:
```bash
git add .
git commit -m "Update track list"
git push
```
Changes go live in ~30 seconds.

---

## 🎨 Customizing the Design

- **Colors**: Edit CSS variables at the top of `css/style.css` (`:root` block)
- **Album title**: Change `NEURAL//GRID` in `js/tracks.js` (`ALBUM.title`)
- **Artist name**: Change `IMPRESIVE_MC` in `js/tracks.js` (`ALBUM.artist`)
- **Intro animation**: Tweak timing in `js/main.js` — search for `4500` (ms before auto-launch)

---

## 🌐 Custom Domain (Optional)

Want `www.impresivemc.com` instead of `github.io/...`?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In your repo → Settings → Pages → **Custom domain**
3. Type your domain and save
4. In your domain registrar, add a CNAME record pointing to `YOURUSERNAME.github.io`

---

Built with zero dependencies. Pure HTML/CSS/JS. Hosts free on GitHub Pages forever.
