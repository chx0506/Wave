import { handleDailyJournalRequest } from './dailyJournal.mjs'

export function installDevApi(server) {
  server.middlewares.use('/api/daily-journal', (req, res) => {
    void handleDailyJournalRequest(req, res)
  })
}
