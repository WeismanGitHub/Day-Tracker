# Day-Tracker

## Roadmap
- Core Functionality: Users signup/login with a username/password. Essentially, users create their own custom versions of the GitHub contributions chart where they can input data for each day of the calendar. Chart Types: increase a daily counter (Counter), check off days (Checkmark), rate days on a scale of 1-10 (Scale).
- SQL Tables: User (Id, Name, CreatedAt, PasswordHash), Charts (Id, Name, CreatedAt, UserId, Type (enum)), CounterEntries (Id, ChartId, CreatedAt, Count), CheckMarkEntries (Id, ChartId, CreatedAt, Checked (bool)), ScaleEntries (Id, ChartId, CreatedAt, Rating)
- Frontend: `/Auth` (signup/login), `/About` (information about the website), `/` (Homepage where logged in users see their charts and can click on them), `/Charts/{ChartId}` (users can see a specific chart, add entries, and edit it), `/Account` (view/edit account data).
