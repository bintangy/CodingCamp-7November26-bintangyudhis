# Requirements Document

## Introduction

This document defines the requirements for the To-Do List Life Dashboard, a single-page web application that serves as a personal start page and productivity dashboard. The Dashboard combines four widgets in one clean interface: a time-aware Greeting Widget, a 25-minute Focus Timer for the Pomodoro technique, a To-Do List for task management, and Quick Links for one-click access to favorite websites.

The application is built entirely with HTML, CSS, and vanilla JavaScript. No frontend frameworks or backend server are used. All user data (tasks and links) persists client-side through the browser Local Storage API, so the dashboard works offline and restores state across browser sessions. The result is a fast, minimal, standalone web app usable in modern browsers or as a browser extension.

## Glossary

- **Dashboard**: The single-page web application that displays the Greeting Widget, Focus Timer, To-Do List, and Quick Links.
- **Greeting Widget**: The Dashboard component that displays the current time, current date, and a time-of-day greeting.
- **Focus Timer**: The Dashboard component that provides a 25-minute countdown timer with Start, Stop, and Reset controls.
- **To-Do List**: The Dashboard component that manages Tasks with text and a completion status.
- **Quick Links**: The Dashboard component that displays buttons to open favorite websites.
- **Task**: A to-do item consisting of text content and a completion status of done or not-done.
- **Link**: A Quick Links entry consisting of a display name and a target URL.
- **Widget**: A self-contained section of the Dashboard: the Greeting Widget, Focus Timer, To-Do List, or Quick Links.
- **Local Storage**: The browser Web Storage API used to persist data client-side across sessions.
- **Start Button**: The Focus Timer control that begins the countdown.
- **Stop Button**: The Focus Timer control that pauses the countdown.
- **Reset Button**: The Focus Timer control that restores the timer to 25:00 and stops the countdown.

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a time-based greeting so that I have a personalized welcome when I open the Dashboard.

#### Acceptance Criteria

1. THE Greeting Widget SHALL display the local time, including hours, minutes, and seconds, updated every second.
2. THE Greeting Widget SHALL display the local date, including the day, month, and year.
3. WHILE the local time is within the range 05:00:00 to 11:59:59 inclusive, THE Greeting Widget SHALL display the greeting "Good morning".
4. WHILE the local time is within the range 12:00:00 to 16:59:59 inclusive, THE Greeting Widget SHALL display the greeting "Good afternoon".
5. WHILE the local time is within the range 17:00:00 to 20:59:59 inclusive, THE Greeting Widget SHALL display the greeting "Good evening".
6. WHILE the local time is within the range 21:00:00 to 04:59:59 inclusive, spanning midnight, THE Greeting Widget SHALL display the greeting "Good night".

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute focus timer so that I can use the Pomodoro technique to stay focused.

#### Acceptance Criteria

1. THE Focus Timer SHALL initialize to a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the Start Button is clicked, THE Focus Timer SHALL begin counting down one second at a time from the current displayed countdown value.
3. WHEN the Stop Button is clicked, THE Focus Timer SHALL pause the countdown at the current value.
4. WHEN the Reset Button is clicked, THE Focus Timer SHALL restore the countdown value to 25:00 and stop the countdown.
5. WHILE the countdown is running, THE Focus Timer SHALL update the displayed time every second.
6. WHEN the countdown reaches 00:00, THE Focus Timer SHALL stop counting and display 00:00.

### Requirement 3: To-Do List

**User Story:** As a user, I want to manage a list of tasks so that I can track what I need to do.

#### Acceptance Criteria

1. WHEN a user submits the add-task form with text of 1 to 200 characters that contains at least one non-whitespace character, THE To-Do List SHALL add a new Task with the entered text and a not-done status.
2. WHEN the edit action is submitted on a Task with text of 1 to 200 characters that contains at least one non-whitespace character, THE To-Do List SHALL replace the Task text with the user-modified text.
3. WHEN the toggle action is triggered on a Task, THE To-Do List SHALL switch the Task completion status between done and not-done.
4. WHEN the delete action is triggered on a Task, THE To-Do List SHALL remove the Task from the list.
5. IF a user submits the add-task form with empty text, whitespace-only text, or text exceeding 200 characters, THEN THE To-Do List SHALL not add a Task.
6. THE To-Do List SHALL persist all Tasks to Local Storage.
7. WHEN the Dashboard is loaded, THE To-Do List SHALL load all saved Tasks from Local Storage into the Task list, producing an empty list when no Tasks are saved.
8. WHEN a Task operation of add, edit, toggle, or delete is performed, THE To-Do List SHALL persist the updated Task list to Local Storage.
9. THE To-Do List SHALL preserve each Task's text and completion status such that saving the Task list to Local Storage and loading it back yields an equivalent list of Tasks, where an equivalent list has the same number of Tasks, with each Task retaining its original text, completion status, and position in the list.
10. IF the edit action is submitted on a Task with empty text, whitespace-only text, or text exceeding 200 characters, THEN THE To-Do List SHALL not replace the Task text.

### Requirement 4: Quick Links

**User Story:** As a user, I want quick-access buttons to favorite websites so that I can navigate to them easily.

#### Acceptance Criteria

1. WHEN a user adds a Link with a display name and a URL, THE Quick Links SHALL add a button labeled with that display name for that Link.
2. WHEN a Quick Links button is clicked, THE Quick Links SHALL open the Link URL in a new browser tab.
3. WHEN the delete action is triggered on a Link, THE Quick Links SHALL remove the Link and its button from the list.
4. IF a user attempts to add a Link with an empty or whitespace-only display name, a display name exceeding 100 characters, or an empty or whitespace-only URL, THEN THE Quick Links SHALL not add the Link.
5. THE Quick Links SHALL persist all Links to Local Storage.
6. WHEN the Dashboard is loaded, THE Quick Links SHALL load saved Links from Local Storage.
7. WHEN a Link is added or deleted, THE Quick Links SHALL persist the updated Link list to Local Storage.
8. WHEN a Link list is serialized to Local Storage and then loaded back, THE Quick Links SHALL produce a list where each Link has the same display name, the same URL, and the Links appear in the same order as before serialization.

### Requirement 5: Data Persistence

**User Story:** As a user, I want my data saved so that it persists across browser sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL store all user data, consisting of Tasks and Links, in the browser Local Storage API.
2. WHEN the Dashboard is loaded after the browser has been closed and reopened, THE Dashboard SHALL restore all saved Tasks and Links from Local Storage.
3. THE Dashboard SHALL store all user data client-side only and SHALL transmit no user data to any server.
4. IF Local Storage contains no saved Tasks and Links when the Dashboard is loaded, THEN THE Dashboard SHALL initialize with empty Task and Link lists.
5. IF saved data in Local Storage cannot be parsed as valid Tasks and Links when the Dashboard is loaded, THEN THE Dashboard SHALL initialize with empty Task and Link lists.
6. IF a write to Local Storage fails, THEN THE Dashboard SHALL display an error message indicating that saving failed while retaining the current Tasks and Links in memory.

### Requirement 6: Visual Design and Simplicity

**User Story:** As a user, I want a clean, minimal interface so that the Dashboard is easy to understand and use.

#### Acceptance Criteria

1. THE Dashboard SHALL display each of the four Widgets within its own visually distinct section, with visible separation between adjacent sections.
2. THE Dashboard SHALL display text in all Widgets at a minimum body font size of 16 pixels and a text-to-background contrast ratio of at least 4.5:1.
3. WHEN a user adds, edits, toggles, or deletes data, THE Dashboard SHALL update the displayed UI within 200 milliseconds.

### Requirement 7: Project Structure and Compatibility

**User Story:** As a developer, I want a clean project structure and cross-browser support so that the Dashboard is maintainable and widely usable.

#### Acceptance Criteria

1. THE Dashboard SHALL contain exactly one CSS file located in the css/ directory.
2. THE Dashboard SHALL contain exactly one JavaScript file located in the js/ directory.
3. THE Dashboard SHALL be built with HTML, CSS, and vanilla JavaScript without any frontend framework.
4. WHEN the Dashboard is loaded in Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari, THE Dashboard SHALL render all interface elements and execute all user interactions without browser-reported JavaScript errors.