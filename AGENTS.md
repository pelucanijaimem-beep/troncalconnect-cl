<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Validate registration RUTs in the shared RUT utility and with a profile write trigger; browser validation alone is bypassable.
- Identity-provider results must come from a verified server-side callback bound to the user's session; never trust an extracted RUT submitted by the browser.
- Identity callbacks verify a full-body HMAC and signed fresh timestamp; process stored server-created session mappings atomically and idempotently, never bind accounts from callback metadata.
- Matching identity keeps the existing documentary approval flow; mismatches are administrator-only review flags, and sandbox events never grant or revoke real verification.
- Read document files only through administrator-authorized Storage access; owner upload forms consume the path-free verification summary RPC to retain attachment status without exposing download paths.
- Contact messages use a shared validation schema and an optional-session server function with an RLS-scoped client; only administrators can read messages or update the read flag, to protect visitor correspondence.
- Identity uses authenticated server functions and public signed site callbacks, not new Edge Functions; V2 canonical JSON includes a signed fresh timestamp, and service-only atomic RPCs bind stored sessions and defer RUT comparison to existing triggers.
- RUT login uses separate privileged lookup and publishable authentication clients; fail closed on rate-limit storage errors and log only stages/error codes, because credentials and profile data must never enter diagnostics.
- App server functions use the local require-session middleware and resolve the server publishable key first, then its public VITE fallback inside handlers; preserve the server URL and generated integration files to avoid preview proxy failures and overwritten fixes.
- Password recovery uses a public reset-password route and the shared session store; isolate it from profile loads (including stale in-flight results), retain the dialog on session loss so submission can report expiry, and call updateUser without current_password only for recovery. Resume normal blocked-account checks after success; defer auth-dependent work outside auth callbacks and ignore TOKEN_REFRESHED to prevent recursive refresh storms.
- Load matching uses authenticated RLS reads and server-only streamed AI SDK Responses helpers; exclude expired/ineligible loads, validate returned IDs, omit contact data, and persist terminal access denial to prevent replay.
