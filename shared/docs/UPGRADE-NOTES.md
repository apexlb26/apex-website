# APEX Reference Design Upgrade

This revision supersedes the earlier centered/loading experiments.

Key decisions:

1. Removed the public entry loader to match KAN-13.
2. Rebuilt the homepage around the supplied APEX PDF composition: hero, trust strip, solutions, industries, case study, capability band, method, insights, CTA, and multi-column footer.
3. Added dedicated Solutions, Industries, and Method routes so the navigation matches the reference site structure.
4. Rebuilt Blog and Careers around the supplied PDF layouts while keeping unpublished content honest instead of copying fake claims or metrics from the mockups.
5. Social values remain CMS/JSON driven. WhatsApp uses a temporary fake number until the real number is supplied; LinkedIn and Instagram fall back to their platform homepages.
6. MongoDB, Socket.IO, and other new external integrations are intentionally deferred.
