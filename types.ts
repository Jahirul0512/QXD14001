
export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  recommendations?: Recommendation[];
}

// FIX: Add and export the 'Recommendation' type, which was missing.
export interface Recommendation {
  title: string;
  rationale: string;
  actionItems: string[];
}
