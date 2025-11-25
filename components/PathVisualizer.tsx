import React, { useEffect, useRef } from 'react';
import { PathStep } from '../types';
import { METRO_DATA, STATION_RARITY } from '../data/metroData';

interface PathVisualizerProps {
    path: PathStep[];
}

const PathVisualizer: React.FC<PathVisualizerProps> = ({ path }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [path]);

    // Helper to determine shape class based on line ID
    const getShapeClass = (lineId: string) => {
        // If it starts with 'C-', it's Cercanías (round). Otherwise Metro (square).
        return lineId.startsWith('C-') ? 'rounded-full' : 'rounded-sm';
    };

    return (
        <div className="bg-gray-50 border-b border-gray-200 p-4 h-48 overflow-y-auto scrollbar-hide relative">
            <div className="space-y-0">
                {path.map((step, index) => {
                    const lineStyle = step.lineUsed ? METRO_DATA.colors[step.lineUsed] : null;
                    const isRare = (STATION_RARITY[step.station] || 2) >= 3;
                    const isLast = index === path.length - 1;
                    const shapeClass = step.lineUsed ? getShapeClass(step.lineUsed) : 'rounded-full';

                    return (
                        <div key={step.id} className="relative pl-8 pb-4">
                            {/* Vertical Line Connector */}
                            {!isLast && (
                                <div className="absolute left-[11px] top-6 bottom-[-10px] w-0.5 bg-gray-200 z-0"></div>
                            )}

                            {/* Node Content */}
                            <div className="relative z-10 animate-fade-in-up">
                                {step.type === 'origin' && (
                                    <>
                                        <div className="absolute left-[-22px] top-1 w-4 h-4 rounded-full border-2 border-gray-900 bg-white shadow-sm"></div>
                                        <div className="text-sm text-gray-400 font-bold">Origen: {step.station}</div>
                                    </>
                                )}

                                {step.type === 'start' && lineStyle && (
                                    <>
                                        <div 
                                            className={`absolute left-[-26px] top-0 w-8 h-8 ${shapeClass} border-4 border-white shadow-sm flex items-center justify-center text-[10px]`}
                                            style={{ backgroundColor: lineStyle.bg, color: lineStyle.text, borderColor: lineStyle.border || 'white' }}
                                        >
                                            <i className="fa-solid fa-play"></i>
                                        </div>
                                        <div className="text-sm text-gray-800 font-bold pt-1 ml-1">Empezar en {step.lineUsed}</div>
                                    </>
                                )}

                                {step.type === 'transfer' && lineStyle && (
                                    <>
                                        <div 
                                            className={`absolute left-[-26px] top-0 w-8 h-8 ${shapeClass} border-4 border-white shadow-sm flex items-center justify-center text-[10px]`}
                                            style={{ backgroundColor: lineStyle.bg, color: lineStyle.text, borderColor: lineStyle.border || 'white' }}
                                        >
                                            <i className="fa-solid fa-shuffle"></i>
                                        </div>
                                        <div className="text-sm text-gray-500 font-bold pt-1 ml-1">Transbordo a {step.lineUsed}</div>
                                    </>
                                )}

                                {step.type === 'travel' && lineStyle && (
                                    <>
                                        <div 
                                            className="absolute left-[-22px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                            style={{ backgroundColor: lineStyle.bg, borderColor: lineStyle.border || 'white' }}
                                        ></div>
                                        <div className={`text-sm ${isRare ? 'text-purple-700 font-bold' : 'text-gray-800'}`}>
                                            {step.station} {isRare && '💎'}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default PathVisualizer;