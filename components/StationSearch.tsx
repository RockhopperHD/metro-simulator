import React, { useState, useMemo } from 'react';
import { getAllStations } from '../utils/gameLogic';

interface StationSearchProps {
    onStart: (station: string) => void;
}

// Updated Popular Starts based on user request
const POPULAR_STARTS = ['Sol', 'Nuevos Ministerios', 'Gran Vía', 'Tribunal'];

const StationSearch: React.FC<StationSearchProps> = ({ onStart }) => {
    const [query, setQuery] = useState('');
    const allStations = useMemo(() => getAllStations(), []);

    const suggestions = useMemo(() => {
        if (query.length < 2) return [];
        return allStations
            .filter(s => s.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
    }, [query, allStations]);

    return (
        <div className="p-6 flex-1 flex flex-col justify-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Estación de Origen</h2>
            <p className="text-gray-500 mb-6">¿Dónde comienza tu viaje?</p>
            
            <div className="relative group">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:bg-white text-lg text-gray-900 transition-all" 
                    placeholder="Buscar estación..." 
                    autoComplete="off"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
                
                {suggestions.length > 0 && (
                    <div className="absolute w-full bg-white border border-gray-200 rounded-xl mt-2 max-h-64 overflow-y-auto shadow-xl z-50 divide-y divide-gray-100">
                        {suggestions.map(s => (
                            <div 
                                key={s} 
                                onClick={() => onStart(s)}
                                className="p-3 hover:bg-blue-50 cursor-pointer text-gray-700 font-medium transition-colors"
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <p className="text-xs text-gray-400 uppercase font-bold mb-3 tracking-wider">Inicio Rápido</p>
                <div className="flex gap-2 flex-wrap">
                    {POPULAR_STARTS.map(s => (
                        <button 
                            key={s} 
                            onClick={() => onStart(s)} 
                            className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StationSearch;