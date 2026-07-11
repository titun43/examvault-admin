# 📋 Working Protocol — ExamVault Projects

**Created:** Jul 11, 2026
**Owner:** Boss (titun43)
**Assistant:** Z.ai Code

---

## 🎯 Core Workflow Rules

### ১. Problem Verification First
- User যখন কোনো problem বলবে → প্রথমে সেটা **verify করব** (code পড়ে, reproduce করে)
- User কে confirm করব: "হ্যাঁ, এই problem টা আছে" বা "না, এই problem টা নেই"
- তারপরই fix শুরু করব

### ২. Fix → Comment → Wait (NO auto-push for user app)
Problem fix করার সময়:
1. Code change করব
2. **Comment যোগ করব** code এ (যেন পরে বোঝা যায় কী change হয়েছে এবং কেন)
3. ⚠️ **Push করব না** — শুধু local এ রাখব
4. User যখন explicitly বলবে "push করো" → তখন push করব

### ৩. Repo-specific Push Rules

| Repo | Path | Push Rule |
|---|---|---|
| **examvault** (Flutter user app) | `/home/z/work/examvault` | ❌ **NO auto-push** — wait for user's explicit instruction |
| **examvault-admin** (Next.js admin panel) | `/home/z/work/examvault-admin` | ✅ **Auto-push OK** — push log by log |

### ৪. Why User App Repo Has Special Rule
- `examvault` repo তে GitHub Actions workflow configured
- প্রতিটা push এ workflow run হয় (build APK + AAB)
- তাই একসাথে কয়েকটা fix করে তারপর একবার push করতে হবে
- এতে build resources নষ্ট হয় না, এবং clean build history থাকে

---

## 🔄 Standard Task Flow

```
User: "এই problem টা আছে"
        ↓
Me: Verify করি (code পড়ে, test করে)
        ↓
Me: "হ্যাঁ problem টা আছে — কারণ [reason]"
        ↓
Me: Fix করি + code এ comment যোগ করি
        ↓
Me: User কে বলি "Fix করা হয়ে গেছে, push করব?"
        ↓
User: "হ্যাঁ push করো" (বা "আরেকটা কাজ আছে, আগে সেটা করো")
        ↓
Me: 
  - যদি examvault repo হয় → wait for explicit push instruction
  - যদি examvault-admin repo হয় → push immediately, log by log
```

---

## 📝 Comment Style Guide

Code এ comment যোগ করার সময় এই format অনুসরণ করব:

```dart
// =============================================================================
// FIX: [problem short description]
// Date: [YYYY-MM-DD]
// Reason: [why this change was needed]
// =============================================================================
```

Example:
```dart
// =============================================================================
// FIX: Payment verification failing when signature mismatch
// Date: 2026-07-11
// Reason: Razorpay webhook signature check was blocking recovery flow.
//         Now using Razorpay API confirmation as fallback when signature fails.
// =============================================================================
```

---

## 📂 Project Locations

| Project | Path | Type |
|---|---|---|
| ExamVault User App | `/home/z/work/examvault` | Flutter (mobile) |
| ExamVault Admin Panel | `/home/z/work/examvault-admin` | Next.js (web) |
| Sandbox Project (my-project) | `/home/z/my-project` | Next.js (sandbox) |

---

## ⚠️ Important Notes

1. **Production form review** এখনও pending (submitted Jul 10, ~৭ দিন) — এটা আলাদা, development এ কোনো প্রভাব নেই
2. **Closed Testing - Alpha** খোলা আছে — user app এর নতুন version Alpha তে upload করা যায়
3. **AAB v1.51.0+77** ready — production approve হলে Alpha থেকে promote করা যাবে
4. User app repo push এর আগে অবশ্যই ব্যবহারকারীর confirmation নেওয়া আবশ্যক

---

## 🎯 Quick Checklist (প্রতিটা task এর জন্য)

- [ ] Problem verify করেছি?
- [ ] User কে confirm করেছি?
- [ ] Fix করেছি?
- [ ] Code এ comment যোগ করেছি?
- [ ] Repo check:
  - examvault → push এর জন্য অপেক্ষা করছি?
  - examvault-admin → push করে দিয়েছি log by log?
- [ ] Worklog update করেছি?

---

**Last updated:** Jul 11, 2026
**Protocol version:** 1.0
