# Egg Timer

A project to create a simple egg timer application.

It shall be an "application" which can run as a web app hosted on GitHub Pages.
All eggs should be boiled in the same pot, but it should be possible to add
multiple eggs with different weights and boiling preferences (soft, medium,
hard). When eggs needs different boiling times, the time when to add the eggs
should be notified.

## Features

- It should be possible to add eggs and specify its weight in grams and if it
  should be soft, medium or hard boiled.
- It should support multiple eggs at the same time.
- Notify when to add eggs to the pot.
- Notify when eggs are done.
- Extra the eggs typicall needs to be cooled for 2 minutes in cold water after
  boiling, this should be notified as well.
- A simple and clean user interface.

## Formulas

Normal eggs (stored in refrigerator, ~6ºC):

```
t = 197 + 4.6 * w
```

where t = time in seconds, w = weight of the egg in grams

* for soft boiled eggs, -30 seconds.
* for harder boiled eggs, +45 seconds.
* for hard boiled eggs, +90 seconds.
* for room temperature eggs (~20ºC), -30 seconds.

## Development and Deployment

* All code should have unit tests where applicable.
* All code should be formatted and linted according to standard conventions.
* Any code should follow best practices for web development and be optimized for
  performance, and use modern web technologies.
* The application is deployed using GitHub Pages.
* The source code is hosted in a GitHub repository.
* To deploy, push the code to the `main` branch of the repository.
* GitHub Pages will automatically build and host the application.
* The application will be accessible at `https://daha.github.io/egg-timer/` after deployment.
* Ensure that the repository settings have GitHub Pages enabled for the `main` branch.
