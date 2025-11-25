export type LineId = string;

export interface MetroData {
    lines: Record<LineId, string[]>;
    directions: Record<LineId, { start: string; end: string } | undefined>;
    colors: Record<LineId, { bg: string; text: string; border?: string }>;
}

export interface StationRarity {
    [key: string]: number; // 1 (Common) to 5 (Ultra Rare)
}

export type StepType = 'origin' | 'start' | 'travel' | 'transfer';

export interface PathStep {
    id: string; // Unique ID for React keys
    station: string;
    lineUsed: LineId | null;
    type: StepType;
    timestamp: number;
}

export interface GameState {
    status: 'START' | 'PLAYING' | 'FINISHED';
    path: PathStep[];
    currentStation: string | null;
    currentLine: LineId | null;
    score: number;
    transfers: number;
}

export interface Neighbor {
    station: string;
    direction: string;
}