# Apple Guideline 1.2 Re-Submission Notes

## What to demonstrate in screen recording (physical iOS device)

1. Open sign up flow and show Terms/Privacy acknowledgement text.
2. Tap Terms/Privacy text and open the Terms screen.
3. Open a post from another user and choose Report.
4. Submit a report reason successfully.
5. From the same flow, block that user.
6. Return to feed/messages and show the blocked user no longer appears.
7. Open chat with that user (or attempt to message) and show interaction is prevented.

## Suggested App Review response

We implemented the required user-generated content safeguards for Guideline 1.2.

- Users can report objectionable content from in-app surfaces, and reports are sent to our backend moderation system.
- Users can block abusive users.
- Blocking triggers moderation notification on our backend and immediately removes blocked user content from relevant user-visible surfaces.
- Users are shown Terms/Privacy acknowledgement in authentication flow, and Terms are accessible directly from auth screens.

We attached a physical-device screen recording in App Review Information showing:
- Terms/EULA presentation before account continuation
- Reporting objectionable content
- Blocking abusive users with immediate in-app effect

## Quick self-QA checklist before submit

- Report appears in admin moderation list.
- Blocking creates a moderation signal/report event.
- Blocked user does not appear in feed/user discovery/chat list.
- Sending chat message to blocked user returns blocked error.
- Terms links from login and signup both navigate correctly.
