
- ✅ Ganti font size, font family
- ✅ Ganti theme
- ✅ menentukan nama site
- ✅ kasih about, how it works dengan cara bacanya pakai 
- ✅ merapikan ui/ux
- push ke github
- mengubah desain landing page
- SEO
- multi language
- bisa baca text dari TXT
- bisa baca text dari PDF
- bisa baca text dari epub
- bisa baca text dari jpg
- bisa baca text dari png
- fitur auto meningkatkan WPM secara gentle, set min WPM max WPM
- Pasang analytic untuk track visitor
- Pasang database untuk record inputan user
- Pasang ads untuk monetize
- Pasang pricing plan, free berapa kali pakai, sisanya bayar dulu monthly
- Deployment ke vercel
- Pasang domain: fastreading.pro
- iklan: cerita di threads, komen di meme



MASTER PROMPT (WAJIB KIRIM PERTAMA)
Role: You are a senior frontend & product engineer.
Context: I already have a working web-based RSVP speed reading tool.
Existing features:
Input text via paste
Input article via URL
RSVP playback is already working correctly
Goal:
Enhance the product for public launch with:
Monetization readiness (ads + subscription later)
SEO growth
Analytics
Better UX (without breaking RSVP flow)
Rules:
Do NOT refactor existing RSVP logic unless absolutely necessary
Keep everything lightweight and client-side first
Assume deployment on Vercel
Optimize for performance and SEO
I will ask you to implement features one by one.



ANALYTICS (WAJIB, PALING CEPAT ROI)
Prompt Cursor:
Add basic analytics tracking.

Requirements:
- Track page views
- Track reader starts (when RSVP starts playing)
- Track completion (when user finishes reading)
- Track average WPM selected
- Do NOT store raw reading text
- Use Google Analytics or a lightweight analytics alternative
- Make sure analytics does NOT block rendering or RSVP playback

Show me:
- Where to place the tracking
- Event names and parameters
- Minimal code changes



ADS READY (TANPA MERUSAK UX)
Prompt Cursor:
Prepare the app for ads monetization without harming reading UX.

Requirements:
- Ads must NEVER appear inside RSVP reading view
- Add ad placeholder components only (no real ads yet)
- Suggested locations:
  - Landing page
  - Input section
  - After reading summary
- Use responsive containers
- Ensure mobile-friendly placement

Deliver:
- Reusable <AdSlot /> component
- Safe CSS positioning rules
- Comments explaining best ad placement strategy




SHARE & VIRAL FEATURE (FREE TRAFFIC)
Prompt Cursor:
Add a shareable reading summary feature.

Requirements:
- After reading ends, generate a summary:
  - Words read
  - Time spent
  - WPM
- Add "Share Result" button
- Generate share text like:
  "I read 3,200 words in 11 minutes using a speed reading tool"
- Support:
  - Web Share API (mobile)
  - Copy to clipboard fallback

Do NOT:
- Require login
- Store user data




SEO LANDING PAGE (PALING PENTING)
Prompt Cursor:
Create an SEO-friendly landing page for this speed reading tool.

Requirements:
- Target keywords:
  - speed reading online
  - RSVP reader
  - read faster online
- Use semantic HTML
- Ensure fast loading
- Internal link to reader tool

Deliver:
- Page structure
- Suggested copy (can be placeholder text)
- SEO meta tags





PRO FEATURE GATING (TANPA PAYMENT DULU)
Prompt Cursor:
Implement feature gating for future Pro users.

Requirements:
- Free users:
  - Max 400 WPM
- Pro users:
  - Up to 900 WPM
- Do NOT implement payment yet
- Use a simple boolean flag (isPro)
- Gracefully show upgrade prompt when user exceeds limit
- Upgrade prompt must NOT interrupt reading

Deliver:
- Clean gating logic
- UI behavior for free vs pro





LOCAL STORAGE (SMART, TANPA DB)
Prompt Cursor:
Add local storage support for user convenience.

Requirements:
- Save:
  - Last used WPM
  - Last reading mode (URL or text)
- Do NOT store reading content
- Load preferences on page load
- Fail silently if storage unavailable

Deliver:
- Minimal utility functions
- Clear separation of concerns




PERFORMANCE & SAFETY CHECK
Prompt Cursor:
Audit performance and UX safety.

Check:
- RSVP playback FPS
- Memory usage for long texts
- Mobile behavior
- Edge cases (very short or very long texts)

Suggest:
- Any micro-optimizations
- Any UX improvements that DO NOT add complexity



BONUS: PROMPT COPYWRITING CTA
Write 3 short upgrade CTA texts:
- Friendly
- Non-pushy
- Suitable for a reading tool

Tone:
- Calm
- Smart
- Productivity-focused



