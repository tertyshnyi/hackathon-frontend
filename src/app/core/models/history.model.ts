export interface HistoryItem {
  id: number;
  title: string;
  query: string;
  date: Date | string;
}

export interface HistoryResponse {
  historyItems: HistoryItem[];
}

