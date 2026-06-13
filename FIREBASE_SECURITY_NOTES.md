# Firebase security notes

This project is now hardened on the frontend, but browser-only code cannot fully protect a database if Firebase Realtime Database rules are open.

## Important

Do not keep Realtime Database rules like this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

The safest production setup is Firebase Authentication or Supabase Auth, then database rules that verify the authenticated user's role on the server side.

## Recommended future rule model

- Students can read only their own `globalStudentDB/<regNo>` record.
- Students can create forum posts and answers as themselves.
- Admin can read/write all student records and delete forum content.
- Passwords should not be stored in `globalStudentDB`; use Firebase Auth password handling instead.

## What was hardened in this source

- Private pages now use a shared `CSAuth.requireAuth()` guard.
- Sessions expire after 8 hours and use `sessionStorage` first.
- Forum rendering no longer injects user text through `innerHTML`.
- Dashboard task and grade rendering no longer injects database text through `innerHTML`.
- Admin task actions are checked again before writing.
- Login has basic format validation and rate limiting.
- Vercel security headers were added.
