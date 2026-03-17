import mongoose, { Schema, Document } from 'mongoose';

export interface IGameState extends Document {
  userId: string; // betterAuth user id (string, not ObjectId)

  // ── Sober 
  soberDays: number;
  lastPledgeDate: string | null; // YYYY-MM-DD

  // ── Forest 
  forestCoins: number;

  // ── Habitica (RPG)
  rpgXP: number;
  rpgHP: number;
  rpgLevel: number;
  tasksDoneToday: string[];
  tasksResetDate: string | null; // YYYY-MM-DD

  //  Braver 
  braverDays: number;
  braverLastCheckin: string | null;    // YYYY-MM-DD
  challengesDoneToday: string[];
  challengesResetDate: string | null;  // YYYY-MM-DD

  //    Points 
  totalPoints: number;

  createdAt: Date;
  updatedAt: Date;
}

const GameStateSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },

    // Sober
    soberDays:      { type: Number, default: 0 },
    lastPledgeDate: { type: String, default: null },

    // Forest
    forestCoins: { type: Number, default: 0 },

    // Habitica
    rpgXP:           { type: Number, default: 0 },
    rpgHP:           { type: Number, default: 100 },
    rpgLevel:        { type: Number, default: 1 },
    tasksDoneToday:  { type: [String], default: [] },
    tasksResetDate:  { type: String, default: null },

    // Braver
    braverDays:          { type: Number, default: 0 },
    braverLastCheckin:   { type: String, default: null },
    challengesDoneToday: { type: [String], default: [] },
    challengesResetDate: { type: String, default: null },

    // Points
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IGameState>('GameState', GameStateSchema);