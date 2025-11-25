import { METRO_DATA, STATION_RARITY } from '../data/metroData';
import { Neighbor, PathStep } from '../types';

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
    } else if (lineCode === "L6" || lineCode === "L12") {
        // Circular wrap-around for first element
        results.push({ station: lineArr[lineArr.length - 1], direction: endLabel });
    }

    // Next Station logic (Towards Index Last)
    if (idx < lineArr.length - 1) {
        results.push({ station: lineArr[idx + 1], direction: endLabel });
    } else if (lineCode === "L6" || lineCode === "L12") {
        // Circular wrap-around for last element
        results.push({ station: lineArr[0], direction: startLabel });
    }

    return results;
};

export const calculateScore = (path: PathStep[]): number => {
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

export const analyzeCommute = (path: PathStep[], transfers: number) => {
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