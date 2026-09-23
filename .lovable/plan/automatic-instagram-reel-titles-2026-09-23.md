# Automatic Instagram Reel Titles

## Goal
When one or many Instagram links are pasted in admin, fetch each reel's real Instagram title/caption and save a clean display title instead of `Instagram reel <code>`.

## Changes
- Add a server-side Instagram metadata reader so titles can be fetched without browser restrictions.
- Extract `og:title` and `og:description`, remove Instagram account/site suffixes, and choose the best meaningful title.
- Update multi-link add to fetch metadata for every new link before saving, while keeping a clear fallback when Instagram blocks metadata.
- Update the single-video editor so a pasted link can fill the title automatically without overwriting a title the admin already edited.
- Keep all existing append, duplicate protection, ordering, publish/unpublish, edit, and delete behavior unchanged.
- Verify multiple links retain distinct extracted titles in admin and on the Videos page.

## Technical details
- Fetch runs only on the server; no Instagram password or API token is stored.
- Requests use timeouts and per-link failure handling, so one unavailable reel does not stop the remaining links from being added.
