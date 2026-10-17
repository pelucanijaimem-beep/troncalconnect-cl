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
