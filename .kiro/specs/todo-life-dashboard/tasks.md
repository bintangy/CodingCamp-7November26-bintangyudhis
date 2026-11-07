# Implementation Plan: To-Do Life Dashboard

## Overview

The To-Do Life Dashboard is a single-page web application built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no backend, no build step. It combines four widgets (Greeting, Focus Timer, To-Do List, Quick Links) on one page, persisting all user data to Local Storage.

The implementation follows the design's architecture: a single IIFE-wrapped module (`js/app.js`) owns an in-memory `state` object, exposes pure helper functions on `window.Dashboard` for automated testing, and bootstraps the DOM only when the page is present. All validation, greeting logic, timer math, and serialization are written as pure functions so they can be exercised by property-based tests (fast-check, 100+ runs each) alongside example-based unit tests (Jest + jsdom).

Tasks are ordered so that pure logic is implemented and property-tested first, then state operations, then persistence, then DOM rendering, then full bootstrap and wiring. Each task builds on the previous one and ends with everything integrated — no orphaned code.

## Tasks

- [x] 1. Set up project structure and test infrastructure
  - [x] 1.1 Create index.html with semantic structure for all four widgets
    - Create `index.html` at the project root with a main container, four distinct widget sections (`#greeting`, `#focus-timer`, `#todo-list`, `#quick-links`), the add-task form (`#add-task-form` with text input and submit button), the add-link form (`#add-link-form` with name input, URL input, and submit button), task list container (`#task-list`), link list container (`#link-list`), timer display (`#timer-display`), timer controls (`#timer-controls` with Start/Stop/Reset buttons), and error message area (`#error-message`)
    - Link `css/styles.css` and `js/app.js` via `<link>` and `<script>` tags
    - _Requirements: 6.1, 7.1, 7.2, 7.3_

  - [x] 1.2 Create css/styles.css with base styling meeting accessibility requirements
    - Create `css/styles.css` in the `css/` directory with visually distinct widget sections (borders, spacing, or backgrounds separating adjacent sections), minimum 16px body font size, and text-to-background contrast ratio of at least 4.5:1
    - Style the task list, link buttons, timer display, and forms for a clean, minimal look
    - _Requirements: 6.1, 6.2, 7.1_

  - [x] 1.3 Set up package.json with Jest, jsdom, and fast-check dev dependencies
    - Create `package.json` with `"type": "commonjs"`, dev dependencies for `jest`, `jest-environment-jsdom`, and `fast-check`, a `"test"` script (`jest --run`), and a Jest configuration block setting `testEnvironment` to `jsdom`
    - Install dependencies with pinned versions
    - _Requirements: 7.3 (test toolchain is dev-only, not part of shipped app)_

- [ ] 2. Implement core IIFE, validation, and serialization logic in js/app.js
  - [x] 2.1 Create IIFE shell with state object, ID generation, and window.Dashboard namespace; implement validateTaskText and validateLink
    - Create `js/app.js` as an IIFE; define the module-private `state` object (`tasks: []`, `links: []`, `timer: { durationMs, remainingMs, running, endTime, intervalId }`) per the design
    - Implement `generateId()` using `crypto.randomUUID()` with a fallback to `'tld-' + Date.now() + '-' + Math.random().toString(36).slice(2)`
    - Implement `validateTaskText(text)` — pure function returning `true` iff `text` is a string, length 1–200, and `text.trim().length >= 1`
    - Implement `validateLink(name, url)` — pure function returning `true` iff `name` is a string of length 1–100 with `name.trim().length >= 1`, and `url` is a string with `url.trim().length >= 1`
    - Expose `validateTaskText` and `validateLink` on `window.Dashboard`
    - _Requirements: 3.1, 3.5, 3.10, 4.4_

  - [ ] 2.2 Implement serialize and deserialize functions for tasks and links
    - Implement `serializeTasks(tasks)` / `serializeLinks(links)` — pure functions using `JSON.stringify`
    - Implement `deserializeTasks(json)` / `deserializeLinks(json)` — pure functions that `JSON.parse` the input, validate the result is an array whose elements conform to the Task/Link shape (correct types, valid field lengths), and return `[]` on any parse error or shape violation
    - Expose all four functions on `window.Dashboard`
    - _Requirements: 3.9, 4.8, 5.5_

  - [~]* 2.3 Write property test for task serialization round-trip
    - **Property 10: Task serialization round-trips losslessly**
    - **Validates: Requirements 3.9**
    - Create `test/serialization.pbt.test.js`; use fast-check to generate arbitrary valid `Task[]` lists, assert `deserializeTasks(serializeTasks(list))` produces an equivalent list (same length, same order, each task retains text, done, and id); minimum 100 runs
    - _Requirements: 3.9_

  - [~]* 2.4 Write property test for link serialization round-trip
    - **Property 14: Link serialization round-trips losslessly**
    - **Validates: Requirements 4.8**
    - Add to `test/serialization.pbt.test.js`; use fast-check to generate arbitrary valid `Link[]` lists, assert `deserializeLinks(serializeLinks(list))` produces an equivalent list (same length, same order, each link retains name, url, and id); minimum 100 runs
    - _Requirements: 4.8_

  - [~]* 2.5 Write property test for invalid persisted data deserializing to empty list
    - **Property 15: Invalid persisted data deserializes to an empty list**
    - **Validates: Requirements 5.5**
    - Add to `test/serialization.pbt.test.js`; use fast-check to generate malformed JSON, wrong top-level types, and arrays with shape-violating elements; assert both `deserializeTasks` and `deserializeLinks` return `[]`; minimum 100 runs
    - _Requirements: 5.5_

- [ ] 3. Implement greeting logic in js/app.js
  - [~] 3.1 Implement greeting pure logic (greetingForDate, formatTime, formatDate)
    - Implement `greetingForDate(date)` — pure function computing seconds-since-midnight `t = h*3600 + m*60 + s` and returning "Good morning" (18000–43199), "Good afternoon" (43200–61199), "Good evening" (61200–75599), or "Good night" (t >= 75600 or t <= 17999)
    - Implement `formatTime(date)` — pure function returning `HH:MM:SS` with zero-padded components
    - Implement `formatDate(date)` — pure function returning a string containing the day, month, and year
    - Expose all three on `window.Dashboard`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [~]* 3.2 Write property test for greeting partition of the day
    - **Property 1: Greeting is a total, disjoint partition of the day**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Create `test/greeting.pbt.test.js`; use fast-check to generate arbitrary seconds-since-midnight (0–86399), construct a `Date`, assert `greetingForDate` returns exactly one of the four greetings and that it matches the expected range; verify boundary values (e.g., 11:59:59 → morning, 12:00:00 → afternoon); minimum 100 runs
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [~]* 3.3 Write property test for clock formatting reflecting the input date
    - **Property 2: Clock formatting reflects the input date**
    - **Validates: Requirements 1.1, 1.2**
    - Add to `test/greeting.pbt.test.js`; use fast-check to generate arbitrary `Date` values, assert `formatTime(date)` yields `HH:MM:SS` matching the date's components, and `formatDate(date)` contains the day, month, and year; minimum 100 runs
    - _Requirements: 1.1, 1.2_

- [ ] 4. Implement timer logic in js/app.js
  - [~] 4.1 Implement timer pure logic and state operations (formatDuration, remaining-time helper, timerStart, timerStop, timerReset)
    - Implement `formatDuration(ms)` — pure function converting milliseconds to `MM:SS` with zero-padding
    - Implement `computeRemainingMs(endTime, now)` — pure function returning `Math.max(0, endTime - now)` for drift-free countdown math
    - Implement `timerStart()` — sets `endTime = Date.now() + state.timer.remainingMs`, `running = true`, starts `setInterval(tick, 1000)`; the `tick` function recomputes `remainingMs = computeRemainingMs(endTime, Date.now())`, updates the display, and stops at 00:00
    - Implement `timerStop()` — captures `remainingMs = endTime - Date.now()`, sets `running = false`, clears the interval
    - Implement `timerReset()` — sets `remainingMs = durationMs` (25 * 60 * 1000), `running = false`, clears the interval, displays 25:00
    - Expose `formatDuration`, `computeRemainingMs`, and `timerReset` on `window.Dashboard`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [~]* 4.2 Write property test for remaining time being monotonic, non-negative, and stopping at zero
    - **Property 3: Remaining time is monotonic, non-negative, and stops at zero**
    - **Validates: Requirements 2.2, 2.6**
    - Create `test/timer.pbt.test.js`; use fast-check to generate an `endTime` and a sequence of increasing "now" timestamps, assert `computeRemainingMs` equals `max(0, endTime - now)`, never increases as `now` advances, and is 0 when `now >= endTime`; minimum 100 runs
    - _Requirements: 2.2, 2.6_

  - [~]* 4.3 Write property test for reset being idempotent and reaching a fixed point
    - **Property 4: Reset is idempotent and reaches a fixed point**
    - **Validates: Requirements 2.4**
    - Add to `test/timer.pbt.test.js`; use fast-check to generate arbitrary timer states, assert `timerReset()` sets remaining to 25:00 and running to false, and applying `timerReset()` again produces the same state (`f(x) == f(f(x))`); minimum 100 runs
    - _Requirements: 2.4_

- [ ] 5. Implement task state operations in js/app.js
  - [~] 5.1 Implement task state operations (addTask, editTask, toggleTask, deleteTask)
    - Implement `addTask(text)` — validates text with `validateTaskText`; if valid, appends a new `Task` (`{ id: generateId(), text, done: false }`) to `state.tasks`, persists, and re-renders; if invalid, returns a failure signal and makes no state change
    - Implement `editTask(id, text)` — validates text; if valid, replaces the text of the task with matching `id`; if invalid, signals rejection and makes no change
    - Implement `toggleTask(id)` — flips the `done` status of the task with matching `id`
    - Implement `deleteTask(id)` — removes the task with matching `id` from `state.tasks`
    - All operations that change state trigger persist and re-render
    - Expose all four on `window.Dashboard` (operating on a list parameter or `state.tasks` for testability)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.10_

  - [~]* 5.2 Write property test for adding a valid task growing the list by exactly one
    - **Property 5: Adding a valid task grows the list by exactly one**
    - **Validates: Requirements 3.1**
    - Create `test/tasks.pbt.test.js`; use fast-check to generate arbitrary task lists and valid task text (1–200 chars with at least one non-whitespace char), assert `addTask` returns a list one longer with the new task as the last element having the given text and `done === false`, with prior tasks unchanged and in original order; minimum 100 runs
    - _Requirements: 3.1_

  - [~]* 5.3 Write property test for editing a task replacing only the target
    - **Property 6: Editing a task replaces only the target**
    - **Validates: Requirements 3.2**
    - Add to `test/tasks.pbt.test.js`; use fast-check to generate a task list, a task id present in the list, and valid replacement text, assert `editTask` yields a list of the same length where only the target task's text changed and all others are unchanged (text, done, id, position); minimum 100 runs
    - _Requirements: 3.2_

  - [~]* 5.4 Write property test for toggle being an involution
    - **Property 7: Toggle is an involution**
    - **Validates: Requirements 3.3**
    - Add to `test/tasks.pbt.test.js`; use fast-check to generate a task list and a task id present in the list, assert a single `toggleTask` flips `done` and a double `toggleTask` restores the original `done` value, with list length and order unchanged; minimum 100 runs
    - _Requirements: 3.3_

  - [~]* 5.5 Write property test for deleting a task removing it and preserving the rest
    - **Property 8: Deleting a task removes it and preserves the rest**
    - **Validates: Requirements 3.4**
    - Add to `test/tasks.pbt.test.js`; use fast-check to generate a task list and a task id present in the list, assert `deleteTask` yields a list one shorter with no task having that id, and remaining tasks keep their original relative order, text, and done status; minimum 100 runs
    - _Requirements: 3.4_

  - [~]* 5.6 Write property test for invalid task text being rejected by add and edit
    - **Property 9: Invalid task text is rejected by add and edit**
    - **Validates: Requirements 3.5, 3.10**
    - Add to `test/tasks.pbt.test.js`; use fast-check to generate invalid task text (empty, whitespace-only, or length > 200), assert `addTask` leaves the list unchanged and signals rejection, and `editTask` likewise leaves the list unchanged; verify boundary (200 chars with non-whitespace is valid, 201 is invalid); minimum 100 runs
    - _Requirements: 3.5, 3.10_

- [ ] 6. Implement link state operations in js/app.js
  - [~] 6.1 Implement link state operations (addLink, deleteLink)
    - Implement `addLink(name, url)` — validates with `validateLink`; if valid, appends a new `Link` (`{ id: generateId(), name, url }`) to `state.links`, persists, and re-renders; if invalid, returns a failure signal and makes no state change
    - Implement `deleteLink(id)` — removes the link with matching `id` from `state.links`, persists, and re-renders
    - Expose both on `window.Dashboard`
    - _Requirements: 4.1, 4.3, 4.4_

  - [~]* 6.2 Write property test for adding a valid link growing the list by exactly one
    - **Property 11: Adding a valid link grows the list by exactly one**
    - **Validates: Requirements 4.1**
    - Create `test/links.pbt.test.js`; use fast-check to generate arbitrary link lists and valid `(name, url)` pairs (name 1–100 non-whitespace-only, url non-empty), assert `addLink` returns a list one longer with the new link as the last element having the given name and url, with prior links unchanged and in original order; minimum 100 runs
    - _Requirements: 4.1_

  - [~]* 6.3 Write property test for deleting a link removing it and preserving the rest
    - **Property 12: Deleting a link removes it and preserves the rest**
    - **Validates: Requirements 4.3**
    - Add to `test/links.pbt.test.js`; use fast-check to generate a link list and a link id present in the list, assert `deleteLink` yields a list one shorter with no link having that id, and remaining links keep their original relative order, name, and url; minimum 100 runs
    - _Requirements: 4.3_

  - [~]* 6.4 Write property test for invalid link input being rejected by add
    - **Property 13: Invalid link input is rejected by add**
    - **Validates: Requirements 4.4**
    - Add to `test/links.pbt.test.js`; use fast-check to generate invalid `(name, url)` pairs (empty/whitespace-only name, name > 100 chars, or empty/whitespace-only url), assert `addLink` leaves the list unchanged and signals rejection; verify boundary (100 chars with non-whitespace is valid, 101 is invalid); minimum 100 runs
    - _Requirements: 4.4_

- [ ] 7. Implement persistence layer in js/app.js
  - [~] 7.1 Implement save functions (saveTasks, saveLinks) with error handling
    - Implement `saveTasks()` — calls `localStorage.setItem('tld.tasks', serializeTasks(state.tasks))`; catches `QuotaExceededError` and security exceptions, surfaces a user-visible error message in the `#error-message` element ("Saving failed — your changes are kept for this session but may not be saved"), and keeps `state.tasks` intact in memory
    - Implement `saveLinks()` — same pattern with `'tld.links'` key and `state.links`
    - _Requirements: 3.6, 3.8, 4.5, 4.7, 5.1, 5.3, 5.6_

  - [~] 7.2 Implement loadAll function with graceful fallback
    - Implement `loadAll()` — reads `tld.tasks` and `tld.links` from Local Storage, deserializes each; if a key is missing or unparseable, initializes an empty list; populates `state.tasks` and `state.links` from the result
    - Missing keys (Requirement 5.4) and corrupt data (Requirement 5.5) both fall back to empty lists
    - _Requirements: 3.7, 4.6, 5.2, 5.4, 5.5_

  - [~]* 7.3 Write persistence integration tests
    - Create `test/persistence.test.js`; test that populating storage then calling `loadAll` restores tasks and links (Requirement 5.2); test missing-key and corrupt-key cases initialize empty (Requirements 5.4, 5.5); test forced `setItem` throw surfaces an error message and retains in-memory data (Requirement 5.6); use an in-memory Local Storage mock
    - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [ ] 8. Implement DOM rendering and event handling in js/app.js
  - [~] 8.1 Implement Greeting Widget DOM rendering (renderGreeting, startGreetingClock)
    - Implement `renderGreeting(date)` — calls the pure `greetingForDate`, `formatTime`, and `formatDate` functions and writes the results into the `#greeting-time`, `#greeting-date`, and `#greeting-text` DOM elements
    - Implement `startGreetingClock()` — sets a 1000ms `setInterval` that calls `renderGreeting(new Date())` each tick
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [~]* 8.2 Write unit tests for greeting widget DOM
    - Create `test/greeting.unit.test.js`; assert the clock interval is scheduled and the DOM time/date/greeting elements update correctly for morning, afternoon, evening, and night; use jsdom and fake timers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [~] 8.3 Implement Focus Timer DOM rendering and controls
    - Implement timer DOM rendering that writes `formatDuration(state.timer.remainingMs)` into `#timer-display`
    - Attach Start/Stop/Reset button click handlers in `#timer-controls` that call `timerStart`/`timerStop`/`timerReset` and update the display
    - Ensure the display updates every second while running and shows 00:00 when finished
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.3_

  - [~]* 8.4 Write unit tests for focus timer DOM
    - Create `test/timer.unit.test.js`; test Start→Stop (remaining preserved), Reset from paused/running/finished states, 00:00 stop behavior; add a performance example asserting a render completes in under 200ms (Requirement 6.3); use jsdom and fake timers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.3_

  - [~] 8.5 Implement To-Do List DOM rendering (renderTaskList) and event delegation
    - Implement `renderTaskList()` — rebuilds task rows from `state.tasks` using `document.createElement` (no `innerHTML` for user content), each row showing the task text, a toggle checkbox, an edit button, and a delete button with `data-action` and `data-id` attributes
    - Implement event delegation on `#task-list` container: a single listener inspects `event.target.closest('[data-action]')` to dispatch `toggle`, `edit`, `save`, and `delete` actions
    - Implement add-task form submit handler with `preventDefault` so Enter and button-click both work; validate input before calling `addTask`
    - Implement edit-in-place: clicking edit turns the task text into an input field; saving calls `editTask`; invalid text leaves the task unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.10, 6.3_

  - [~]* 8.6 Write unit tests for to-do list DOM
    - Create `test/tasks.unit.test.js`; test add (form submit and Enter key), edit-in-place save, toggle visual state, delete, and invalid input rejection (empty, whitespace-only, > 200 chars); use jsdom
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.10_

  - [~] 8.7 Implement Quick Links DOM rendering (renderLinkList, openLink) and event delegation
    - Implement `renderLinkList()` — rebuilds link buttons from `state.links` using `document.createElement`, each button labeled with the link name, with a delete button and `data-action`/`data-id` attributes
    - Implement `openLink(url)` — calls `window.open(url, '_blank', 'noopener,noreferrer')` to open the URL in a new tab with opener protection
    - Implement event delegation on `#link-list` container for `open` and `delete` actions
    - Implement add-link form submit handler with `preventDefault`; validate name and URL before calling `addLink`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.3_

  - [~]* 8.8 Write unit tests for quick links DOM
    - Create `test/links.unit.test.js`; test add (form submit and Enter key), button-click opens URL in new tab with `noopener` (mocked `window.open`), delete, and invalid input rejection (empty/whitespace name, name > 100 chars, empty URL); use jsdom
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Bootstrap and integration
  - [~] 9.1 Implement init() bootstrap wiring all widgets together
    - Implement `init()` that guards on the presence of the root element (no-ops when absent, for jsdom test environments), calls `loadAll()` to restore state, renders the task and link lists, starts the greeting clock, sets the timer display to 25:00, and attaches all event delegation listeners
    - Call `init()` on `DOMContentLoaded` (or immediately if the DOM is already loaded)
    - Ensure no widget-to-widget direct coupling; all communication through shared `state` and persist helpers
    - _Requirements: 3.7, 4.6, 5.2, 5.4, 5.5, 6.1_

  - [~]* 9.2 Write integration tests for full add/edit/toggle/delete/persist flow
    - Create `test/integration.test.js`; populate storage, call `loadAll` (simulating reload), assert tasks and links restored; perform a full add/edit/toggle/delete sequence on tasks and add/delete on links, asserting state and Local Storage update after each operation; use jsdom and in-memory Local Storage mock
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.8, 3.9, 4.1, 4.3, 4.5, 4.7, 4.8, 5.2_

  - [~]* 9.3 Write smoke tests (no-network constraint, project structure, cross-browser)
    - Create `test/smoke.test.js` with three test groups:
      - No-network (Requirement 5.3): instrument `fetch`, `XMLHttpRequest`, `WebSocket`, and `navigator.sendBeacon`; assert none are invoked across a full add/edit/toggle/delete/persist sequence
      - Project structure (Requirements 7.1, 7.2, 7.3): assert exactly one `.css` file under `css/`, exactly one `.js` file under `js/`, and that `index.html` loads no framework script
      - Cross-browser (Requirement 7.4): assert loading `app.js` in jsdom throws no errors
    - _Requirements: 5.3, 7.1, 7.2, 7.3, 7.4_

- [~] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP, though property tests are strongly recommended as they validate universal correctness properties from the design
- Each task references specific requirements for traceability between implementation and spec
- Checkpoints ensure incremental validation — run `npm test` at each checkpoint to verify
- Property tests validate universal correctness properties (15 total from the design); unit tests validate specific examples and edge cases
- The design uses vanilla JavaScript (no TypeScript compiler) — TypeScript interfaces in the design are documentation only; `js/app.js` is a single IIFE that works via `file://`
- All pure logic is exposed on `window.Dashboard` for testability; DOM bootstrap only runs when the root element exists
- Test files are dev-only and do not count toward the "exactly one JS file in `js/`" constraint (Requirement 7.2)
- The test stack is Jest with jsdom and fast-check; property tests run a minimum of 100 iterations each

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["2.4", "3.2", "4.1"] },
    { "id": 5, "tasks": ["2.5", "3.3", "4.2", "5.1"] },
    { "id": 6, "tasks": ["4.3", "5.2", "6.1"] },
    { "id": 7, "tasks": ["5.3", "6.2", "7.1"] },
    { "id": 8, "tasks": ["5.4", "6.3", "7.2"] },
    { "id": 9, "tasks": ["5.5", "6.4", "8.1"] },
    { "id": 10, "tasks": ["5.6", "8.2", "8.3"] },
    { "id": 11, "tasks": ["7.3", "8.4", "8.5"] },
    { "id": 12, "tasks": ["8.6", "8.7"] },
    { "id": 13, "tasks": ["8.8", "9.1"] },
    { "id": 14, "tasks": ["9.2", "9.3"] }
  ]
}
```
