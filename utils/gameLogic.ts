import { METRO_DATA, STATION_RARITY } from '../data/metroData';
import { Neighbor, PathStep, Outage, Difficulty } from '../types';

export const getAllStations = (): string[] => {
    const all = new Set<string>();
    Object.values(METRO_DATA.lines).forEach(line => {
        line.forEach(station => all.add(station));
    });
    return Array.from(all).sort();
};

export const getLinesForStation = (station: string): string[] => {
    return Object.keys(METRO_DATA.lines).filter(key => 
        METRO_DATA.lines[key].includes(station)
    );
};

export const getNeighbors = (lineCode: string, stationName: string): Neighbor[] => {
    const lineArr = METRO_DATA.lines[lineCode];
    if (!lineArr) return [];
    
    const idx = lineArr.indexOf(stationName);
    if (idx === -1) return [];

    const results: Neighbor[] = [];
    const configDir = METRO_DATA.directions[lineCode];
    const startLabel = configDir?.start || lineArr[0];
    const endLabel = configDir?.end || lineArr[lineArr.length - 1];

    // Previous Station logic (Towards Index 0)
    if (idx > 0) {
        results.push({ station: lineArr[idx - 1], direction: startLabel });
    } else if (lineCode === "6" || lineCode === "12") {
        // Circular wrap-around for first element
        results.push({ station: lineArr[lineArr.length - 1], direction: endLabel });
    }

    // Next Station logic (Towards Index Last)
    if (idx < lineArr.length - 1) {
        results.push({ station: lineArr[idx + 1], direction: endLabel });
    } else if (lineCode === "6" || lineCode === "12") {
        // Circular wrap-around for last element
        results.push({ station: lineArr[0], direction: startLabel });
    }

    return results;
};

export const calculateScore = (path: PathStep[], mode: 'FREE' | 'WORK' = 'FREE'): number => {
    if (mode === 'WORK') {
        const travelSteps = path.filter(p => p.type === 'travel').length;
        const transfers = path.filter(p => p.type === 'transfer').length;
        return travelSteps + (transfers * 5);
    }

    let s = 0;
    const uniqueVisited = new Set<string>();
    
    path.forEach(step => {
        if (step.type === 'travel' || step.type === 'origin') {
            if (!uniqueVisited.has(step.station)) {
                uniqueVisited.add(step.station);
                const r = STATION_RARITY[step.station] || 2; // Default rarity is 2
                s += (r === 4 ? 50 : r === 3 ? 25 : 10);
            }
        } else if (step.type === 'transfer') {
            s += 20;
        }
    });
    return s;
};

export const analyzeCommute = (path: PathStep[], transfers: number, mode: 'FREE' | 'WORK') => {
    if (mode === 'WORK') {
        const interruptions = path.filter(p => p.type === 'interruption').length;
        return {
            stopsCount: path.filter(p => p.type === 'travel').length,
            rarityBonus: 0,
            rank: interruptions === 0 ? "Empleado del Mes" : "Llegando Tarde",
            summary: `Sufriste ${interruptions} interrupciones.`,
            interruptions
        };
    }

    const stopsCount = new Set(path.filter(p => p.type === 'travel').map(p => p.station)).size;
    let rarityBonus = 0;
    
    path.forEach(step => {
        if (step.type === 'travel' && (STATION_RARITY[step.station] || 2) >= 3) {
            rarityBonus += 25;
        }
    });

    let rank = "El Turista";
    let summary = "Corto y dulce.";
    
    if (transfers > 2) { rank = "Corredor del Laberinto"; summary = "Te encantan los transbordos."; }
    else if (stopsCount > 10) { rank = "Viajero de Largo Recorrido"; summary = "Ha sido una maratón."; }
    else if (rarityBonus > 50) { rank = "Explorador"; summary = "Has visitado los rincones más profundos."; }
    
    return {
        stopsCount,
        rarityBonus,
        rank,
        summary
    };
};

// --- SHARE FUNCTIONALITY ---

const getLineEmoji = (lineId: string): string => {
    if (lineId.startsWith('C-')) return '⚪'; // Circle for Cercanías
    
    // Approximate square colors
    switch (lineId) {
        case '1': return '🟦'; // Blue
        case '2': return '🟥'; // Red
        case '3': return '🟨'; // Yellow
        case '4': return '🟫'; // Brown
        case '5': return '🟩'; // Green
        case '6': return '⬜'; // Grey (White square usually looks greyish/silver on many OS)
        case '7': return '🟧'; // Orange
        case '8': return '🌸'; // Pink
        case '9': return '🟪'; // Purple
        case '10': return '🔵'; // Dark Blue (Circle used as backup for dark blue square shortage)
        case '11': return '🟢'; // Dark Green
        case '12': return '🔶'; // Gold/Khaki
        case 'R': return '⬜';
        default: return '⬛';
    }
};

export const generateShareText = (
    path: PathStep[], 
    score: number, 
    mode: 'FREE' | 'WORK', 
    rank: string, 
    interruptions: number,
    optimalStops: number | undefined
): string => {
    let emojiPath = "";
    
    path.forEach(step => {
        if (step.type === 'travel' && step.lineUsed) {
            emojiPath += getLineEmoji(step.lineUsed);
        } else if (step.type === 'transfer') {
            emojiPath += "➡️";
        }
    });

    // Limit emoji path length for readability
    if (emojiPath.length > 50) {
        emojiPath = emojiPath.substring(0, 48) + "...";
    }

    if (mode === 'FREE') {
        return `METRO QUEST 🚇\nPuntuación: ${score} | Soy: ${rank}\n${emojiPath}`;
    } else {
        const stops = path.filter(p => p.type === 'travel').length;
        // Avoid division by zero
        const efficiency = optimalStops && optimalStops > 0 
            ? Math.round((optimalStops / stops) * 100) 
            : 100;
            
        return `METRO QUEST 🚇\nEficiencia: ${efficiency}% | ⚠️ ${interruptions}\n${emojiPath}`;
    }
};


// --- BFS & LEVEL GEN ---

interface BFSNode {
    station: string;
    line: string | null;
    parent: BFSNode | null;
    action: 'start' | 'travel' | 'transfer' | 'origin';
    depth: number;
    transfers: number;
}

// Improved BFS to find shortest path and return the full path steps
export const findOptimalPath = (
    start: string, 
    end: string, 
    activeOutages: Outage[] = [],
    excludeCercanias: boolean = false
): { steps: number, transfers: number, fullPath: PathStep[] } | null => {
    
    const queue: BFSNode[] = [];
    const visited = new Set<string>(); // "station|line"

    // Initialize with origin
    const startLines = getLinesForStation(start);
    startLines.forEach(l => {
        if (excludeCercanias && l.startsWith('C-')) return;

        queue.push({ 
            station: start, 
            line: l, 
            parent: { station: start, line: null, parent: null, action: 'origin', depth: 0, transfers: 0 },
            action: 'start',
            depth: 0, 
            transfers: 0 
        });
        visited.add(`${start}|${l}`);
    });

    while (queue.length > 0) {
        const curr = queue.shift()!;
        
        if (curr.station === end) {
            // Reconstruct Path
            const path: PathStep[] = [];
            let node: BFSNode | null = curr;
            while (node) {
                if (node.action !== 'origin') {
                    path.unshift({
                        id: `opt-${node.station}-${node.depth}`,
                        station: node.station,
                        lineUsed: node.line,
                        type: node.action as any,
                        timestamp: 0
                    });
                } else {
                     path.unshift({
                        id: `opt-origin`,
                        station: node.station,
                        lineUsed: null,
                        type: 'origin',
                        timestamp: 0
                    });
                }
                node = node.parent;
            }
            return { steps: curr.depth, transfers: curr.transfers, fullPath: path };
        }

        if (!curr.line) continue;

        // 1. Move to neighbors on current line
        const neighbors = getNeighbors(curr.line, curr.station);
        for (const n of neighbors) {
            // Check outages
            const isBlocked = activeOutages.some(o => 
                o.line === curr.line && 
                ((o.fromStation === curr.station && o.toStation === n.station) ||
                 (o.fromStation === n.station && o.toStation === curr.station))
            );

            if (!isBlocked) {
                const stateKey = `${n.station}|${curr.line}`;
                if (!visited.has(stateKey)) {
                    visited.add(stateKey);
                    queue.push({ 
                        station: n.station, 
                        line: curr.line, 
                        parent: curr,
                        action: 'travel',
                        depth: curr.depth + 1, 
                        transfers: curr.transfers 
                    });
                }
            }
        }

        // 2. Transfer to other lines at current station
        const availableLines = getLinesForStation(curr.station).filter(l => l !== curr.line);
        for (const l of availableLines) {
            if (excludeCercanias && l.startsWith('C-')) continue;

            const stateKey = `${curr.station}|${l}`;
            if (!visited.has(stateKey)) {
                visited.add(stateKey);
                queue.push({ 
                    station: curr.station, 
                    line: l, 
                    parent: curr,
                    action: 'transfer',
                    depth: curr.depth, 
                    transfers: curr.transfers + 1 
                });
            }
        }
    }

    return null; // No path found
};

export const generateLevel = (difficulty: Difficulty) => {
    const allStations = getAllStations();
    let start = "";
    let end = "";
    let outages: Outage[] = [];
    let isValid = false;
    let attempts = 0;

    // Filter stations suitable for work mode (exclude pure Cercanias stations if possible, or just accept them)
    const metroStations = allStations.filter(s => getLinesForStation(s).some(l => !l.startsWith('C-')));

    while (!isValid && attempts < 100) {
        attempts++;
        outages = [];

        // 1. Pick Start & End
        let pool = metroStations;
        // In Hard mode, pick rarer starts
        if (difficulty === 'HARD') {
            pool = metroStations.filter(s => (STATION_RARITY[s] || 2) >= 3);
        } else if (difficulty === 'EASY') {
            pool = ['Sol', 'Nuevos Ministerios', 'Atocha', 'Chamartín', 'Moncloa'];
        }
        
        start = pool[Math.floor(Math.random() * pool.length)];
        do {
            end = metroStations[Math.floor(Math.random() * metroStations.length)];
        } while (end === start);

        // 2. Determine Outage Constraints
        let targetOutages = 0;
        let minOutages = 0;

        if (difficulty === 'EASY') {
            targetOutages = 0;
            minOutages = 0;
        } else if (difficulty === 'MEDIUM') {
            minOutages = 1;
            targetOutages = Math.floor(Math.random() * 3) + 1; // 1 to 3
        } else { // HARD
            minOutages = 2;
            targetOutages = Math.floor(Math.random() * 4) + 2; // 2 to 5
        }
        
        if (targetOutages === 0) {
            // For Easy mode, just verify path exists
            if (findOptimalPath(start, end, [], true)) {
                isValid = true;
                return { start, end, outages: [] };
            }
            continue;
        }

        // 3. Iteratively break the optimal path
        let outageAttempts = 0;
        while (outages.length < targetOutages && outageAttempts < 20) {
            outageAttempts++;
            
            // Calculate current optimal path with existing outages
            const currentRoute = findOptimalPath(start, end, outages, true);
            if (!currentRoute) break; // Should exist because we check validity later, but safe to break

            // Find valid travel segments to break
            const travelSegments: { from: string, to: string, line: string }[] = [];
            for (let j = 1; j < currentRoute.fullPath.length; j++) {
                const step = currentRoute.fullPath[j];
                const prev = currentRoute.fullPath[j-1];
                if (step.type === 'travel' && step.lineUsed) {
                    travelSegments.push({ from: prev.station, to: step.station, line: step.lineUsed });
                }
            }

            // Safe filtering: Don't break connections directly touching start/end to avoid instant frustration
            const safeSegments = travelSegments.filter(s => 
                s.to !== end && s.from !== end && s.to !== start && s.from !== start
            );

            if (safeSegments.length === 0) break; // Can't break this path safely anymore

            // Pick a random segment to break
            const segmentToBreak = safeSegments[Math.floor(Math.random() * safeSegments.length)];
            const newOutage: Outage = {
                fromStation: segmentToBreak.from,
                toStation: segmentToBreak.to,
                line: segmentToBreak.line
            };

            // Verify if path still exists after adding this outage
            const testOutages = [...outages, newOutage];
            if (findOptimalPath(start, end, testOutages, true)) {
                outages.push(newOutage);
            }
        }
        
        // 4. Validate Minimum Requirements
        if (outages.length >= minOutages) {
             // Final check
             if (findOptimalPath(start, end, outages, true)) {
                isValid = true;
             }
        }
    }

    if (!isValid) {
        // Fallback safe level
        return { start: "Sol", end: "Moncloa", outages: [] };
    }

    return { start, end, outages };
};