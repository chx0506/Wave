import { handleDailyJournalRequest } from '../server/dailyJournal.mjs'

export default function handler(req, res) {
  void handleDailyJournalRequest(req, res)
}
