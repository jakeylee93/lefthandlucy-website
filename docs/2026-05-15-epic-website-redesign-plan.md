# Left Hand Lucy Epic Website Redesign Plan

> **For Hermes:** Use subagent-driven-development skill if this becomes a larger implementation sprint.

**Goal:** Replace the current poor WordPress presence with a premium Vercel website for Left Hand Lucy that reflects Lucy's actual notes, keeps the warmth of her existing brand, and makes the offer clear: project support, English lessons, and events/experiences in Madrid.

**Architecture:** Keep the current Next.js app on Vercel, redesign in phases on a branch, use preview deploys before production, then point the real domain `lefthandlucy.com` to the Vercel site only after Jake/Lucy approve the new version.

**Tech Stack:** Next.js 14 app router, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide icons, Vercel, GitHub.

---

## Confirmed project details

- Current Vercel live URL: `https://lefthandlucy-website.vercel.app`
- Current WordPress/domain URL: `https://lefthandlucy.com/freelancer-home/`
- Future goal: replace the WordPress domain with the approved Vercel build.
- Vercel project: `lefthandlucy-website`
- Vercel project id: `prj_5Lzp4FfH0STCD1h1UMdA8DNvTlSq`
- Vercel org/team id: `team_eLHrVgR7hkY4PM3MKhhGgK2B`
- GitHub repo: `https://github.com/jakeylee93/lefthandlucy-website.git`
- Local path: `/Users/margaritabot/.openclaw/workspace/site-backups/lefthandlucy-website`
- Current branch: `main`
- Latest local commit: `351c02d fix: services back to 3-column grid, clean cards, no alternating layout mess`
- Latest inspected production deployment: `https://lefthandlucy-website-6e559lfee-anyos.vercel.app`
- Build command verified: `npm run build`
- Build status on 2026-05-15: passing

---

## Important lessons from earlier LHL work

- Jake disliked the previous messy/stacked redesign.
- Do not push big visual changes straight to production.
- Keep services in a clean 3-column desktop layout.
- Preview deploy first, share screenshots/link, then promote only after approval.
- Avoid making the site feel random/template-like.

---

## Lucy's notes extracted from screenshots

### Global wording / positioning

Use:

> **A steady hand for life's busy corners.**

Use this intro line:

> I'm Lucy - an experienced multilingual Executive Assistant, qualified teacher, event planner and organiser based in Madrid. I help people learn, connect and get things done.

Use this welcome/about copy as the basis for Meet Lucy:

> Welcome to Left Hand Lucy  
> I'm glad you found me!
>
> "Another string to your bow" is something I've heard often over the years, and it perfectly sums up my journey.
>
> I've built a varied career supporting High Net Worth Executives, teaching English as a Foreign Language to children and adults in Madrid, creating memorable events, and building strong connections along the way.
>
> Left Hand Lucy grew from a desire to bring together the things I enjoy most: supporting people with their personal and professional projects, helping others build confidence through English lessons, and creating meaningful events and experiences that bring people together.
>
> I'm confident working across different kinds of projects, adapting to what's needed, and being a reliable and discreet extra pair of hands behind the scenes.

### Navigation / section labels

- The current `FAQ` nav points to the about section. Rename it to **Meet Lucy**.
- Add a proper **FAQs** section later if needed.
- Move **IN PERSON. VIRTUAL. FLEXIBLE.** above **How I can help** in the services section.
- Remove **What I Do**.
- Change **Adaptable** to **Flexible** in the top strapline.

### CTA wording

- Use **Let's talk?** as the button style where appropriate.
- In contact section, use **Let's talk about how I can help**.
- Avoid **need** in the contact heading/message copy where Lucy specifically objected to it.

### Role / badge buttons Lucy likes

Keep/add small pill buttons like:

- Event Planner
- Qualified Teacher
- Executive Assistant
- Multilingual
- Madrid-based
- In person / virtual / flexible

### Project Support copy

Use this as the primary Project Support text:

> Let Lucy take care of the to-do list. From inboxes and schedules to research and organisation, I offer support that helps keep things moving.
>
> I enjoy getting involved in different projects and helping bring ideas to life - offering calm, adaptable support wherever it's needed.

List items:

- Email & inbox management
- Calendar & scheduling
- Research & analysis
- Task coordination & deadlines
- Document preparation
- Travel arrangements
- & more

Note: keep Lucy's phrasing, but consider changing `adaptable` to `flexible` only if consistent with her earlier wording request.

### English Lessons copy

Use this as the primary English Lessons text:

> Whether you want to improve conversation, writing or professional communication, I adapt lessons to your goals, pace and learning style. The lessons are designed to be enjoyable and help build confidence.

List items:

- Conversational English
- Business & professional English
- Children lessons
- Exam preparation
- Pronunciation & accent coaching

Potential polish: `Children lessons` may become `Children's lessons` or `Lessons for children`, but confirm before changing if we want to preserve Lucy's exact phrasing.

### Events & Experiences copy

Use this as the primary Events & Experiences text:

> Whether you're planning an event or visiting Madrid for the first time, I offer personal support to help everything run smoothly from start to finish.
>
> From curated city experiences to social gatherings and event coordination, I take care of the details so you can enjoy the moment.

List items:

- Venue sourcing & coordination
- Madrid experiences & local recommendations
- Concierge support for visitors
- Group events & social gatherings
- Restaurant & activity bookings
- On-the-day coordination

### Hero image note

Lucy asked whether the top image can be like the old website where you can only see her teeth.

Actionable interpretation:

- She is referencing the old WordPress image/crop and its personality.
- We should inspect/reuse the old Lucy assets if helpful, but not repeat the bad accidental crop exactly without approval.
- Better direction: use the old image as inspiration for warmth/smile/personality, but make the crop look intentional and premium.
- Avoid cutting off her face awkwardly unless Jake/Lucy explicitly want that exact playful crop.

---

## Current site diagnosis

### What works

- Good bones: warm personal brand, soft palette, Lucy portrait, simple nav.
- Clear three-service structure: Project Support, English Lessons, Events & Experiences.
- Multi-language content already exists for EN/ES/FR/DE.
- Contact form opens mailto to `Lucy@lefthandlucy.com`.
- Site builds cleanly with Next.js.

### What needs improvement

- The current Vercel design still feels pleasant but not premium enough.
- The WordPress site is poor and has unfinished content like `huh?` / `whatis this`.
- The current Vercel hero needs better editorial crop and copy hierarchy.
- First services area should not feel empty or over-spaced.
- The VR/video background for Conectados feels disconnected from Madrid social events.
- Testimonials are likely placeholder/fake-sounding and should be replaced, removed, or clearly neutralised.
- Contact area needs stronger conversion copy, real WhatsApp or no WhatsApp, and response expectations.
- Current WhatsApp href is placeholder-like: `https://wa.me/message`.
- No dedicated service pages yet, so SEO and conversion depth are limited.

---

# Phase plan

## Phase 0 — Branch, backup and domain safety

**Objective:** Make sure we can work safely and do not break either the Vercel site or current domain.

**Tasks:**

1. Create a branch, e.g. `lhl/epic-redesign-phase1`.
2. Confirm current Vercel production still works.
3. Save screenshots of current Vercel and old WordPress page.
4. Do not touch DNS/domain yet.
5. Keep WordPress live until Vercel replacement is approved.

**Verify:**

- `git status --short --branch`
- `npm run build`
- Vercel preview only, no production alias/domain change.

---

## Phase 1 — Content lock from Lucy's notes

**Objective:** Replace generic copy with Lucy's actual words.

**Files:**

- Modify: `app/translations.ts`
- Modify: `app/page.tsx` if some copy is hard-coded.

**Tasks:**

1. Update hero strapline to `A steady hand for life's busy corners.`
2. Add intro sentence: multilingual Executive Assistant, qualified teacher, event planner and organiser based in Madrid.
3. Rename nav `FAQ` to `Meet Lucy`.
4. Remove `What I Do` label from services.
5. Put `IN PERSON. VIRTUAL. FLEXIBLE.` above `How I can help`.
6. Change `Adaptable` to `Flexible` in visible top positioning.
7. Change contact heading to `Let's talk about how I can help`.
8. Remove `need` wording from contact copy where practical.

**Acceptance:**

- Lucy's notes are visibly reflected on the page.
- No confusing `FAQ` link to About.
- No accidental generic wording replacing Lucy's phrases.

---

## Phase 2 — Stabilise links/forms/tests

**Objective:** Fix obvious trust blockers before major visual work.

**Files:**

- Create: `scripts/test-left-hand-lucy-content.js`
- Modify: `package.json`
- Modify: `app/page.tsx`

**Tasks:**

1. Add content test for key copy and sections.
2. Check no placeholder WhatsApp link remains.
3. Either set a real WhatsApp link or hide WhatsApp until Jake/Lucy provide it.
4. Improve mailto subject/body to use `Let's talk about how I can help`.
5. Add response expectation: `I usually reply within 1-2 working days.`

**Verify:**

- `npm test` if added.
- `npm run build`.

---

## Phase 3 — Premium hero redesign

**Objective:** Make the first screen feel like a real premium personal brand, not a template.

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Use assets in `public/images/`.

**Design direction:**

- Use Lucy's old-site warmth/smile as inspiration.
- Prefer full-face or intentional editorial crop.
- Avoid accidental `only teeth` crop unless explicitly approved.
- Split layout on desktop: copy/card left, image right or image background with clear text panel.
- Add role pills: Executive Assistant, Multilingual, Qualified Teacher, Event Planner.
- Primary CTA: `Let's talk?`
- Secondary CTA: `How I can help` or `Meet Lucy`.

**Acceptance:**

- Hero says what Lucy does in 5 seconds.
- Image crop feels intentional.
- Mobile hero looks clean.

---

## Phase 4 — Three premium service cards

**Objective:** Make the services clear, attractive and conversion-focused.

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/translations.ts`

**Structure:**

1. Strapline: `IN PERSON. VIRTUAL. FLEXIBLE.`
2. Heading: `How I can help`
3. Three cards in desktop columns:
   - Project Support
   - English Lessons
   - Events & Experiences
4. Use Lucy's copy from WhatsApp.
5. Keep bullet lists visible.
6. Add card-level CTAs:
   - `Ask about project support`
   - `Book an English lesson`
   - `Plan an event or Madrid experience`

**Acceptance:**

- Always 3 columns on desktop.
- No stacked mess on desktop.
- Cards have enough text but do not feel cluttered.

---

## Phase 5 — Meet Lucy section

**Objective:** Replace generic About with Lucy's real story.

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/translations.ts`

**Tasks:**

1. Section id should be `meet-lucy`.
2. Nav label should be `Meet Lucy`.
3. Use heading:
   - `Welcome to Left Hand Lucy`
   - `I'm glad you found me!`
4. Use the `Another string to your bow` story.
5. Include badges:
   - Executive Assistant
   - Multilingual
   - Qualified Teacher
   - Event Planner
   - Madrid-based
6. Add CTA: `Let's talk?`

**Acceptance:**

- The section feels personal and real.
- It does not read like AI/template copy.

---

## Phase 6 — Events/Conectados visual rebuild

**Objective:** Make community/events feel Madrid/social rather than random stock/VR.

**Files:**

- Modify: `app/page.tsx`
- Replace or remove external Pexels video.

**Tasks:**

1. Remove or replace the VR-looking video background.
2. Use warmer Madrid/event imagery if available.
3. Add chips:
   - Madrid experiences
   - Local recommendations
   - Restaurant bookings
   - Food walks
   - Wine socials
   - Group events
4. Decide whether Conectados is:
   - a separate linked project, or
   - integrated into Events & Experiences.

**Acceptance:**

- Section visually matches Lucy's brand.
- No random stock-video feeling.

---

## Phase 7 — Testimonials / proof cleanup

**Objective:** Avoid fake-sounding social proof.

**Tasks:**

1. Ask Jake/Lucy for real testimonials if available.
2. If no real testimonials, replace with a `How I work` section instead of fake names.
3. Possible `How I work` steps:
   - Listen
   - Organise
   - Support
   - Follow through
4. If testimonials remain, make them neutral and believable or mark as service examples.

**Acceptance:**

- No obviously fake names/testimonials.
- Trust increases, not decreases.

---

## Phase 8 — Contact conversion polish

**Objective:** Make enquiries easier and warmer.

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/translations.ts`

**Tasks:**

1. Heading: `Let's talk about how I can help`.
2. Message placeholder should avoid `need`; use something like:
   - `Tell me a little about what you're working on, planning, or hoping to improve...`
3. Keep service chips.
4. Include expected reply time.
5. Include real WhatsApp if available, otherwise remove WhatsApp card.
6. Improve mailto body to include name/email/service/message.

**Acceptance:**

- Contact feels warm and premium.
- No broken placeholder contact paths.

---

## Phase 9 — Mobile-first polish

**Objective:** Ensure the site looks excellent on phone, because Lucy/Jake are reviewing on mobile.

**Tasks:**

1. Test iPhone viewport.
2. Check hero crop.
3. Check services stack cleanly on mobile.
4. Check buttons are tappable.
5. Check language selector doesn't crowd header.
6. Check contact form is readable.

**Verify:**

- Browser mobile screenshot.
- Vercel preview mobile inspection.

---

## Phase 10 — Multi-language strategy

**Objective:** Keep multilingual feature without introducing stale/bad translations.

**Tasks:**

1. Update English first.
2. Decide whether to temporarily keep only English live while copy is approved.
3. Then update Spanish/French/German carefully.
4. Check service words and CTAs in each language.
5. Avoid old text persisting in other languages.

**Acceptance:**

- Language switcher does not show outdated copy.

---

## Phase 11 — SEO and metadata

**Objective:** Make the replacement domain useful for search.

**Files:**

- Modify: `app/layout.tsx`
- Possibly add service pages later.

**Tasks:**

1. Update title and description.
2. Add Open Graph metadata.
3. Add keywords through natural page copy:
   - English lessons Madrid
   - Executive Assistant Madrid
   - Project support Madrid
   - Event planning Madrid
   - Madrid experiences
   - Personal concierge Madrid
4. Add real canonical domain once DNS migration is complete.

**Acceptance:**

- Search/social preview looks professional.

---

## Phase 12 — Service pages, only after homepage approval

**Objective:** Add depth without overbuilding before direction is approved.

**Potential routes:**

- `/project-support`
- `/english-lessons-madrid`
- `/events-experiences-madrid`
- `/meet-lucy`
- `/contact`

**Tasks:**

1. Build each page from homepage components.
2. Add service-specific CTA.
3. Add FAQs per service.
4. Add internal links.

**Acceptance:**

- Homepage stays clean, pages carry detail/SEO.

---

## Phase 13 — Preview deployment and Jake/Lucy review

**Objective:** Get visual approval before production.

**Tasks:**

1. Deploy preview from branch.
2. Send Jake preview link.
3. Send desktop and mobile screenshots.
4. Collect corrections from Jake/Lucy.
5. Apply corrections on branch.
6. Rebuild and redeploy preview.

**Acceptance:**

- Jake explicitly approves preview before production.

---

## Phase 14 — Production Vercel deploy

**Objective:** Promote approved version to the Vercel production URL.

**Tasks:**

1. Merge branch to main.
2. Run `npm run build`.
3. Deploy to Vercel production.
4. Verify `https://lefthandlucy-website.vercel.app`.
5. Commit and push.

**Acceptance:**

- Vercel production site is approved and working before DNS/domain change.

---

## Phase 15 — Domain migration from WordPress to Vercel

**Objective:** Replace the poor WordPress site with the approved Vercel website on the real domain.

**Tasks:**

1. Identify where `lefthandlucy.com` DNS is managed.
2. Add domain to Vercel project if not already added.
3. Configure apex/root and `www` records per Vercel instructions.
4. Ensure SSL certificate is issued.
5. Set canonical domain.
6. Verify:
   - `https://lefthandlucy.com`
   - `https://www.lefthandlucy.com`
   - redirect behaviour.
7. Keep WordPress backup/export available before switching.

**Acceptance:**

- Real domain serves approved Vercel site.
- SSL works.
- WordPress no longer appears publicly on main domain.

---

## Phase 16 — Post-launch QA and cleanup

**Objective:** Catch launch issues quickly.

**Tasks:**

1. Test all nav links.
2. Test language switcher.
3. Test contact mailto.
4. Test mobile layout.
5. Test social preview.
6. Check for old WordPress paths that need redirects.
7. Make a small post-launch fixes branch if needed.

---

## Phase 17 — Future upgrades

Optional later upgrades:

- Real form backend instead of mailto.
- Booking/calendar integration.
- Proper WhatsApp click-to-chat.
- Blog/resources for English learners or Madrid experiences.
- Gallery/events page for Conectados.
- Analytics.
- Cookie/privacy policy if needed.

---

## Immediate next action

Start Phase 0-2 on a new branch:

1. Create branch.
2. Add content tests.
3. Apply Lucy's wording fixes.
4. Fix nav/contact/placeholders.
5. Build.
6. Preview deploy.
7. Share preview link and screenshots before any production/domain changes.

---

## Go / No-Go

**GO:** branch-based redesign, copy fixes, tests, preview deploy.

**NO-GO:** changing `lefthandlucy.com` DNS/domain, replacing WordPress publicly, or deploying a major redesign to production before Jake/Lucy approve the preview.
