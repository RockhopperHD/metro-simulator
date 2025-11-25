import React, { useState, useCallback, useMemo } from 'react';
import { GameState, PathStep } from './types';
import { getLinesForStation, getNeighbors, calculateScore } from './utils/gameLogic';
import StationSearch from './components/StationSearch';
import GameControls from './components/GameControls';
import PathVisualizer from './components/PathVisualizer';
import ResultView from './components/ResultView';

const App: React.FC = () => {
    // Initial State
    const [gameState, setGameState] = useState<GameState>({
        status: 'START',
        path: [],
        currentStation: null,
        currentLine: null,
        score: 0,
        transfers: 0
    });

    // Actions
    const handleStartGame = useCallback((station: string) => {
        const initialStep: PathStep = {
            id: Date.now().toString(),
            station: station,
            lineUsed: null,
            type: 'origin',
            timestamp: Date.now()
        };

        const score = calculateScore([initialStep]);

        setGameState({
            status: 'PLAYING',
            path: [initialStep],
            currentStation: station,
            currentLine: null,
            score: score,
            transfers: 0
        });
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
                score: calculateScore(newPath)
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
                score: calculateScore(newPath)
            };
        });
    }, []);

    const handleMove = useCallback((station: string, line: string) => {
        setGameState(prev => {
            const step: PathStep = {
                id: Date.now().toString(),
                station: station,
                lineUsed: line,
                type: 'travel',
                timestamp: Date.now()
            };
            const newPath = [...prev.path, step];
            return {
                ...prev,
                currentStation: station,
                path: newPath,
                score: calculateScore(newPath)
            };
        });
    }, []);

    const handleUndo = useCallback(() => {
        setGameState(prev => {
            if (prev.path.length <= 1) {
                // If we undo the origin, go back to start screen
                 return {
                    status: 'START',
                    path: [],
                    currentStation: null,
                    currentLine: null,
                    score: 0,
                    transfers: 0
                };
            }

            const newPath = prev.path.slice(0, -1);
            const lastStep = newPath[newPath.length - 1];
            
            let newStation = lastStep.station;
            let newLine = lastStep.lineUsed;
            
            // Recalculate derived stats
            const newScore = calculateScore(newPath);
            const newTransfers = newPath.filter(p => p.type === 'transfer').length;

            return {
                ...prev,
                path: newPath,
                currentStation: newStation,
                currentLine: newLine,
                score: newScore,
                transfers: newTransfers
            };
        });
    }, []);

    const handleEndGame = useCallback(() => {
        setGameState(prev => ({ ...prev, status: 'FINISHED' }));
    }, []);

    const handleReset = useCallback(() => {
        setGameState({
            status: 'START',
            path: [],
            currentStation: null,
            currentLine: null,
            score: 0,
            transfers: 0
        });
    }, []);

    // Derived Data for UI
    const availableNeighbors = useMemo(() => {
        if (!gameState.currentStation || !gameState.currentLine) return [];
        const neighbors = getNeighbors(gameState.currentLine, gameState.currentStation);
        
        // Anti-spam: Do not allow going back to the immediate previous station on 'travel' steps
        const lastStep = gameState.path[gameState.path.length - 1];
        if (lastStep && lastStep.type === 'travel') {
            const prevStep = gameState.path[gameState.path.length - 2];
            if (prevStep) {
                return neighbors.filter(n => n.station !== prevStep.station);
            }
        }

        return neighbors;
    }, [gameState.currentStation, gameState.currentLine, gameState.path]);

    const availableTransfers = useMemo(() => {
        if (!gameState.currentStation) return [];
        
        // RULE: You cannot transfer immediately after starting a line or transferring.
        // You must travel to at least one new station before transferring again.
        const lastStep = gameState.path[gameState.path.length - 1];
        if (lastStep && (lastStep.type === 'start' || lastStep.type === 'transfer')) {
            return [];
        }

        const lines = getLinesForStation(gameState.currentStation);
        
        // Anti-spam: Calculate which lines have already been used at this station
        // since the last arrival (Travel or Origin).
        // This prevents cycling Sol -> 2 -> 1 -> 2 ...
        
        let lastArrivalIndex = -1;
        // Find the index where we arrived at this station (or started)
        for (let i = gameState.path.length - 1; i >= 0; i--) {
            if (gameState.path[i].type === 'travel' || gameState.path[i].type === 'origin') {
                lastArrivalIndex = i;
                break;
            }
        }

        const linesUsedAtCurrentStation = new Set<string>();

        if (lastArrivalIndex !== -1) {
            // Include the line we arrived on (if travel)
            const arrivalStep = gameState.path[lastArrivalIndex];
            if (arrivalStep.type === 'travel' && arrivalStep.lineUsed) {
                linesUsedAtCurrentStation.add(arrivalStep.lineUsed);
            }

            // Include any lines used in Start or Transfer steps since arriving
            for (let i = lastArrivalIndex + 1; i < gameState.path.length; i++) {
                const step = gameState.path[i];
                if (step.lineUsed) {
                    linesUsedAtCurrentStation.add(step.lineUsed);
                }
            }
        }
        
        // Filter lines: remove current line and any line already used at this station instance
        return lines.filter(l => 
            l !== gameState.currentLine && !linesUsedAtCurrentStation.has(l)
        );
    }, [gameState.currentStation, gameState.currentLine, gameState.path]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative min-h-[650px] flex flex-col border border-gray-100">
                
                {/* Header */}
                <div className="bg-gray-900 p-6 text-white shrink-0 flex justify-between items-center shadow-md z-30">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wider flex items-center">
                            <i className="fa-solid fa-map-location-dot mr-2 text-blue-400"></i>
                            Metro Quest
                        </h1>
                        <p className="text-gray-400 text-xs mt-1 font-medium">Simulador de viaje interactivo</p>
                    </div>
                    {gameState.status === 'PLAYING' && (
                        <div className="text-right animate-pulse">
                            <div className="text-xs text-gray-400 font-bold uppercase">XP</div>
                            <div className="text-xl font-bold text-yellow-400">{gameState.score}</div>
                        </div>
                    )}
                </div>

                {/* Views */}
                {gameState.status === 'START' && (
                    <StationSearch onStart={handleStartGame} />
                )}

                {gameState.status === 'PLAYING' && gameState.currentStation && (
                    <div className="flex-1 flex flex-col relative animate-fade-in">
                        <PathVisualizer path={gameState.path} />
                        <GameControls 
                            currentStation={gameState.currentStation}
                            currentLine={gameState.currentLine}
                            neighbors={availableNeighbors}
                            transferLines={availableTransfers}
                            onMove={handleMove}
                            onStartLine={handleStartLine}
                            onTransfer={handleTransfer}
                            onEnd={handleEndGame}
                            onUndo={handleUndo}
                        />
                    </div>
                )}

                {gameState.status === 'FINISHED' && (
                    <ResultView gameState={gameState} onReset={handleReset} />
                )}
            </div>
            
            <div className="mt-4 text-gray-400 text-xs text-center max-w-xs">
                Datos basados en Metro de Madrid y Cercanías. <br/>Estaciones y transbordos son editables en el código backend.
            </div>
        </div>
    );
};

export default App;