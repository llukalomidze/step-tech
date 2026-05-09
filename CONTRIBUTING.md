# Contributing to Step Tech Shop

Thanks for your interest in contributing! This document outlines the workflow
and conventions used in this repository.

## Getting Started

1. Fork the repository and clone your fork.
2. Make sure you have the correct Node version: `nvm use` (reads `.nvmrc`).
3. Install dependencies: `npm install`.
4. Start the dev server: `npm start`.

## Project Structure

```
src/app/
├── core/        # singletons: services, guards, interceptors, models
├── features/    # route-level feature modules and pages
├── layout/      # app shell: header, footer, main layout
└── shared/      # reusable components, directives, pipes, validators
```

## Branching

- Branch off `main` for every change.
- Use descriptive branch names: `feat/cart-discount`, `fix/login-redirect`.

## Commit Messages

Follow Conventional Commits:

- `feat:` a new user-facing feature
- `fix:` a bug fix
- `refactor:` code change that neither adds a feature nor fixes a bug
- `style:` formatting, whitespace, missing semicolons
- `docs:` documentation only
- `chore:` tooling, configuration, dependencies
- `ci:` CI configuration changes
- `perf:` performance improvements
- `a11y:` accessibility improvements

Keep the subject line under 72 characters and write in the imperative mood.

## Coding Conventions

- TypeScript strict mode is required; avoid `any`.
- Prefer Angular signals (`signal`, `computed`, `effect`, `input`, `output`)
  over legacy decorators in new code.
- Prefer standalone components.
- Use `inject()` for dependency injection in new code.
- Reactive forms over template-driven forms for non-trivial inputs.
- Keep components presentational where possible; push logic into services.

## Pull Requests

1. Ensure `npm run build` passes locally before opening a PR.
2. Reference the related issue in the description (e.g., `Closes #42`).
3. Keep PRs focused; split unrelated changes into separate PRs.
4. CI must be green before review.

## Reporting Issues

Use the issue templates in `.github/ISSUE_TEMPLATE/`. Include reproduction
steps, expected vs. actual behavior, and screenshots where relevant.
