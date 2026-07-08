export interface BillingUsage {
  eventsCreated: number;
  eventsLimit: number;
  guestsUsed: number;
  guestsLimit: number;
  messagesSent: number;
  messagesUsed?: number; // Backwards compatibility for UsageCard props
  messagesLimit: number;
}
