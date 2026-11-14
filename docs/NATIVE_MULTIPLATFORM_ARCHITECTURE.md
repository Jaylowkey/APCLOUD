# APCLOUD — Native multiplatform architecture

## Goals

Deliver APCLOUD as one cloud product across:
- Web/PWA: existing Next.js deployment at https://apcloud.online.
- Desktop: installable Windows, macOS and Linux app using Tauri.
- Mobile: Android and iOS apps using Capacitor.

All clients use the existing Supabase project, authentication, database, private Storage buckets and row-level security. This work must not create a replacement backend or migrate/delete existing user data.

## Repository baseline

The current product is a Next.js 15 / React 19 / TypeScript application. The existing photo library, sharing flows, private Storage paths and authentication remain the source of truth. Native clients should reuse the same web UI where practical and add platform capabilities through small adapters.

## Runtime architecture

1. Shared application: Next.js routes, components, domain logic and Supabase client.
2. Platform adapters: capability detection and interfaces for local files, background transfer, notifications and app lifecycle.
3. Desktop shell: Tauri, with native filesystem access only after explicit folder selection and scoped permissions.
4. Mobile shell: Capacitor, with native photo-library permission, upload queue and push-notification integration.
5. Cloud: existing Supabase Auth, Postgres, Storage and Realtime.

Do not expose service-role credentials in any client. All file access remains private and user-scoped.

## Synchronization model

- Cloud metadata and Storage remain authoritative.
- Each client keeps a local operation queue with stable operation IDs, user ID, file metadata, checksum, retry count and state.
- Uploads are resumable where supported; retries must be idempotent.
- Realtime events invalidate or refresh metadata; they are not the file-transfer mechanism.
- Deletions propagate as tombstones before physical cleanup, preventing deleted files from reappearing on another device.
- Concurrent edits never silently overwrite a different file. Use version metadata/checksums and preserve conflict copies for user resolution.
- Pause/resume and retry are visible to the user.

## Photo and video backup

- Backup is opt-in and separately configurable per device.
- The user chooses photo/video sources and whether cellular data is allowed.
- Duplicate detection uses a content checksum plus file size; names and timestamps alone are insufficient.
- Preserve original files by default. Any optimization must be an explicit separate option.
- Mobile background execution is best-effort and subject to Android/iOS operating-system scheduling and permissions. The UI must show the last successful backup and pending items rather than promise uninterrupted background execution.

## Security and privacy

- Request the minimum native permissions and explain why they are needed.
- Desktop folder sync is limited to folders explicitly selected by the user.
- Never upload the entire photo library without opt-in.
- Keep signed URLs short-lived; never make private buckets public.
- Never ship Supabase service-role keys in desktop or mobile bundles.
- Provide per-device session management and a way to pause/revoke device backup.
- Ensure local caches are scoped to the authenticated account and cleared on sign-out or account switch, subject to a clear user warning if unsynced uploads remain.

## Delivery phases

### Phase 0 — Safe foundation
- Keep this work on a feature branch.
- Preserve the existing PWA, sharing and offline work.
- Review unresolved findings in PRs #4, #5 and #6 before merging them.
- Establish this architecture and verify current build/test commands.

### Phase 1 — Shared platform layer
- Add runtime/platform capability detection.
- Define typed adapters for file picking, local persistence, upload queue, notifications and app lifecycle.
- Keep browser behavior as the fallback.
- Add unit tests for capability selection and queue state transitions.

### Phase 2 — Desktop application
- Add Tauri shell and per-platform build configuration.
- Implement explicit folder selection, filesystem watcher, local metadata database and bidirectional sync.
- Add safe installer/update workflows for Windows, macOS and Linux.

### Phase 3 — Mobile application
- Add Capacitor Android and iOS projects.
- Implement opt-in photo/video selection and backup queue.
- Add native permissions, notifications and foreground/background upload scheduling.
- Test Android and iOS lifecycle behavior separately.

### Phase 4 — Reliable cross-device sync
- Add server-side metadata/version support only after reviewing the existing schema and RLS.
- Add idempotent upload/finalize endpoints, conflict handling, deletion propagation and device registry.
- Verify RLS and storage policies for every new table or function.

### Phase 5 — Release and operations
- Automated builds and signing for desktop and mobile.
- Android internal testing and iOS TestFlight before public releases.
- Crash reporting, sync diagnostics, storage quota visibility and user-facing recovery tools.

## Acceptance criteria

- Existing web users can continue using APCLOUD without migration or re-registration.
- Existing files, shares and URLs continue to work.
- A user can sign into the same account on web, desktop and mobile.
- Sync is retryable, idempotent and never silently discards local changes.
- Photo/video backup is opt-in, account-scoped and clearly reports pending/success/failure states.
- No production deployment or database migration is performed without review and explicit approval.
