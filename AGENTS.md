# Architecture rules

- Lazy-load signed-in secondary pages behind a route-level Suspense boundary to keep their code out of initial public-page loading.
- Use a compact transparent derivative of the chosen logo for the header, preserving the original artwork while reducing transfer size and transparent margins.

- Keep mobile navigation badge fetching in a dedicated hook with user-scoped realtime subscriptions and focus/reconnect refreshes, so counts remain current without changing notification read behavior.
- Reuse EmptyState for illustrated, localized empty-list prompts and PressButton for reduced-motion-aware spring feedback; this keeps actions and motion consistent without changing every global button.