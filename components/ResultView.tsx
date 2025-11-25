import React, { useMemo } from 'react';
import { GameState } from '../types';
import { analyzeCommute } from '../utils/gameLogic';

interface ResultViewProps {
    gameState: GameState;
    onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ gameState, onReset }) => {
    const results = useMemo(() => 
        analyzeCommute(gameState.path, gameState.transfers), 
    [gameState.path, gameState.transfers]);

    return (
        <div className="absolute inset-0 bg-white z-20 flex flex-col p-8 overflow-y-auto animate-fade-in">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Puntuación Final</div>
                <div className="text-7xl font-black text-blue-600 mb-2 drop-shadow-sm">{gameState.score}</div>
                <div className="text-2xl font-bold text-gray-800 mb-6 px-4 bg-blue-50 rounded-full py-1 text-blue-900">
                    {results.rank}
                </div>
                
                <div className="w-full space-y-3 mb-8 text-left max-w-sm">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Paradas Visitadas</span>
                        <span className="font-bold text-xl text-gray-800">{results.stopsCount}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Transbordos</span>
                        <span className="font-bold text-xl text-gray-800">{gameState.transfers}</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex justify-between items-center">
                        <span className="text-purple-700 font-medium">Bono de Rareza</span>
                        <span className="font-bold text-xl text-purple-600">+{results.rarityBonus}</span>
                    </div>
                </div>
                
                <p className="text-gray-500 italic mb-8 max-w-xs text-center leading-relaxed">
                    "{results.summary}"
                </p>
            </div>
            
            <button 
                onClick={onReset}
                className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-rotate-right"></i>
                Jugar Otra Vez
            </button>
        </div>
    );
};

export default ResultView;