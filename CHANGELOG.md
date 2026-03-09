# Changelog

All notable changes to spark-slider will be documented in this file.

## [1.1.0] - 2026-03-09

### Updated

- **React 19 support** — demo app upgraded to React 19.2.4, library already supports React >=18 via peerDependencies
- **Next.js 16 support** — demo app upgraded to Next.js 16.1.6 with Turbopack
- **ESLint config modernized** — migrated from `FlatCompat` wrapper to native flat config (`eslint-config-next@16`)
- **eslint-plugin-react-hooks v7** — upgraded via eslint-config-next, includes new React 19 rules
- **All dependencies bumped to latest compatible versions:**
- React: 18.3.1 → 19.2.4
- Next.js: 15.5.9 → 16.1.6
- Framer Motion: 12.23.22 → 12.35.2
- TypeScript: 5.9.2 → 5.9.3
- ESLint: 9.36.0 → 9.39.4
- @typescript-eslint/\*: 8.45.0 → 8.57.0
- Prettier: 3.6.2 → 3.8.1
- PostCSS: 8.5.6 → 8.5.8
- Autoprefixer: 10.4.21 → 10.4.27
- Tailwind CSS: 3.4.17 → 3.4.19
- @vercel/blob: 2.0.0 → 2.3.1
- @testing-library/jest-dom: 6.8.0 → 6.9.1
- @testing-library/react: 16.3.0 → 16.3.2
- Security: 0 vulnerabilities

## [1.0.3] - 2025-12-14

### Security

- **Security patch** for CVE-2025-55184 (DoS) and CVE-2025-55183 (Source Code Exposure)
- Next.js: 15.5.7 → 15.5.9
- Updated @next/eslint-plugin-next and eslint-config-next to 15.5.9
- Security: 0 vulnerabilities

See [Vercel Security Bulletin](https://vercel.com/kb/bulletin/security-bulletin-cve-2025-55184-and-cve-2025-55183) for details.

## [1.0.2] - 2025-12-04

### Security

- **Security update**
- Next.js: 15.5.4 → 15.5.7 (patched React Flight protocol vulnerability)
- Updated @next/eslint-plugin-next and eslint-config-next
- Fixed glob and js-yaml issues via npm audit fix
- Security: 0 vulnerabilities after the update

The NPM ecosystem keeps us on our toes 🙂

## [1.0.1] - 2025-10-22

### Added

- **TSDoc** comments across public API (SparkSlider, hooks, config) for IDE IntelliSense
- **Documentation** and package **metadata** improvements
- No runtime or public API behavior changes

## [1.0.0] - 2025-09-29

### Added

- **Pure CSS implementation** - Migrated from Tailwind CSS to pure CSS with BEM-like naming convention (`spark-*` prefix)

### Changed

- **Breaking: CSS class names** - All classes now use `spark-*` prefix (e.g., `spark-card`, `spark-stage`)
- **Breaking: Tailwind CSS removed** - Package no longer requires Tailwind CSS dependency
- **Renamed hook** - `useFullscreen` renamed to `useSparkFullscreen` for consistency

## [0.1.6] - 2025-09-02

### Changed

- **Repository URLs updated** - point to correct `framer-motion-spark-slider` repository
- **Enhanced package documentation** - Improved README with badges, detailed features, API reference table, and npmjs-optimized formatting

## [0.1.5] - 2025-08-31

### Added

- **Full accessibility support**

### Changed

- **Major architecture refactoring** - decomposed SparkSlider into specialized hooks:
  - `useSparkSlider.ts` - Core slider state management
  - `useSparkFullscreen.ts` - Fullscreen functionality
  - `useSparkKeyboard.ts` - Keyboard navigation handling
  - `useSparkTransforms.ts` - Position calculations and animations
- **Performance optimizations**

## [0.1.0/0.1.4] - 2025-08-30

### Note

**Stable production versions** - Previous releases represent the stable production baseline with core slider functionality, drag interactions, auto-play, and basic accessibility support.
