# Contributing to Spark Slider

Thank you for your interest in contributing to Spark Slider! This document provides guidelines for contributing to the project.

## Code of Conduct

- Keep it small and framework-agnostic — respect the project's minimalist philosophy, the chosen tech stack and existing architecture
- Be respectful and constructive in all interactions
- Help others learn and grow
- Maintain a welcoming environment

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/framer-motion-spark-slider.git`
3. Follow the development setup in `DEVELOPMENT.md`

## Dev Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add license headers to new TypeScript/JavaScript files:

```typescript
/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */
```

4. Commit with clear message
5. Push and create a Pull Request

## Code Style

- **Formatting**: All code must be formatted with Prettier — run `npm run format`
- **Linting**: Code must pass ESLint checks — run `npm run lint`
- **Type checking**: TypeScript must compile without errors — run `npm run type-check`
- **Testing**: New features should include appropriate tests — run `npm test`
- **Build**: Changes must not break the build process — run `npm run build`

**Quick validation**: Run `npm run check-all` to validate everything at once.

> **Note**: Our CI automatically validates:
>
> - ESLint rules
> - Prettier formatting
> - TypeScript compilation
> - Build process
> - Unit and integration tests
> - License headers in all source files
>
> PRs must pass all checks before merge.

## 🐛 Bug Reports

When reporting bugs, include:

- Create an issue
- Browser and version
- Operating system
- Device type (desktop/mobile/tablet)
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## 💡 Feature Requests

For new features:

- Check existing issues first
- Describe the use case
- Consider backwards compatibility
- Be specific about the desired behavior
- Consider if it fits the project's scope

## 🧪 Testing

- **Unit tests**: Test individual components and functions
- **Integration tests**: Test API endpoints and workflows
- **Manual testing**: Test slider interactions across different devices

Run tests with: `npm test`

## 📦 Package Development

This project uses npm workspaces:

- Main app: Root directory
- NPM package: `packages/spark-slider/`
- Shared code: Symlinked from `src/components/SparkSlider/`

When modifying the slider core, changes automatically reflect in both the demo app and the npm-library package.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License. All contributed code becomes part of the project under the same license terms.
