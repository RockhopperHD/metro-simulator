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
    } else if (lineCode === "6" || lineCode === "12") { // Fixed "L6" to "6" to match keys
        // Circular wrap-around for first element
        results.push({ station: lineArr[lineArr.length - 1], direction: endLabel });
    }

    // Next Station logic (Towards Index Last)
    if (idx < lineArr.length - 1) {
        results.push({ station: lineArr[idx + 1], direction: endLabel });
    } else if (lineCode === "6" || lineCode === "12") { // Fixed "L6" to "6" to match keys
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
    // We treat the first move as a "start" on a line
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
                if (node.action !== 'origin') { // Don't add origin here if we want to match game structure exactly, or add it.
                    // The game structure usually starts with an 'origin' step, then 'start' or 'transfer'.
                    // Our parent chain includes the origin dummy node.
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
    // Ideally we pick stations that have Metro connections.
    const metroStations = allStations.filter(s => getLinesForStation(s).some(l => !l.startsWith('C-')));

    while (!isValid && attempts < 100) {
        attempts++;
        outages = [];

        // 1. Pick Start
        let pool = metroStations;
        if (difficulty === 'EASY') {
            const popular = ['Sol', 'Nuevos Ministerios', 'Atocha', 'Chamartín', 'Moncloa'];
            pool = popular;
        } else if (difficulty === 'MEDIUM') {
            const medium = ['Legazpi', 'Tribunal', 'Plaza de Castilla', 'Cuatro Caminos', 'Pacifico'];
            pool = medium;
        } else {
            // Hard - Rarity >= 3
            pool = metroStations.filter(s => (STATION_RARITY[s] || 2) >= 3);
        }
        start = pool[Math.floor(Math.random() * pool.length)];

        // 2. Pick End (Random but distinct, reachable via Metro)
        do {
            end = metroStations[Math.floor(Math.random() * metroStations.length)];
        } while (end === start);

        // 3. Generate Outages intelligently
        const interruptionCount = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 3 : 6; 
        
        let validPathExists = true;

        for (let i = 0; i < interruptionCount; i++) {
            // Calculate current optimal path with existing outages, excluding Cercanías
            const currentRoute = findOptimalPath(start, end, outages, true);
            
            if (!currentRoute) {
                validPathExists = false;
                break;
            }

            // Find travel segments in the current optimal path
            const travelSegments: { from: string, to: string, line: string }[] = [];
            for (let j = 1; j < currentRoute.fullPath.length; j++) {
                const step = currentRoute.fullPath[j];
                const prev = currentRoute.fullPath[j-1];
                if (step.type === 'travel' && step.lineUsed) {
                    travelSegments.push({ from: prev.station, to: step.station, line: step.lineUsed });
                }
            }

            if (travelSegments.length === 0) break;

            // Pick a random segment from the optimal path to break
            // This forces the user to find a new route
            const segmentToBreak = travelSegments[Math.floor(Math.random() * travelSegments.length)];
            const newOutage: Outage = {
                fromStation: segmentToBreak.from,
                toStation: segmentToBreak.to,
                line: segmentToBreak.line
            };

            // Verify if path still exists after adding this outage
            const testOutages = [...outages, newOutage];
            if (findOptimalPath(start, end, testOutages, true)) {
                outages.push(newOutage);
            } else {
                // If breaking this makes it impossible, try to break a different random edge in the network
                // just to add noise, or skip adding an outage this turn.
                // For now, we skip to keep it solvable.
            }
        }
        
        // Final check
        if (findOptimalPath(start, end, outages, true)) {
            isValid = true;
        }
    }

    return { start, end, outages };
};