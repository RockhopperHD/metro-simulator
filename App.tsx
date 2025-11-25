import React, { useState, useCallback, useMemo } from 'react';
import { GameState, PathStep, Difficulty, Outage } from './types';
import { getLinesForStation, getNeighbors, calculateScore, generateLevel } from './utils/gameLogic';
import StationSearch from './components/StationSearch';
import GameControls from './components/GameControls';
import PathVisualizer from './components/PathVisualizer';
import ResultView from './components/ResultView';
import MainMenu from './components/MainMenu';
import MapModal from './components/MapModal';
import OutageModal from './components/OutageModal';

const App: React.FC = () => {
    // Initial State
    const [gameState, setGameState] = useState<GameState>({
        status: 'MENU',
        mode: 'FREE',
        path: [],
        currentStation: null,
        currentLine: null,
        targetStation: null,
        score: 0,
        transfers: 0,
        outages: [],
        interruptionsEncountered: 0
    });

    // Modals state
    const [showMap, setShowMap] = useState(false);
    const [activeOutageAlert, setActiveOutageAlert] = useState<Outage | null>(null);

    // --- MENU ACTIONS ---

    const handleSelectFreeMode = useCallback(() => {
        setGameState({
            status: 'PLAYING',
            mode: 'FREE',
            path: [],
            currentStation: null, // Triggers StationSearch
            currentLine: null,
            targetStation: null,
            score: 0,
            transfers: 0,
            outages: [],
            interruptionsEncountered: 0
        });
    }, []);

    const handleSelectWorkMode = useCallback((difficulty: Difficulty) => {
        const level = generateLevel(difficulty);
        
        const initialStep: PathStep = {
            id: Date.now().toString(),
            station: level.start,
            lineUsed: null,
            type: 'origin',
            timestamp: Date.now()
        };

        setGameState({
            status: 'PLAYING',
            mode: 'WORK',
            difficulty: difficulty,
            path: [initialStep],
            currentStation: level.start,
            currentLine: null,
            targetStation: level.end,
            score: 0,
            transfers: 0,
            outages: level.outages,
            interruptionsEncountered: 0
        });
    }, []);

    // --- GAME ACTIONS ---

    const handleStartGame = useCallback((station: string) => {
        const initialStep: PathStep = {
            id: Date.now().toString(),
            station: station,
            lineUsed: null,
            type: 'origin',
            timestamp: Date.now()
        };

        const score = calculateScore([initialStep], 'FREE');

        setGameState(prev => ({
            ...prev,
            status: 'PLAYING',
            path: [initialStep],
            currentStation: station,
            currentLine: null,
            score: score,
            transfers: 0
        }));
    }, []);

    const handleStartLine = useCallback((line: string) => {
        setGameState(prev => {
            const step: PathStep = {
                id: Date.now().toString(),
                station: prev.currentStation!,
                lineUsed: line,
                type: 'start',
                timestamp: Date.now()
            };
            const newPath = [...prev.path, step];
            return {
                ...prev,
                currentLine: line,
                path: newPath,
                score: calculateScore(newPath, prev.mode)
            };
        });
    }, []);

    const handleTransfer = useCallback((line: string) => {
        setGameState(prev => {
            const step: PathStep = {
                id: Date.now().toString(),
                station: prev.currentStation!,
                lineUsed: line,
                type: 'transfer',
                timestamp: Date.now()
            };
            const newPath = [...prev.path, step];
            return {
                ...prev,
                currentLine: line,
                transfers: prev.transfers + 1,
                path: newPath,
                score: calculateScore(newPath, prev.mode)
            };
        });
    }, []);

    const handleMove = useCallback((targetStation: string, line: string) => {
        setGameState(prev => {
            // Check for outage
            const foundOutage = prev.outages.find(o => 
                o.line === line && 
                ((o.fromStation === prev.currentStation && o.toStation === targetStation) ||
                 (o.fromStation === targetStation && o.toStation === prev.currentStation))
            );

            if (foundOutage) {
                // Show Alert Modal
                setActiveOutageAlert(foundOutage);

                // Add interruption step to history, but DO NOT move player
                const step: PathStep = {
                    id: Date.now().toString(),
                    station: prev.currentStation!, // Stay put
                    lineUsed: line,
                    type: 'interruption',
                    timestamp: Date.now()
                };
                const newPath = [...prev.path, step];
                return {
                    ...prev,
                    path: newPath,
                    interruptionsEncountered: prev.interruptionsEncountered + 1
                };
            }

            // Normal Move
            const step: PathStep = {
                id: Date.now().toString(),
                station: targetStation,
                lineUsed: line,
                type: 'travel',
                timestamp: Date.now()
            };
            const newPath = [...prev.path, step];
            
            const newState = {
                ...prev,
                currentStation: targetStation,
                path: newPath,
                score: calculateScore(newPath, prev.mode)
            };

            // Check Win Condition for Work Mode
            if (prev.mode === 'WORK' && targetStation === prev.targetStation) {
                newState.status = 'FINISHED';
            }

            return newState;
        });
    }, []);

    const handleUndo = useCallback(() => {
        setGameState(prev => {
            if (prev.path.length <= 1) {
                // If we undo the origin
                if (prev.mode === 'WORK') return prev; // Cannot undo origin in Work mode
                 return {
                    ...prev,
                    status: 'PLAYING', // Go back to search
                    path: [],
                    currentStation: null,
                    currentLine: null,
                    score: 0,
                    transfers: 0
                } as GameState;
            }

            const newPath = prev.path.slice(0, -1);
            const lastStep = newPath[newPath.length - 1];
            
            let newStation = lastStep.station;
            let newLine = lastStep.lineUsed;
            
            // Recalculate derived stats
            const newScore = calculateScore(newPath, prev.mode);
            const newTransfers = newPath.filter(p => p.type === 'transfer').length;
            const newInterruptions = newPath.filter(p => p.type === 'interruption').length;

            return {
                ...prev,
                path: newPath,
                currentStation: newStation,
                currentLine: newLine,
                score: newScore,
                transfers: newTransfers,
                interruptionsEncountered: newInterruptions
            };
        });
    }, []);

    const handleEndGame = useCallback(() => {
        setGameState(prev => ({ ...prev, status: 'FINISHED' }));
    }, []);

    const handleReset = useCallback(() => {
        if (gameState.mode === 'WORK' && gameState.difficulty) {
            // Restart same difficulty
            handleSelectWorkMode(gameState.difficulty);
        } else {
            // Restart Free Mode
            handleSelectFreeMode();
        }
    }, [gameState.mode, gameState.difficulty, handleSelectWorkMode, handleSelectFreeMode]);

    const handleBackToMenu = useCallback(() => {
        setGameState({
            status: 'MENU',
            mode: 'FREE',
            path: [],
            currentStation: null,
            currentLine: null,
            targetStation: null,
            score: 0,
            transfers: 0,
            outages: [],
            interruptionsEncountered: 0
        });
    }, []);

    // Derived Data for UI
    const availableNeighbors = useMemo(() => {
        if (!gameState.currentStation || !gameState.currentLine) return [];
        const neighbors = getNeighbors(gameState.currentLine, gameState.currentStation);
        
        // Prevent Soft-lock: If there is only one neighbor, it means we are at a terminal end
        // or a stub. We MUST allow the player to go back, otherwise they are stuck.
        if (neighbors.length === 1) {
            return neighbors;
        }

        // Anti-spam: Do not allow going back to the immediate previous station on 'travel' steps
        // BUT: In WORK mode, outages might force backtracking, so we allow it.
        if (gameState.mode === 'FREE') {
            const lastStep = gameState.path[gameState.path.length - 1];
            if (lastStep && lastStep.type === 'travel') {
                const prevStep = gameState.path[gameState.path.length - 2];
                if (prevStep) {
                    return neighbors.filter(n => n.station !== prevStep.station);
                }
            }
        }

        return neighbors;
    }, [gameState.currentStation, gameState.currentLine, gameState.path, gameState.mode]);

    const availableTransfers = useMemo(() => {
        if (!gameState.currentStation) return [];
        
        // RULE: You cannot transfer immediately after starting a line or transferring.
        const lastStep = gameState.path[gameState.path.length - 1];
        if (lastStep && (lastStep.type === 'start' || lastStep.type === 'transfer')) {
            return [];
        }

        const lines = getLinesForStation(gameState.currentStation);
        
        if (gameState.mode === 'FREE') {
            // Anti-spam logic (Free Mode): Prevent cycling lines
            let lastArrivalIndex = -1;
            for (let i = gameState.path.length - 1; i >= 0; i--) {
                if (gameState.path[i].type === 'travel' || gameState.path[i].type === 'origin') {
                    lastArrivalIndex = i;
                    break;
                }
            }

            const linesUsedAtCurrentStation = new Set<string>();

            if (lastArrivalIndex !== -1) {
                const arrivalStep = gameState.path[lastArrivalIndex];
                if (arrivalStep.type === 'travel' && arrivalStep.lineUsed) {
                    linesUsedAtCurrentStation.add(arrivalStep.lineUsed);
                }
                for (let i = lastArrivalIndex + 1; i < gameState.path.length; i++) {
                    const step = gameState.path[i];
                    if (step.lineUsed) {
                        linesUsedAtCurrentStation.add(step.lineUsed);
                    }
                }
            }
            
            return lines.filter(l => 
                l !== gameState.currentLine && !linesUsedAtCurrentStation.has(l)
            );
        } else {
             // Work mode: Just filter current line AND EXCLUDE CERCANIAS
             return lines.filter(l => 
                 l !== gameState.currentLine && 
                 !l.startsWith('C-')
             );
        }

    }, [gameState.currentStation, gameState.currentLine, gameState.path, gameState.mode]);

    return (
        <div className="h-[100dvh] flex flex-col items-center justify-center p-0 sm:p-4 bg-gray-100">
            <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border-0 sm:border border-gray-100 h-full sm:h-[90vh] sm:max-h-[850px]">
                
                {/* Header */}
                <div className="bg-gray-900 p-4 shrink-0 flex justify-between items-center shadow-md z-30 relative">
                    <div onClick={handleBackToMenu} className="cursor-pointer group">
                        <h1 className="text-lg font-bold uppercase tracking-wider flex items-center text-white group-hover:text-blue-300 transition-colors">
                            <i className="fa-solid fa-map-location-dot mr-2 text-blue-400"></i>
                            Metro Quest
                        </h1>
                        <p className="text-gray-400 text-xs font-medium">
                            {gameState.mode === 'FREE' ? 'Juego Libre' : 'Simular Trabajo'}
                        </p>
                    </div>
                    {gameState.status === 'PLAYING' && gameState.mode === 'FREE' && (
                        <div className="text-right animate-pulse">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">XP</div>
                            <div className="text-lg font-bold text-yellow-400">{gameState.score}</div>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                {showMap && <MapModal onClose={() => setShowMap(false)} />}
                
                {activeOutageAlert && (
                    <OutageModal 
                        line={activeOutageAlert.line} 
                        onDismiss={() => setActiveOutageAlert(null)} 
                    />
                )}

                {/* Views */}
                {gameState.status === 'MENU' && (
                    <MainMenu 
                        onSelectFreeMode={handleSelectFreeMode}
                        onSelectWorkMode={handleSelectWorkMode}
                    />
                )}

                {gameState.status === 'PLAYING' && !gameState.currentStation && (
                     // Only for Free Mode start
                    <StationSearch onStart={handleStartGame} />
                )}

                {gameState.status === 'PLAYING' && gameState.currentStation && (
                    <div className="flex-1 flex flex-col relative animate-fade-in overflow-hidden">
                        <PathVisualizer path={gameState.path} />
                        <GameControls 
                            mode={gameState.mode}
                            currentStation={gameState.currentStation}
                            currentLine={gameState.currentLine}
                            neighbors={availableNeighbors}
                            transferLines={availableTransfers}
                            targetStation={gameState.targetStation}
                            knownOutages={gameState.outages}
                            onMove={handleMove}
                            onStartLine={handleStartLine}
                            onTransfer={handleTransfer}
                            onEnd={handleEndGame}
                            onUndo={handleUndo}
                            onToggleMap={() => setShowMap(true)}
                        />
                    </div>
                )}

                {gameState.status === 'FINISHED' && (
                    <ResultView gameState={gameState} onReset={handleReset} onBackToMenu={handleBackToMenu} />
                )}
            </div>
            
            <div className="hidden sm:block mt-2 text-gray-400 text-[10px] text-center max-w-xs">
                Datos basados en Metro de Madrid y Cercanías.
            </div>
        </div>
    );
};

export default App;
