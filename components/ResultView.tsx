import React, { useMemo, useState } from 'react';
import { GameState } from '../types';
import { analyzeCommute, findOptimalPath } from '../utils/gameLogic';
import PathVisualizer from './PathVisualizer';

interface ResultViewProps {
    gameState: GameState;
    onReset: () => void;
    onBackToMenu: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ gameState, onReset, onBackToMenu }) => {
    const [showOptimalPath, setShowOptimalPath] = useState(false);

    const results = useMemo(() => 
        analyzeCommute(gameState.path, gameState.transfers, gameState.mode), 
    [gameState.path, gameState.transfers, gameState.mode]);

    // Calculate optimal path stats for Work Mode
    const optimalStats = useMemo(() => {
        if (gameState.mode !== 'WORK' || !gameState.targetStation) return null;
        const startStep = gameState.path[0];
        // Calculate excluding Cercanías for Work Mode
        return findOptimalPath(startStep.station, gameState.targetStation, gameState.outages, true);
    }, [gameState]);

    return (
        <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 overflow-y-auto animate-fade-in scrollbar-hide">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Resultado Final</div>
                
                {gameState.mode === 'FREE' ? (
                    <>
                        <div className="text-7xl font-black text-blue-600 mb-2 drop-shadow-sm">{gameState.score}</div>
                        <div className="text-2xl font-bold text-gray-800 mb-6 px-4 bg-blue-50 rounded-full py-1 text-blue-900">
                            {results.rank}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-5xl font-black text-indigo-600 mb-2 drop-shadow-sm">¡Llegaste!</div>
                        <div className="text-xl font-bold text-gray-800 mb-6 px-4 bg-indigo-50 rounded-full py-1 text-indigo-900">
                             {results.rank}
                        </div>
                    </>
                )}
                
                <div className="w-full space-y-3 mb-6 text-left max-w-sm">
                    {gameState.mode === 'WORK' && optimalStats && (
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-4 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Eficiencia</div>
                                <button 
                                    onClick={() => setShowOptimalPath(!showOptimalPath)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                                >
                                    {showOptimalPath ? 'Ocultar Ruta' : 'Ver Mejor Ruta'}
                                </button>
                            </div>
                            
                            {showOptimalPath ? (
                                <div className="mt-2 bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
                                    <div className="h-48 overflow-y-auto">
                                        <PathVisualizer path={optimalStats.fullPath} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-600 text-sm">Tu Ruta:</span>
                                        <span className="font-bold text-gray-800 text-sm">{results.stopsCount} paradas / {gameState.transfers} tb.</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">Mejor Ruta:</span>
                                        <span className="font-bold text-green-600 text-sm">{optimalStats.steps} paradas / {optimalStats.transfers} tb.</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                            <span className="font-bold text-2xl text-gray-800">{results.stopsCount}</span>
                            <span className="text-gray-500 text-xs uppercase font-bold mt-1">Paradas</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                            <span className="font-bold text-2xl text-gray-800">{gameState.transfers}</span>
                            <span className="text-gray-500 text-xs uppercase font-bold mt-1">Transbordos</span>
                        </div>
                    </div>

                    {gameState.mode === 'FREE' && (
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Bono de Rareza</span>
                            <span className="font-bold text-xl text-purple-600">+{results.rarityBonus}</span>
                        </div>
                    )}
                    {gameState.mode === 'WORK' && (
                         <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                            <span className="text-red-700 font-medium">Incidencias</span>
                            <span className="font-bold text-xl text-red-600">{gameState.interruptionsEncountered}</span>
                        </div>
                    )}
                </div>
                
                <p className="text-gray-500 italic mb-6 max-w-xs text-center text-sm leading-relaxed">
                    "{results.summary}"
                </p>
            </div>
            
            <div className="space-y-3 shrink-0">
                <button 
                    onClick={onReset}
                    className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-rotate-right"></i>
                    {gameState.mode === 'WORK' ? 'Reintentar Nivel' : 'Jugar Otra Vez'}
                </button>
                <button 
                    onClick={onBackToMenu}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-bars"></i>
                    Menú Principal
                </button>
            </div>
        </div>
    );
};

export default ResultView;