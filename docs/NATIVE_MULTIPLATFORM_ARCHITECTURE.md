# APCLOUD — Native multiplatform architecture

## Product targets

APCLOUD will have four product surfaces:
- **Web:** the existing Next.js application at https://apcloud.online, used in a normal browser.
- **Windows PC:** a separately installed native desktop application.
- **Android:** a separately installed Android application (APK and later Play Store).
- **iPhone/iPad:** a separately installed iOS application (TestFlight and later App Store).

A PWA is not the target mobile or desktop application. Do not wrap the website in a WebView and call it native.

## Technology decision

- Keep the existing Next.js/React web application and its current deployment.
- Build the native Windows, Android and iOS clients with **Flutter/Dart**. Flutter renders its own native application UI and does not use the website as its screen.
- Use platform-specific Flutter plugins/native integrations for filesystem access, photo-library access, background work, notifications and secure local storage.
- Use the existing Supabase project for Auth, Postgres, private Storage and Realtime. Flutter clients use the Supabase Flutter SDK with the public/publishable client key and user session; never embed a service-role key.
- Share API contracts, domain rules and design specifications between web and native clients. Do not attempt to share Next.js UI components with Flutter.

## Preserve the existing system

The existing repository, Next.js website, Supabase project, user accounts, database rows, Storage objects, private bucket configuration, RLS policies and sharing URLs remain in place. No replacement Supabase project, bulk migration, bucket-public setting or destructive schema change is allowed.

Before adding any database objects, inspect the live schema and RLS policies. Prefer additive, backward-compatible migrations. Existing web users must not need to register again.

## Native client layout

Create a separate native application workspace, for example `apps/native/`, containing the Flutter project. Keep it isolated from the current Next.js source and deployment root. Use flavors/configuration for Windows, Android and iOS. The first target for local development is Windows, with Android and iOS projects maintained in the same Flutter workspace.

## Synchronization architecture

Cloud metadata and Supabase Storage remain authoritative. Each native device maintains a private local database and durable operation queue.

Every queued operation has:
- Stable operation ID and authenticated user ID.
- Local file reference, remote object ID/path when available, file size and MIME type.
- Content checksum, creation/modification timestamps and operation type.
- State, retry count, last error and progress.

Rules:
- Retry operations idempotently; do not create duplicate remote records on retry.
- Use resumable/chunked transfer where supported by the selected storage/upload implementation.
- Supabase Realtime is used to learn about metadata changes, not to transfer file contents.
- Propagate deletion using a tombstone/soft-delete state before final cleanup so another device cannot accidentally restore a deleted file.
- Never silently overwrite a different file. Detect version/checksum conflicts and preserve both copies until the user resolves them.
- Provide pause, resume, retry and per-device sync status.

## Automatic photo and video backup

- Backup is opt-in, per account and per device.
- The user chooses whether to back up photos, videos or both, and whether cellular data is permitted.
- Preserve original files by default.
- Detect duplicates using content checksum and file size, not only filename or timestamp.
- Show pending count, last successful backup, failures and storage usage.
- Android and iOS background work is controlled by their operating systems. The app should schedule reliable background work where supported, but must not promise uninterrupted uploads when the OS suspends the app.
- Ask for the minimum necessary photo-library and filesystem permissions. Explain them before prompting.

## Desktop folder synchronization

- Start with Windows, then validate macOS and Linux builds.
- The user explicitly selects folders to synchronize.
- Monitor selected folders for additions, changes and deletions.
- Maintain a local index/checksum database and upload queue.
- Never scan arbitrary folders or upload files outside user-selected locations.
- Provide a tray/background mode only with clear pause and exit controls.

## Security and privacy

- Use Supabase Auth sessions and user-scoped RLS/Storage policies.
- Never expose service-role credentials in browser, desktop or mobile binaries.
- Use OS secure storage for refresh/session tokens where supported.
- Keep local caches scoped to the authenticated user; on sign-out/account switch, warn about unsynced items and safely clear or retain them only according to the user's explicit choice.
- Keep signed URLs short-lived and private buckets private.
- Support device revocation and the ability to pause backup from account settings.

## Delivery phases

### Phase 0 — Safe foundation
- Keep implementation on a feature branch and do not merge/deploy without approval.
- Review unresolved findings in PRs #4, #5 and #6.
- Keep the existing website stable; PWA installation is not a product requirement.

### Phase 1 — Native workspace
- Add isolated Flutter workspace at `apps/native/`.
- Configure Flutter for Windows, Android and iOS.
- Add environment configuration for the existing Supabase URL and publishable key without committing secrets.
- Implement sign-in, sign-out and session persistence using the existing accounts.
- Add a native shell with platform navigation and a basic file-library screen.

### Phase 2 — Native file access
- Implement Windows folder picker and scoped filesystem access.
- Implement Android/iOS photo-library selection and permission flows.
- Add local metadata database and durable upload queue.
- Do not enable unattended bulk backup until consent and queue behavior are tested.

### Phase 3 — Reliable synchronization
- Connect the native file library to existing metadata and private Storage.
- Implement upload, download, retry, duplicate detection and conflict-safe behavior.
- Add device registration and sync status only after reviewing existing schema and RLS.
- Test airplane mode, app restart, expired session, low storage and interrupted transfer.

### Phase 4 — Automatic backup
- Add user-controlled photo/video backup settings.
- Implement Android WorkManager and iOS background task/photo-library integration as supported by OS policies.
- Add Windows background sync for explicitly selected folders.
- Show clear backup health and last-successful-run information.

### Phase 5 — Release
- Build and sign Windows installers.
- Produce Android APK/AAB for internal testing and Play Store release.
- Produce iOS builds for TestFlight and App Store review.
- Add crash reporting, sync diagnostics, recovery tools and privacy disclosures.

## Acceptance criteria

- The website continues working in an ordinary browser.
- Windows, Android and iOS have separately compiled Flutter applications; none is a PWA or website WebView wrapper.
- Existing users sign in with their current APCLOUD account.
- Existing files, shares, links and private storage permissions remain valid.
- Sync is retryable, idempotent and never silently discards local changes.
- Photo/video backup is opt-in and reports pending, success and failure states.
- No production deployment or destructive database change occurs without review and explicit approval.
