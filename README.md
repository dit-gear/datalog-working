# datalog.email

### To do before first publish

- Resolve linter issues and improve type autocomplete support in editor.
- Move OCF and proxy parsing to worker thread pool.
- Store and retrive user API-key in keychain.
- Finalize datalog base schema.

## Features (user-centric)

- Parse metadata from OCF and proxies.
- Parse additional metadata from CSV.
- All fields in the datalog can be edited, including clips and top-level properties. Top-level properties override clip metadata, making them useful when camera files are unavailable but data needs to be added to the log.
- User configurable default paths for parsing.
- It's possible to extend the base datalog-schema with additional metadata. It will ignore everything else that is not defined, making your files clean and easy to read.
- User configurable presets for emails and pdfs, with status bar-shortcuts.
- Code editor for editing email and pdf templates in react-jsx/tsx.
- Settings can both be stored within a single project and on app level. Project-settings override application level(global) settings.

## technical features

- Relies on Zod for dynamic schema validation, transformation, parsing and types. Shared between processes.
- Although a database would have been nice, this app relies on local config files and .datalog files that user's can edit and share outside the app.
- Watchfolders. The app state will update if users add/change/remove .datalog-files and configs outside the app.
- Dynamic statusbar-shortcuts for user presets.
