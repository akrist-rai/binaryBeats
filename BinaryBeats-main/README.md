# Binary Beats

A Codeforces-inspired competitive programming and DSA practice platform — browse problems, climb leaderboards, and challenge others to head-to-head duels.

## Backend Features

- **Authentication** — JWT-based register/login with bcrypt password hashing
- **Bot protection & rate limiting** — honeypot field on registration, tiered rate limiting on auth and general routes
- **Codeforces integration** — link and verify a real Codeforces handle via a profile-based verification code; rating is pulled directly from the verified CF account
- **LeetCode integration** — link and verify a real LeetCode username via the same profile-based verification method
- **Problem sets**
  - **CP mode** — thousands of real Codeforces problems imported with authentic difficulty ratings
  - **DSA mode** — a rotating pool of real LeetCode problems (Easy / Medium / Hard), linked out to the original problem
- **Leaderboards** — daily and weekly rankings, deduplicated by unique problems solved, tie-broken by solve speed
- **Duels**
  - Challenge another user by rating-gap-limited matchmaking
  - **CP duels** — single problem picked near the average rating of both players
  - **DSA duels** — one randomly selected Easy, Medium, and Hard problem per match
  - Full accept / decline / finish lifecycle

## Missing Feature

- **Blitz Arena** — not yet implemented

## Credits

- **Backend features and integration** — maintained by NewlAsh
- **UI/UX and database** — akrist-rai
