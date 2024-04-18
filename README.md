# Day-Tracker

## Roadmap
- Core Functionality: Users signup/login with a username/password. Essentially, users create their own custom versions of the GitHub contributions chart where they can input data for each day of the calendar. Chart Types: increase a daily counter (Counter), check off days (Checkmark), rate days on a scale of 1-10 (Scale).
- SQL Tables: User (Id, Name, CreatedAt, PasswordHash), Charts (Id, Name, CreatedAt, UserId, Type (enum)), CounterEntries (Id, ChartId, CreatedAt, Count), CheckMarkEntries (Id, ChartId, CreatedAt, Checked (bool)), ScaleEntries (Id, ChartId, CreatedAt, Rating)
- Frontend: /Auth (users signup/loging), /About (information about the website), / (Homepage where logged in users see their charts and can click on them), /Charts/ChartId (users can see a specific chart, add entries, and edit it), /Account (view/edit account data)

## Research
- https://www.google.com/search?q=calendar+chart+npm&client=firefox-b-1-d&sca_esv=3a3d99a76b27b006&sxsrf=ACQVn09_kss9snMi5ZxFlXWW0eA9WyStww%3A1713403394690&ei=AnYgZtLmKbbOkPIPn7O56AY&ved=0ahUKEwjS78mFzcqFAxU2J0QIHZ9ZDm0Q4dUDCBA&uact=5&oq=calendar+chart+npm&gs_lp=Egxnd3Mtd2l6LXNlcnAiEmNhbGVuZGFyIGNoYXJ0IG5wbTIGEAAYFhgeSJssULAKWP8qcAF4AZABAJgBswGgAe4NqgEENS4xMLgBA8gBAPgBAZgCD6ACow3CAgoQABiwAxjWBBhHwgIIECEYoAEYwwTCAgoQABiABBhDGIoFwgIGEAAYBxgewgIIEAAYBxgKGB7CAgUQABiABMICChAjGIAEGCcYigXCAgsQABiABBiRAhiKBcICEBAAGIAEGLEDGEMYgwEYigXCAgcQIxixAhgnwgIHEAAYgAQYDZgDAIgGAZAGCJIHBDUuMTCgB8RR&sclient=gws-wiz-serp
- https://www.npmjs.com/package/calendar-graph