# Architecture rules

- Keep mobile navigation badge fetching in a dedicated hook with user-scoped realtime subscriptions and focus/reconnect refreshes, so counts remain current without changing notification read behavior.