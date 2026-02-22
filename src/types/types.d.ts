declare module "js-cookie";

type Match = {
  player1: {
    id: string;
    score: number;
    name: string;
    elo: number;
  };
  player2: {
    id: string;
    score: number;
    name: string;
    elo: number;
  };
  court: {
    _id: string;
    name: string;
  };
  startTime: string; // ISO date string
  slot: number;
  _id: string;
};

type Slots = {
  slots: Match[];
  tournament: string;
};

type Participant = {
  _id: string;
  alias: string;
  name: string;
  email: string;
  gender: "male" | "female" | "other";
};
