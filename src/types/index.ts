export interface Board {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface Lane {
  id: number;
  board_id: number;
  name: string;
  color: string;
  position: number;
  created_at?: string;
}

export interface Card {
  id: number;
  lane_id: number;
  name: string;
  description: string | null;
  color: string;
  position: number;
  linked_board_id: number | null;
  created_at?: string;
}

export interface CreateBoardInput {
  name: string;
  description?: string;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
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
  linked_board_id?: number;
}

export interface UpdateCardInput {
  lane_id?: number;
  name?: string;
  description?: string | null;
  color?: string;
  position?: number;
  linked_board_id?: number | null;
}

export interface MoveCardInput {
  cardId: number;
  targetLaneId: number;
  newPosition: number;
}

export interface LaneWithCards extends Lane {
  cards: Card[];
}

export interface BoardWithLanes extends Board {
  lanes: LaneWithCards[];
}
