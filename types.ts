export type LineId = string;

export interface MetroData {
    lines: Record<LineId, string[]>;
    directions: Record<LineId, { start: string; end: string } | undefined>;
    colors: Record<LineId, { bg: string; text: string; border?: string }>;
}

export interface StationRarity {
    [key: string]: number; // 1 (Common) to 5 (Ultra Rare)
}

export type StepType = 'origin' | 'start' | 'travel' | 'transfer' | 'interruption';

export interface PathStep {
    id: string; // Unique ID for React keys
    station: string;
    lineUsed: LineId | null;
    type: StepType;
    timestamp: number;
}

export type GameMode = 'FREE' | 'WORK';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Outage {
    fromStation: string;
    toStation: string;
    line: string;
}

export interface GameState {
    status: 'MENU' | 'PLAYING' | 'FINISHED';
    mode: GameMode;
    difficulty?: Difficulty;
    targetStation: string | null;
    path: PathStep[];
    currentStation: string | null;
    currentLine: LineId | null;
    score: number;
    transfers: number;
    outages: Outage[]; // Active outages for this session
    interruptionsEncountered: number;
}

export interface Neighbor {
    station: string;
    direction: string;
}