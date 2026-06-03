# Unit 18 Dark Theme And Mobile QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve dark-theme token consistency and mobile layout stability for the existing AssetFlow AI MVP screens.

**Architecture:** Keep the existing FSD structure. Shared visual primitives own semantic UI token usage, widgets own app shell/header/sidebar responsiveness, and feature panels receive only narrow class/layout fixes. No new domain behavior is introduced.

**Tech Stack:** React 19, TypeScript, Vite, React Router v7, Jotai, Tailwind v4, Vitest, React Testing Library.

---

## File Map

- Modify: `src/apps/styles/index.css` — add semantic success/warning-style tokens only if needed for dark-safe status colors.
- Modify: `src/shared/ui/FieldMessage.tsx` — replace hardcoded red/green classes with token-based status classes.
- Modify: `src/shared/ui/ErrorState.tsx` — replace hardcoded red class with destructive token.
- Modify: `src/widgets/app-shell/ui/AppShell.tsx` — reduce small-screen padding and keep shell content scrollable.
- Modify: `src/widgets/app-header/ui/AppHeader.tsx` — allow header wrapping and prevent action/title overlap.
- Modify: `src/widgets/app-sidebar/ui/AppSidebar.tsx` — add mobile horizontal overflow protection.
- Modify: `src/pages/login/ui/LoginPage.tsx` — reduce mobile padding and keep text/buttons from overflowing.
- Modify: `src/features/auth-login/ui/LoginForm.tsx` — replace hardcoded error colors with destructive token.
- Modify: `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx` — make stepper and error row mobile-safe, replace hardcoded error colors.
- Modify: `src/features/dashboard-overview/model/constants.ts` — replace fixed direction colors with token-safe classes.
- Modify: `src/features/portfolio-management/model/constants.ts` — replace fixed gap colors with token-safe classes.
- Modify: `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` — replace exhausted-trial fixed red class and make modal actions wrap safely.
- Modify: `src/features/settings-portfolio/ui/AiSettingsSection.tsx` — make API key input/button group mobile-safe, replace fixed red class.
- Modify: `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` — make asset list action area wrap or stack on narrow screens.
- Modify: `src/features/settings-portfolio/ui/TargetAllocationSection.tsx` — make save/status row wrap on narrow screens.
- Test: `src/widgets/app-shell/ui/AppShell.test.tsx` or existing widget tests — responsive shell/sidebar/header class guards.
- Test: `src/shared/ui/FieldMessage.test.tsx` — status tone token class guards.
- Test: existing feature tests where practical — mobile-safe class guards for settings or onboarding.
- Modify: `docs/WORK_LOG.md` — record implementation and QA results.
- Modify: `docs/SESSION_STATE.md` — record Unit 18 status and validation results.

---

## Task 1: Shared Status Color Tokens

**Files:**
- Modify: `src/apps/styles/index.css`
- Modify: `src/shared/ui/FieldMessage.tsx`
- Modify: `src/shared/ui/ErrorState.tsx`
- Create or modify test: `src/shared/ui/FieldMessage.test.tsx`

- [ ] **Step 1: Add or reuse semantic tokens**

Use existing `--destructive` for errors. If success status needs a dedicated token, add these to `:root` and `.dark`:

```css
:root {
  --success: 142.1 76.2% 36.3%;
}

.dark {
  --success: 142.1 70.6% 45.3%;
}
```

Keep token names semantic. Do not introduce one-off `green-600` classes.

- [ ] **Step 2: Update `FieldMessage` tone classes**

Expected mapping:

```ts
const TONE_CLASS: Record<FieldMessageTone, string> = {
  error: 'text-[hsl(var(--destructive))]',
  info: 'text-[hsl(var(--muted-foreground))]',
  success: 'text-[hsl(var(--success))]',
};
```

- [ ] **Step 3: Update `ErrorState`**

Replace fixed red text with:

```tsx
<p className="text-lg font-medium text-[hsl(var(--destructive))]">{title}</p>
```

- [ ] **Step 4: Add focused tests**

Create `src/shared/ui/FieldMessage.test.tsx` if it does not exist. Minimum cases:

```tsx
it('uses destructive token for error tone', () => {
  render(<FieldMessage tone="error">오류</FieldMessage>);
  expect(screen.getByRole('alert')).toHaveClass('text-[hsl(var(--destructive))]');
});

it('uses success token for success tone', () => {
  render(<FieldMessage tone="success">성공</FieldMessage>);
  expect(screen.getByText('성공')).toHaveClass('text-[hsl(var(--success))]');
});
```

- [ ] **Step 5: Run targeted tests**

Run:

```bash
pnpm test src/shared/ui/FieldMessage.test.tsx
```

Expected: PASS.

---

## Task 2: App Shell Mobile Stability

**Files:**
- Modify: `src/widgets/app-shell/ui/AppShell.tsx`
- Modify: `src/widgets/app-header/ui/AppHeader.tsx`
- Modify: `src/widgets/app-sidebar/ui/AppSidebar.tsx`
- Modify tests: `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/widgets/app-sidebar/ui/AppSidebar.test.tsx`
- Create or modify test: `src/widgets/app-shell/ui/AppShell.test.tsx`

- [ ] **Step 1: Make shell padding responsive**

Update main content class to small-screen padding:

```tsx
<main id="main-content" className="flex-1 overflow-auto p-4 sm:p-6">
```

Keep skip link and `main-content` id unchanged.

- [ ] **Step 2: Make header wrap safely**

Use a wrapping header layout similar to:

```tsx
<header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 sm:px-6">
  <div className="flex min-w-0 flex-col justify-center">
    <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
    {description && <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{description}</p>}
  </div>
  <div className="flex shrink-0 flex-wrap items-center gap-2">
    ...
  </div>
</header>
```

Do not remove logout behavior.

- [ ] **Step 3: Make sidebar horizontally scrollable on mobile**

Update mobile classes to include overflow protection:

```tsx
className="flex w-56 shrink-0 flex-col gap-1 border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 max-lg:w-full max-lg:flex-row max-lg:overflow-x-auto max-lg:border-b max-lg:border-r-0"
```

Add `shrink-0` to nav links if needed so labels do not collapse.

- [ ] **Step 4: Add class guard tests**

Test expectations:

```tsx
expect(screen.getByRole('banner')).toHaveClass('flex-wrap');
expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('max-lg:overflow-x-auto');
expect(screen.getByRole('main')).toHaveClass('p-4');
expect(screen.getByRole('main')).toHaveClass('sm:p-6');
```

- [ ] **Step 5: Run widget tests**

Run:

```bash
pnpm test src/widgets/app-header/ui/AppHeader.test.tsx src/widgets/app-sidebar/ui/AppSidebar.test.tsx src/widgets/app-shell/ui/AppShell.test.tsx
```

Expected: PASS.

---

## Task 3: Feature Screen Responsive And Dark-Safe Fixes

**Files:**
- Modify: `src/pages/login/ui/LoginPage.tsx`
- Modify: `src/features/auth-login/ui/LoginForm.tsx`
- Modify: `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx`
- Modify: `src/features/dashboard-overview/model/constants.ts`
- Modify: `src/features/portfolio-management/model/constants.ts`
- Modify: `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- Modify: `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
- Modify: `src/features/settings-portfolio/ui/ManualAssetsSection.tsx`
- Modify: `src/features/settings-portfolio/ui/TargetAllocationSection.tsx`

- [ ] **Step 1: Replace fixed error colors**

Replace these patterns:

```tsx
text-red-500
text-red-600
bg-red-50
text-green-600
text-blue-600
```

with semantic tokens. Error examples:

```tsx
text-[hsl(var(--destructive))]
bg-[hsl(var(--destructive)/0.12)]
```

Success example:

```tsx
text-[hsl(var(--success))]
```

Direction/gap examples may use semantic text plus labels:

```ts
up: 'text-[hsl(var(--destructive))]',
down: 'text-[hsl(var(--primary))]',
flat: 'text-[hsl(var(--muted-foreground))]',
```

- [ ] **Step 2: Improve login mobile spacing**

Use smaller mobile padding and keep desktop split:

```tsx
<div className="flex min-h-screen flex-col bg-[hsl(var(--background))] md:flex-row">
  <div className="flex flex-col items-center justify-center gap-6 bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:w-1/2 md:p-12">
  ...
  <div className="flex flex-1 flex-col items-center justify-center p-6 md:w-1/2 md:p-8">
```

- [ ] **Step 3: Improve onboarding stepper and error row**

The stepper may wrap on narrow screens:

```tsx
<ol aria-label="연동 진행 단계" className="flex flex-col gap-2 sm:flex-row sm:items-center">
```

The retry row may stack:

```tsx
className="flex flex-col gap-3 rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.12)] px-4 py-3 text-sm text-[hsl(var(--destructive))] sm:flex-row sm:items-center sm:justify-between"
```

- [ ] **Step 4: Improve settings controls**

API key input and save button should stack on mobile:

```tsx
<div className="flex flex-col gap-2 sm:flex-row">
```

Asset list action buttons should not force overflow:

```tsx
<li className="flex flex-col gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
```

Target allocation save/status row should wrap:

```tsx
<div className="flex flex-wrap items-center gap-3">
```

- [ ] **Step 5: Keep tables horizontally scrollable**

Do not remove existing `overflow-x-auto` around the portfolio table. If needed, add minimum table width:

```tsx
<table className="min-w-[640px] w-full border-collapse text-sm">
```

---

## Task 4: Tests And Validation

**Files:**
- Modify existing tests closest to changed components.
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Add tests for changed UI contracts**

Required coverage:

- `FieldMessage` token classes.
- `AppHeader` wrapping class.
- `AppSidebar` mobile overflow class.
- `AppShell` responsive main padding.
- One feature-level mobile class guard, preferably settings API key input group or onboarding stepper.

- [ ] **Step 2: Run full validation**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected: all PASS.

- [ ] **Step 3: Optional browser smoke**

If local browser tooling is available, run:

```bash
pnpm exec vite --host 127.0.0.1
```

Check at least two widths from `375px`, `768px`, `1440px`. Routes:

- `/login`
- `/dashboard`
- `/onboarding/brokerage`
- `/rebalance`
- `/portfolio`
- `/settings`

Record whether each route was checked in `docs/WORK_LOG.md`.

- [ ] **Step 4: Update docs**

`docs/WORK_LOG.md` should include:

- changed files
- fixed dark-token items
- fixed mobile layout items
- validation command results
- browser smoke result or reason not run

`docs/SESSION_STATE.md` should include:

- Unit 18 current status
- validation summary
- next action: GPT review request

---

## Self-Review Checklist

- No new domain behavior was added.
- No external API, Supabase, AI provider, OAuth, or package install was introduced.
- FSD imports still use public APIs.
- Hardcoded red/green/blue status colors are removed or justified.
- Mobile class changes are covered by tests where practical.
- Full validation commands are recorded in `WORK_LOG.md`.
