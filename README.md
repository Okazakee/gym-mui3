# GymTracker

A minimal workout tracker built with React and Material Design 3. Installable as a PWA for offline use.

## Features

**Workout Management**
- Configurable days (up to 7 days) with custom names and icons
- Add, edit, and remove exercises
- Reorder exercises within workouts
- Muscle group and set/rep tracking per exercise

**Periodization**
- 4-week periodized program (configurable up to 4 weeks)
- Customizable week names (e.g., Tolerance, Accumulation, Peak, Deload)
- Adjustable RIR (Reps In Reserve) per week
- Load percentage modifier per week (supports + and - values)

**Data & Backup**
- Local storage with offline support
- Cloud backup via GitHub Gist
- Export/Import JSON backups
- Import preview with change detection

**User Experience**
- Dark/Light mode
- Adjustable rest timer
- Material You dynamic colors on Android 14+
- PWA - installable, works offline

## Install

**Android (Chrome):**
Menu (⋮) → "Add to Home Screen"

**iOS (Safari):**
Share (↑) → "Add to Home Screen"

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```