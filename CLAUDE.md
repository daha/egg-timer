# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an egg timer web application designed to help users boil multiple eggs with different weights and preferences (soft, medium, hard) in the same pot. The application calculates optimal timing for when to add each egg to ensure they all finish at the desired doneness level.

## Egg Boiling Time Formula

The core calculation is based on the formula for eggs stored in refrigerator (~6ºC):

```
t = 197 + 4.6 * w
```

where:
- `t` = time in seconds
- `w` = weight of the egg in grams

Adjustments:
- Soft boiled: -30 seconds
- Harder boiled: +45 seconds
- Hard boiled: +90 seconds
- Room temperature eggs (~20ºC): -30 seconds

## Key Features to Implement

- Add multiple eggs with weight (grams) and doneness preference
- Calculate staggered start times so all eggs finish together
- Notifications for when to add each egg to the pot
- Notification when eggs are done boiling
- 2-minute cooling timer reminder after boiling completes
- Clean, simple user interface

## Development Guidelines

### Technology Stack
- Static web application (HTML, CSS, JavaScript/TypeScript)
- Modern web technologies optimized for performance
- Unit tests for calculation logic and core functionality
- Standard formatting and linting conventions

### Testing
- Write unit tests for the egg timing calculation formula
- Test edge cases: different egg weights, multiple eggs with varying preferences
- Test notification timing logic

### Deployment
- Deployment target: GitHub Pages
- Deploy by pushing to `main` branch
- Application URL: https://daha.github.io/egg-timer/
- Ensure GitHub Pages is enabled in repository settings for `main` branch
