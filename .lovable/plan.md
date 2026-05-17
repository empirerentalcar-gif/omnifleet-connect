## Bilingual (EN/ES) support with react-i18next

This is a large change touching virtually every page and component. I'll execute it in a structured way, but want to flag scope realities up front so we agree on what ships in this pass vs. follow-ups.

### What I'll do in this pass

**1. Infrastructure**
- Install `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Create `src/i18n/index.ts` config:
  - Detection order: `localStorage` → `navigator` → fallback `en`
  - Cache to `localStorage` under key `zuvio-lang`
  - Supported: `en`, `es`; fallback `en`
- Import in `src/main.tsx` so it initializes before render
- Create `src/i18n/locales/en.json` and `es.json` with a namespaced structure:
  ```
  common, nav, footer, home, search, vehicle, booking,
  auth, dashboard, agencies, pricing, faq, about, blog, errors
  ```

**2. Language toggle**
- New `src/components/LanguageToggle.tsx`: pill-shaped `EN | ES` toggle, dark navy bg, teal (#1adfb0) active, muted inactive, no reload (just `i18n.changeLanguage` + localStorage persist)
- Mounted in `Header.tsx` desktop bar (left of CTA) and inside the mobile menu

**3. Routing cleanup**
- Remove `/buscar` route from `App.tsx`
- Remove the `lang` prop branch and Spanish translation map from `SearchResults.tsx` — Spanish now comes from i18n like everywhere else

**4. Translation coverage in this pass**
Fully wired through `useTranslation`:
- `Header` (nav links, CTAs, auth buttons)
- `Footer` (links, legal, copyright, Team Login)
- Home page sections: `Hero`, `HowItWorks`, `ProblemSolution`, `SocialProof`, `TrustSection`, `FinalCTA`, `PopularDestinations`, `CityExpansion`, `Comparison`, `OwnerCTA`, `RentalCTA`, `AgencyCTA`, `WhoThisIsFor`, `TrustBadges`
- Core pages: `SearchResults`, `VehicleDetail` (shell text — labels, buttons, drawer), `ReserveRequest`, `ReservationConfirmed`, `SignIn`, `SignUp`, `ResetPassword`, `Pricing`, `FAQ`, `About`, `HowItWorksPage`, `ForAgencies`, `OwnerBenefits`, `NotFound`, `Cities`, `CityLandingTemplate`, `PrivacyPolicy`, `TermsOfService`, `CancellationPolicy`
- `SEO` titles/descriptions wired to translated strings on each page

**5. Spanish copy — Miami Cuban tone**
Per your glossary: `rentar`, `carro`, `agencia`, `Empieza ahora`, `Buscar`, `Reserva ya`, `Saber más`, `Regístrate`, `Registra tu agencia`. Conversational, warm, direct. No Spain-isms.

### What I'm flagging as out of scope for this pass

- **Blog post bodies** (`src/lib/blog-data.ts` and any long-form article content): translating full articles is a content task, not a UI task. I'll translate blog index labels, card metadata, and section chrome, but the article bodies themselves will remain in English until you provide Spanish article copy. Blog posts will fall back gracefully.
- **Admin pages** (`/admin/*`, `AdminDashboard`, `AdminAgencies`, `AdminInviteCodes`, `AdminSetup`, `AdminReservations`, `OwnerDashboard` internals): internal tools used only by you/staff. I'll leave them English-only unless you want them translated.
- **Turo-host landing** (`ForTuroHosts` + `src/components/turo/*`) and **city landings** (`Miami/Houston/LasVegas/LosAngeles/NewYork/Phoenix Landing`): these are highly copy-heavy marketing pages. I'll wire `CityLandingTemplate` (shared shell) and the Turo page chrome, but individual city/Turo marketing paragraphs are large enough that I'd rather translate them in a focused follow-up so you can review the Spanish marketing voice for each city.
- **Email templates / edge functions**: no UI text; left alone per your "no business logic" rule.

If you want any of the above included in this pass, tell me which and I'll fold them in.

### Technical details

- Keys use dot.notation, e.g. `t('nav.findRentals')`, `t('home.hero.title')`. Interpolation for dynamic values: `t('search.resultsCount', { count })`.
- `LanguageToggle` calls `i18n.changeLanguage(next)` — `i18next-browser-languagedetector` with `caches: ['localStorage']` handles persistence automatically.
- `<html lang>` updated on language change via an effect in `App.tsx` for SEO/a11y.
- No changes to: design tokens, layout, routing (except removing `/buscar`), Supabase calls, booking logic, search logic, Stripe, RLS, or any data flow.

### Confirm before I start

Reply "go" to proceed as described, or tell me which of the out-of-scope items (blog bodies, admin, Turo, city landings) you want included now.