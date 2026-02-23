export interface Lane {
  id: number;
  name: string;
  color: string;
  position: number;
  created_at?: string;
}

export interface Card {
  id: number;
  lane_id: number;
  name: string;
  color: string;
  position: number;
  created_at?: string;
}

export interface CreateLaneInput {
  name: string;
  color?: string;
  position: number;
}

export interface UpdateLaneInput {
  name?: string;
  color?: string;
  position?: number;
}

export interface CreateCardInput {
  lane_id: number;
  name: string;
  color?: string;
  position: number;
}

export interface UpdateCardInput {
  lane_id?: number;
  name?: string;
  color?: string;
  position?: number;
}

export interface MoveCardInput {
  cardId: number;
  targetLaneId: number;
  newPosition: number;
}
