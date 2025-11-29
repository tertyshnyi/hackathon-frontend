export interface HistoryItem {
  id: number;
  userId: string;
  query: string;
  type: string;
  createdAt?: string;
}

export interface SearchRequest {
  userId: string;
  query: string;
  type: string;
}
