# ExamVault Admin Panel (Web)

Web-based admin panel for **ExamVault** — a Flutter educational exam-prep app.
This admin panel is built with **Next.js 16 + Firebase Firestore** and shares
the same Firebase backend (`examvaultnew`) as the Flutter user app.

> **Architecture:** Admin = Web (this repo) · Users = Flutter app ([titun43/examvault](https://github.com/titun43/examvault))
> Both connect to the **same Firebase Firestore** — content added here appears in the user app in real-time.

---

## ✨ Features

- **Dashboard** — live stats across 10 Firestore collections
- **Categories** — CRUD with image upload, color picker, emoji icon
- **Subjects** — link subjects to categories
- **Tests** — full test series config (duration, marks, difficulty, negative marking, premium)
- **Previous Papers** — year-wise previous year papers (filtered tests)
- **Questions** — 4-option MCQs with correct answer, explanation, image upload
- **Announcements** — 5 types (info/success/warning/error/promo), pin, schedule expiry, image
- **Upcoming Exams** — exam date, application window, notification/syllabus PDFs, tags
- **Banners** — home carousel images with scheduling and order
- **Current Affairs** — date, content, PDF/image upload, important flag, category
- **Users** — search, role upgrade, premium grant, account disable

---

## 🚀 Deploy to Vercel (FREE)

This admin panel is optimized for Vercel deployment. No custom domain needed —
you get a free `*.vercel.app` subdomain.

### Step 1: Push to GitHub (already done)
This repo is at: **https://github.com/titun43/examvault-admin**

### Step 2: Import to Vercel
1. Go to **https://vercel.com** and sign in with GitHub
2. Click **"Add New Project"** → **"Import"** the `titun43/examvault-admin` repo
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./` (default)
5. Build command: `next build` (auto-detected)
6. Output directory: `.next` (auto-detected)
7. **Environment Variables:** (optional — defaults are hardcoded)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
8. Click **"Deploy"** — done in ~60 seconds

### Step 3: First Admin Login
1. Go to **Firebase Console → Authentication → Users → Add User**
   - Email: `admin@examvault.com`
   - Password: (choose a strong one)
2. Go to **Firebase Console → Firestore Database → Rules** and paste the rules from
   [`firestore.rules`](https://github.com/titun43/examvault/blob/main/firestore.rules)
   (from the Flutter repo — both apps share the same rules)
3. Open your Vercel admin URL (e.g. `https://examvault-admin.vercel.app`)
4. Login with `admin@examvault.com` + your password
5. The admin doc is auto-created on first login (bootstrap)

---

## 🛠️ Local Development

```bash
# Install dependencies
bun install   # or: npm install

# Start dev server
bun run dev   # or: npm run dev
# Open http://localhost:3000
```

### Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Backend:** Firebase Firestore + Firebase Auth + Firebase Storage (client SDK)
- **No Prisma / no server-side admin SDK needed** — Firestore security rules enforce admin access via the `admins/{uid}` collection

---

## 🔒 Security Model

- Admin signs in with **email/password** via Firebase Auth
- On sign-in, the app checks if `admins/{uid}` doc exists in Firestore
- Firestore rules: only users with an `admins/{uid}` doc can write to content collections
- For the canonical admin email (`admin@examvault.com`), the app auto-creates the
  `admins/{uid}` doc on first login (bootstrap) — Firestore rules allow this
- All image/PDF uploads go to Firebase Storage with admin-only write rules

See [`firestore.rules`](https://github.com/titun43/examvault/blob/main/firestore.rules)
and [`storage.rules`](https://github.com/titun43/examvault/blob/main/storage.rules)
in the Flutter repo for the full rule set.

---

## 📱 Companion Flutter App

The user-facing app is a Flutter Android app:
- **Repo:** https://github.com/titun43/examvault
- **APK download:** see the `public/` folder or GitHub Actions artifacts
- Content added via this admin panel syncs to the Flutter app in real-time via Firestore `onSnapshot` streams

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (AdminAuthProvider)
│   ├── page.tsx            # Main entry — login or AdminShell
│   └── globals.css
├── components/
│   ├── admin/              # All admin CRUD components
│   │   ├── login.tsx
│   │   ├── admin-shell.tsx # Sidebar + header layout
│   │   ├── dashboard.tsx
│   │   ├── categories.tsx
│   │   ├── subjects.tsx
│   │   ├── tests.tsx
│   │   ├── previous-papers.tsx
│   │   ├── questions.tsx
│   │   ├── announcements.tsx
│   │   ├── upcoming-exams.tsx
│   │   ├── banners.tsx
│   │   ├── current-affairs.tsx
│   │   └── users.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── firebase.ts         # Firebase client SDK init
│   ├── admin-auth.tsx      # Admin auth context + bootstrap
│   ├── admin-firestore.ts  # Firestore CRUD helpers
│   └── store.ts            # Active section state
└── hooks/
```

---

## 🆘 Troubleshooting

**"Invalid email or password" on admin login**
→ The admin user doesn't exist in Firebase Auth yet. Go to Firebase Console → Authentication → Users → Add User (`admin@examvault.com`).

**"Permission denied" errors after login**
→ Firestore rules are out of date. Paste the latest `firestore.rules` from the Flutter repo into Firebase Console → Firestore → Rules.

**Image upload fails**
→ Storage rules are out of date. Paste the latest `storage.rules` from the Flutter repo into Firebase Console → Storage → Rules.

**Changes not appearing in Flutter app**
→ Both apps must point to the same Firebase project (`examvaultnew`). Check `src/lib/firebase.ts` projectId.

---

Built with ❤️ for ExamVault.
