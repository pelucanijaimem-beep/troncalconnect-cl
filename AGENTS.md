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
- Identity API failures log only stage, HTTP status and an app-owned category; never log raw upstream bodies, credentials, session URLs or profile data because provider errors may echo private values.
- RUT login uses separate privileged lookup and publishable authentication clients; fail closed on rate-limit storage errors and log only stages/error codes, because credentials and profile data must never enter diagnostics.
- App server functions use the local require-session middleware and resolve the server publishable key first, then its public VITE fallback inside handlers; preserve the server URL and generated integration files to avoid preview proxy failures and overwritten fixes.
- Password recovery uses a public reset-password route and the shared session store; isolate it from profile loads (including stale in-flight results), retain the dialog on session loss so submission can report expiry, and call updateUser without current_password only for recovery. Resume normal blocked-account checks after success; defer auth-dependent work outside auth callbacks and ignore TOKEN_REFRESHED to prevent recursive refresh storms.
- Load matching uses authenticated RLS reads and server-only streamed AI SDK Responses helpers; exclude expired/ineligible loads, validate returned IDs, omit contact data, and persist terminal access denial to prevent replay.
- Natural-language load search reuses normal LoadCard application callbacks; GPS is transient and falls back to the user's stored alert base city, with approximate city-centre proximity. Quota notices consume the existing usage RPC and never control publication eligibility.
- Voice conversations use a persistent authenticated Live relay with read-only RLS-scoped load/report tools, session-local transcripts, and immediate Stop cleanup; this prevents invented inventory, unauthorized reads, and background microphone capture.
- Commercial membership pages share a browser-safe fixed-peso presentation matrix and project existing ledger discounts into its rates without changing stored snapshots; server-side publication ledgers atomically snapshot usage and UF overage rates without quota rejection, preserve historical events after deletion, and expose only owner/admin summaries while payment integration remains disconnected.
- Organization business segments derive from existing profile business roles; organization ownership and membership are stored separately, and billing fields have no authenticated direct write grants to prevent entitlement escalation.
- Load chat lives in mensajes_carga, scoped by postulación + load owner via security-definer helper; read flags change only through an RPC so participants cannot edit message content.
- The route safety center is an isolated browser-only demonstration; its PINs, sharing links, identity samples and SOS never authorize deliveries, expose real trips or dispatch emergency alerts.
- Administrative user detail uses an escaped admin_ leaf route and the existing perfiles_admin RPC plus administrator-scoped RLS/Storage access; this avoids nesting the full admin panel or exposing private profile reads.
- Route-report AI summaries run in an authenticated server function over RLS-scoped recent reports, skip the model when none exist, and only phrase existing data; this prevents invented danger alerts.
- Voice availability is gated by an estado_acceso_ia row for voz_ruta (UI shows Próximamente); deleting the row enables it without code changes.
- The home route assistant computes distance, tolls and $/km from real loads; its authenticated AI call only phrases those numbers and pauses on 402/403, so visitors spend no credits.
- Signup and password-recovery forms require a server-verified anti-bot token once its secret is configured (open until then); RUT login keeps its own attempt limit instead, so legitimate logins never depend on an outside check.
- Load cards show only Ver Detalles/Postular; contact/report/block live in the overflow menu. Iniciar Viaje needs a prior application (no accepted state exists).
- Load-card margin/Ruta 5 tolls use the shared rentabilidad helper; counteroffers are prefixed application text (no schema change).
- Document expiry autofill: authenticated server function, never stores the file, keeps validated dates/plates for manual review, pauses on 402/403.
- Trip ratings are RPC-only on confirmed deliveries (one per party), keyed on user id to prevent forgery.
- App-started trips close only via the delivery-code RPC (owner-only code, receiver name+RUT, 5 tries); viajes_entrega has no direct grants and no photos are kept, protecting the code and third-party documents.
- Push alerts: a cargas insert trigger queues a one-time token; pg_net calls the public push route, which sends Web Push only for unused tokens.
