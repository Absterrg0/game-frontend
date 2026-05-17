
export async function cancelActiveTournamentScoreQrSession(): Promise<void> {
  await axios.delete("/api/tournaments/score-qr/active");
}
