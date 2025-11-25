import React, { useState, useEffect } from 'react';
import { METRO_DATA } from '../data/metroData';
import { Neighbor } from '../types';

interface GameControlsProps {
    currentStation: string;
    currentLine: string | null;
    neighbors: Neighbor[];
    transferLines: string[];
    onMove: (station: string, line: string) => void;
    onStartLine: (line: string) => void;
    onTransfer: (line: string) => void;
    onEnd: () => void;
    onUndo: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
    currentStation, 
    currentLine, 
    neighbors, 
    transferLines, 
    onMove, 
    onStartLine, 
    onTransfer,
    onEnd,
    onUndo
}) => {
    // Determine initial mode based on current line or defaults
    const [viewMode, setViewMode] = useState<'METRO' | 'CERCANIAS'>('METRO');

    useEffect(() => {
        if (currentLine && currentLine.startsWith('C-')) {
            setViewMode('CERCANIAS');
        } else {
            setViewMode('METRO');
        }
    }, [currentLine, currentStation]);
    
    // Helper to get line badge style
    const getBadgeStyle = (lineCode: string) => {
        const style = METRO_DATA.colors[lineCode] || { bg: '#999', text: 'white' };
        return {
            backgroundColor: style.bg,
            color: style.text,
            border: style.border ? `2px solid ${style.border}` : 'none'
        };
    };

    // Helper for shape differentiation
    const getShapeClass = (lineCode: string) => {
        return lineCode.startsWith('C-') ? 'rounded-full' : 'rounded-sm';
    };

    // Separate Metro and Cercanías lines
    const metroTransfers = transferLines.filter(l => !l.startsWith('C-'));
    const cercaniasTransfers = transferLines.filter(l => l.startsWith('C-'));

    const renderTransferButton = (l: string) => {
        const isStart = !currentLine;
        const style = METRO_DATA.colors[l] || { bg: '#ccc', text: 'black' };
        return (
            <button
                key={l}
                onClick={() => isStart ? onStartLine(l) : onTransfer(l)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 mb-2 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center active:scale-[0.98]"
            >
                <div 
                    className={`w-8 h-8 ${getShapeClass(l)} flex items-center justify-center mr-3 font-bold text-xs shrink-0`}
                    style={{ backgroundColor: style.bg, color: style.text, border: style.border ? `2px solid ${style.border}` : undefined }}
                >
                    <i className={`fa-solid ${isStart ? 'fa-play' : 'fa-shuffle'}`}></i>
                </div>
                <div className="font-semibold text-gray-700">
                    {isStart ? `Empezar en ${l}` : `Transbordo a ${l}`}
                </div>
            </button>
        );
    };

    return (
        <div className="p-4 flex-1 flex flex-col bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 rounded-t-3xl relative -mt-4">
            <div className="mb-4 flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estación Actual</span>
                    <h2 className="text-3xl font-black text-gray-800 leading-tight mb-2">{currentStation}</h2>
                    <div className="flex gap-2 flex-wrap">
                        {/* Display badges for all lines at this station */}
                        {[...(currentLine ? [currentLine] : []), ...transferLines].sort().map(line => (
                            <span 
                                key={line}
                                className={`inline-flex items-center justify-center px-2 py-0.5 ${getShapeClass(line)} text-xs font-bold min-w-[24px]`}
                                style={getBadgeStyle(line)}
                            >
                                {line}
                            </span>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={onUndo}
                    className="p-2 text-gray-400 hover:text-gray-800 transition-colors"
                    title="Deshacer"
                >
                    <i className="fa-solid fa-rotate-left text-xl"></i>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {/* 1. MOVEMENT CONTROLS */}
                {currentLine && (
                    <>
                        <div className="text-xs font-bold text-gray-400 mt-2 mb-1 uppercase">Viajando en {currentLine}</div>
                        {neighbors.length === 0 && (
                            <div className="p-3 text-sm text-gray-500 italic bg-gray-50 rounded-xl">Final de línea o cambio de sentido necesario.</div>
                        )}
                        {neighbors.map((n, idx) => {
                             const style = METRO_DATA.colors[currentLine];
                             return (
                                <button
                                    key={`${n.station}-${idx}`}
                                    onClick={() => onMove(n.station, currentLine)}
                                    className="w-full text-left p-3 rounded-xl border-2 border-gray-100 mb-2 hover:border-blue-100 hover:bg-blue-50 transition-all flex items-center group active:scale-[0.98]"
                                >
                                    <div 
                                        className={`w-10 h-10 ${getShapeClass(currentLine)} flex items-center justify-center mr-3 font-bold text-sm shrink-0 transition-transform group-hover:scale-110`}
                                        style={{ backgroundColor: style.bg, color: style.text, border: style.border ? `2px solid ${style.border}` : undefined }}
                                    >
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{n.station}</div>
                                        <div className="text-xs text-gray-500">Hacia {n.direction}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </>
                )}

                {/* 2. TRANSFERS / START */}
                {(metroTransfers.length > 0 || cercaniasTransfers.length > 0) && (
                    <div className="text-xs font-bold text-gray-400 mt-4 mb-1 uppercase">
                        {currentLine ? "Transbordos" : "Comenzar Viaje"}
                    </div>
                )}
                
                {/* View Mode Logic */}
                {viewMode === 'METRO' && (
                    <>
                        {metroTransfers.map(renderTransferButton)}
                        {metroTransfers.length === 0 && !currentLine && cercaniasTransfers.length === 0 && (
                            <div className="text-sm text-gray-400 italic">No hay líneas de Metro disponibles.</div>
                        )}
                        
                        {cercaniasTransfers.length > 0 && (
                            <button
                                onClick={() => setViewMode('CERCANIAS')}
                                className="w-full p-4 mt-2 rounded-xl border-2 border-red-100 bg-red-50 text-red-700 font-bold flex items-center justify-between hover:bg-red-100 transition-colors shadow-sm active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-train"></i>
                                    </span>
                                    Ver opciones de Cercanías
                                </span>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        )}
                    </>
                )}

                {viewMode === 'CERCANIAS' && (
                    <>
                        <div className="bg-red-50/50 rounded-xl p-2 border border-red-100 mb-2">
                            <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2 pl-1">Red de Cercanías</div>
                            {cercaniasTransfers.map(renderTransferButton)}
                        </div>

                        {metroTransfers.length > 0 && (
                            <button
                                onClick={() => setViewMode('METRO')}
                                className="w-full p-4 mt-2 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 font-bold flex items-center justify-between hover:bg-blue-100 transition-colors shadow-sm active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center text-xs">
                                        <i className="fa-solid fa-train-subway"></i>
                                    </span>
                                    Ver opciones de Metro
                                </span>
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                        )}
                    </>
                )}
            </div>

            <button 
                onClick={onEnd}
                className="mt-4 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-flag-checkered"></i>
                Finalizar Viaje
            </button>
        </div>
    );
};

export default GameControls;