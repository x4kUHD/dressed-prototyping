---
name: save
description: Commit all current changes and push them to the remote. Use only when the user runs /save or explicitly asks to commit and push.
disable-model-invocation: true
---

# Save

Commit and push the current work in one step, without asking for confirmation.

1. Run `git status --short` and `git diff HEAD --stat`. If there is nothing to commit, say so and stop.
2. Skim the diff (`git diff HEAD`) so the commit message describes what actually changed.
3. Stage everything with `git add -A`. If the status shows files that look like secrets (`.env`, keys, credentials), leave them out and tell the user.
4. Commit with a short imperative subject (under ~70 chars) matching the style of `git log --oneline -5`. Add a body only if the change needs explanation. If your environment specifies commit attribution lines, append them.
5. Push the current branch: `git push`. If there is no upstream, use `git push -u origin HEAD`.
6. If the push is rejected (remote ahead), run `git pull --rebase` and push again. Never force-push. If a rebase conflict occurs, stop and report it.
7. Reply with one line: the commit hash, subject, and branch pushed.

Never use `--no-verify`, never amend existing commits, and never switch branches.
