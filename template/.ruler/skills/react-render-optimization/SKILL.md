---
name: react-render-optimization
description: Teaches React rendering performance optimization patterns. Use when reducing unnecessary re-renders (or rerenders), optimizing memoization with useMemo/useCallback/React.memo, improving state design to avoid keystroke-driven cascades, or diagnosing React performance issues.
context: fork
allowed-tools: Read, Grep, Glob
paths:
  - "**/*.tsx"
  - "**/*.jsx"
license: MIT
metadata:
  author: patterns.dev
  version: "1.1"
related_skills:
  - "hooks-pattern"
  - "hoc-pattern"
---

# React Render Optimization

Index skill for 25 practical patterns that eliminate unnecessary re-renders, reduce rendering cost, and keep React UIs responsive. These patterns apply to any React application — whether you're using Vite, Next.js, Remix, or a custom setup. The full pattern catalog lives in [topics/](topics/); read this file to pick the relevant topic, then read that topic file for the depth.

## When to Use

Reference these patterns when:
- Components re-render more often than expected
- UI feels sluggish during typing, scrolling, or interactions
- Profiler shows wasted renders in the component tree
- Building performance-sensitive features (dashboards, editors, lists)
- Reviewing or refactoring existing React components

## Instructions

- Apply these patterns during code generation, review, and refactoring. When you see an anti-pattern, suggest the corrected version with an explanation.
- Patterns are numbered 1-25 (original catalog order) and grouped by theme. Read only the topic file(s) matching the situation.

## Topics (index)

| Situation | Patterns | Read |
|---|---|---|
| Deciding what to memoize vs derive; `useMemo`/`useCallback`/`React.memo`; redundant state; lazy `useState` init; unstable default props; components defined inside components; hoisting static JSX; splitting combined hooks | 1, 3, 4, 10, 12, 16, 20 | [topics/memoization-and-derived-state.md](topics/memoization-and-derived-state.md) |
| Re-renders from over-broad subscriptions; unstable callbacks; side effects modeled as state+effect; high-frequency values (`useRef`); effect dependency hygiene; one-time app init; stable event subscriptions | 2, 5, 6, 7, 9, 13, 14, 19 | [topics/subscriptions-and-effects.md](topics/subscriptions-and-effects.md) |
| Typing/clicking blocked by expensive updates; `startTransition`, `useDeferredValue`, transition-wrapped route navigation | 8, 17, 25 | [topics/transitions-and-scheduling.md](topics/transitions-and-scheduling.md) |
| Long lists (`content-visibility`, virtualization); layout thrashing (batched DOM reads/writes); SVG animation repaints; `&&` rendering `0`/`NaN`/`""` | 11, 18, 21, 22 | [topics/dom-rendering-and-lists.md](topics/dom-rendering-and-lists.md) |
| SSR hydration flicker, `suppressHydrationWarning`, `preload()`/`preinit()` resource hints for Vite SPAs | 15, 23, 24 | [topics/ssr-and-resource-loading.md](topics/ssr-and-resource-loading.md) |

## Cross-cutting rules of thumb

React re-renders a component whenever its state changes, a parent re-renders, or context it consumes updates. Most re-renders are harmless, but when they trigger expensive computation, deep trees, or layout thrashing they become visible to users. The patterns are ordered by impact — address the biggest wins first before reaching for micro-optimizations.

- **`useMemo` vs plain `const`:** if the expression returns a primitive or is a single property access, skip `useMemo` (boolean flags, string formatting, `.length` checks are essentially free). If it iterates or transforms data (filter/sort, building data structures, `JSON.parse`), wrap it.
- **Derive, don't store:** values computable from existing state/props should be computed during render, never mirrored into `useState` + `useEffect` (pattern 1 — the highest-impact fix).
- **Never define components inside components** (including inside `useMemo`/`useCallback`) — it remounts the subtree and loses state every render (pattern 16).
- **Subscribe coarsely:** consume the derived boolean (`isMobile`, `isLoggedIn`) rather than the raw fast-changing value (pattern 2).
- **`useTransition` vs `useDeferredValue`:** wrap the state update when you control the setter; wrap the consumption when the value comes from props or a library (patterns 8, 17).
- **React Compiler note:** if React Compiler is enabled, it auto-memoizes expressions and auto-hoists static JSX — manual `useMemo`/`memo()`/hoisting becomes less necessary, but extracting components for early returns is still valuable.

## Source

Patterns from [patterns.dev](https://www.patterns.dev/) — framework-agnostic React performance guidance for the broader web engineering community.
