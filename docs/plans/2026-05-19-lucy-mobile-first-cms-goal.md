# Left Hand Lucy Mobile-First Visual CMS Goal

> **For Hermes:** execute as a safe branch/preview-only goal. Do not deploy production or push main without Jake approval.

**Goal:** Rebuild the Visual CMS V1 into a polished, phone-first editing experience Lucy can confidently use on iPhone/Safari: login, view the normal site, tap visible text, edit in a clean mobile sheet, save, refresh, inspect revisions, restore, and logout.

**Architecture:** Keep the existing Next.js frontend and Vercel Blob-backed CMS storage. Replace the current cramped overlay/editor with a mobile-first editor system: small unobtrusive admin dock, tap targets, focus mode, bottom-sheet editor, revisions drawer, and explicit success/undo feedback. Preserve the public site design completely for logged-out visitors.

**Tech Stack:** Next.js 14, React client components, existing CMS API routes, Vercel Blob storage, Tailwind CSS, Vercel preview deployments, browser/iPhone-sized QA.

---

## Current mobile UX problems to fix

- Admin toolbar is huge and covers the edit modal/content on iPhone.
- Editor modal is too tall/wide and fights Safari browser chrome.
- Save/Cancel controls sit too low and are partly obscured by the bottom browser bar.
- Formatting controls are oversized and consume more space than the actual editing job needs.
- Font choice is unnecessary for V1 and can make the site visually inconsistent.
- The user does not have a clear “what am I editing?” context once the modal opens.
- The page behind the modal remains visually noisy; Lucy’s face/background distracts from editing.
- Editable outlines around nearby CTAs remain visible and add clutter while the editor is open.
- Revision access is not obvious enough for a non-technical user.
- Success/failure feedback should be clearer than just closing or alerting.

---

## 10-phase test-and-feedback goal

### Phase 1: Mobile baseline and safety check

**Objective:** Establish current branch state, current preview URL, and a repeatable mobile QA baseline before edits.

**Files:** none initially.

**Steps:**
1. Confirm branch is `feature/visual-cms-v1` and working tree is clean.
2. Confirm no production deploy will be run.
3. Pull/read only env presence; do not print secrets.
4. Capture iPhone-size screenshots of logged-out home, `/login`, logged-in editor, revisions, and logout state.
5. Note exact current pain points from screenshots.

**Verification:**
- Public visitor has no CMS controls.
- Existing preview is reachable through Vercel CLI/browser where protection allows.
- Storage API reports Vercel Blob writable on the preview used for final QA.

**Jake/Lucy feedback checkpoint:**
- Send before screenshot + issue list.
- Ask: “Are these the main mobile annoyances, or is there one thing Lucy will hate most?”

---

### Phase 2: Admin dock instead of giant toolbar

**Objective:** Replace the large floating admin bar with a compact phone-friendly dock that never covers the editor.

**Files:**
- Modify: `components/cms/AdminBar.tsx`
- Modify if needed: `components/cms/CmsProvider.tsx`

**Design:**
- Logged-in but not editing: tiny floating “Lucy editor” pill, bottom safe-area aware or top-right compact.
- Editing on: compact status chip + clear exit button.
- Full controls open only after tapping the pill.
- Use `env(safe-area-inset-top/bottom)` padding.
- Minimum 44px tap targets.

**Verification:**
- On 390×844 and 430×932 screenshots, the dock does not cover selected text or editor controls.
- Public logged-out page still has zero admin UI.

**Feedback checkpoint:**
- Test dock collapsed/open on phone screenshot.
- Jake chooses preferred dock position: bottom thumb-zone or top-right small chip.

---

### Phase 3: Tap-to-edit clarity layer

**Objective:** Make edit mode obvious without making the site look broken.

**Files:**
- Modify: `components/cms/EditableText.tsx`
- Maybe add: `components/cms/EditHint.tsx`

**Design:**
- Subtle purple dotted outline only on tap/hover/focus, not heavy outlines everywhere.
- Add small “Tap text to edit” helper chip when edit mode first turns on.
- Highlight only the tapped/current block strongly.
- Avoid showing edit controls over CTA buttons unless selected.

**Verification:**
- Lucy can visually tell what is editable.
- The normal design still looks like Lucy’s site, not a dev overlay.
- Tap targets are usable on mobile.

**Feedback checkpoint:**
- Send screenshots with edit mode off/on/currently selected.

---

### Phase 4: Replace modal with mobile bottom-sheet editor

**Objective:** Build a dedicated bottom sheet that feels native on iPhone/Safari.

**Files:**
- Modify: `components/cms/EditableText.tsx`
- Create: `components/cms/MobileTextEditor.tsx`
- Create if useful: `components/cms/editor-utils.ts`

**Design:**
- Bottom sheet, not centered overlay, on mobile.
- Header: “Editing: Hero mobile intro” + close.
- Large plain textarea/content area at top.
- Sticky footer above safe area with Save and Cancel fully visible.
- Background page dimmed/frozen while editing.
- Auto-scroll selected text into view before opening sheet.

**Verification:**
- Save/Cancel are never hidden by Safari address/navigation bars.
- Keyboard open/close does not trap the user.
- Editor can handle short CTA text and longer paragraphs.

**Feedback checkpoint:**
- Jake reviews screenshot with keyboard closed and one with keyboard open if possible.

---

### Phase 5: Simplify formatting for V1

**Objective:** Remove risky/cluttered rich formatting and keep only what Lucy needs.

**Files:**
- Modify: `components/cms/MobileTextEditor.tsx`
- Modify: `lib/cms/rich-text.ts` if keeping richTextLite sanitization.

**Design:**
- Default V1 mode: plain text for most site copy.
- Optional “Formatting” disclosure for Bold/Italic only if needed.
- Remove font selector from mobile V1; it risks damaging design consistency.
- Preserve existing site typography automatically.

**Verification:**
- Saved copy renders with original site styles.
- No weird font spans injected.
- Sanitizer rejects unsafe HTML.

**Feedback checkpoint:**
- Confirm with Jake: “Do we keep V1 copy-only, or allow Bold/Italic behind Advanced?”

---

### Phase 6: Save feedback, undo, and readback confidence

**Objective:** Make saving feel reliable and human-friendly.

**Files:**
- Modify: `components/cms/CmsProvider.tsx`
- Modify: `components/cms/MobileTextEditor.tsx`
- Create: `components/cms/CmsToast.tsx`

**Design:**
- Save button states: Saving… → Saved ✓.
- Toast: “Saved. Refresh checked.”
- After save, perform a fresh GET readback from `/api/cms/content`.
- Offer quick “Undo” using newest revision for 10–20 seconds.
- Clear errors: “Couldn’t save — storage is read-only” or “Session expired — log in again.”

**Verification:**
- Save creates revision.
- Fresh readback equals saved value.
- Refresh page: value persists.
- Error state is readable and not a browser alert where possible.

**Feedback checkpoint:**
- Jake tests one safe text edit and confirms feedback feels trustworthy.

---

### Phase 7: Revisions drawer redesigned for phone

**Objective:** Make revisions understandable and restorable without technical labels.

**Files:**
- Modify: `components/cms/RevisionPanel.tsx`
- Maybe create: `components/cms/RevisionCard.tsx`

**Design:**
- Bottom/full-height drawer on mobile.
- Human labels: “Current”, “Previous version”, “Restored”.
- Show timestamps in plain language.
- Compare old/new with readable cards.
- Restore button says “Restore this version”.
- Confirmation explains: “This will make this text live again and save a new revision.”

**Verification:**
- Revision list opens from editor and selected text.
- Restore persists after refresh.
- Restore creates a new revision.

**Feedback checkpoint:**
- Jake checks if Lucy would understand the revision wording.

---

### Phase 8: Full auth/session/mobile flow QA

**Objective:** Verify Lucy’s complete real-world phone journey.

**Files:**
- Add optional QA script: `scripts/qa-cms-preview-flow.js` or document commands.

**Checklist:**
1. `/login` loads on mobile.
2. Wrong password fails safely.
3. Correct password starts session.
4. Admin lands on normal frontend.
5. Edit mode toggles.
6. Tap visible text opens editor.
7. Save persists after refresh.
8. Revisions show saved edit.
9. Restore old revision persists after refresh.
10. Logout removes admin UI and write access.
11. Logged-out public visitor sees clean site.

**Verification:**
- Manual browser/mobile screenshots.
- HTTP/API checks for protected writes returning 401 logged out.
- No secrets printed.

**Feedback checkpoint:**
- Jake gets a concise “phone journey passed/failed” report.

---

### Phase 9: Preview deployment and back-and-forth acceptance loop

**Objective:** Ship only to preview and iterate until the phone UX is genuinely usable.

**Files:** any final polish files.

**Steps:**
1. Run `npm test`.
2. Run `npx tsc --noEmit`.
3. Run `npm run build`.
4. Deploy preview only with `vercel deploy --yes --scope anyos`.
5. Smoke-check preview `/`, `/login`, CMS content API, save/readback/restore.
6. Send preview URL and screenshots.
7. Collect Jake feedback.
8. Apply 1–2 polish rounds on branch only.

**Verification:**
- Preview deployment is Ready.
- No production promotion.
- Final preview has verified Vercel Blob writable storage.

**Feedback checkpoint:**
- Jake explicitly approves either “good enough for Lucy to test” or lists changes.

---

### Phase 10: Final handoff package for Lucy

**Objective:** Give Lucy a simple, non-technical CMS usage guide and clear launch status.

**Files:**
- Create: `docs/lucy-cms-quick-guide.md`
- Optional: screenshots in `docs/assets/` if wanted.

**Guide should include:**
- Go to `/login`.
- Enter password.
- Tap “Edit site”.
- Tap text.
- Edit text.
- Save.
- Open revisions.
- Restore if needed.
- Logout.
- What not to edit yet.

**Verification:**
- Guide matches final UI labels exactly.
- Jake receives final status:
  - done / preview URL / what works / blockers / next step
  - explicit production status: preview-only, not live on production unless approved.

**Feedback checkpoint:**
- Jake approves Lucy handoff or requests one more polish pass.

---

## Definition of done

- Lucy can complete the entire flow on iPhone/Safari without zooming, hunting, or hidden controls.
- Public visitors see no CMS/admin UI.
- Existing site design is preserved.
- Vercel Blob storage is writable on preview.
- Save, refresh persistence, revisions, restore, logout all verified.
- No production deploy or main push without Jake approval.
- Final report includes: done / preview URL / what works / blockers / next step.
