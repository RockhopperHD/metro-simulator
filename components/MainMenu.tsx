import React from 'react';
import { Difficulty } from '../types';

interface MainMenuProps {
    onSelectFreeMode: () => void;
    onSelectWorkMode: (diff: Difficulty) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectFreeMode, onSelectWorkMode }) => {
    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
            <div className="text-center mb-8">
                <div className="text-6xl text-blue-500 mb-4">
                    <i className="fa-solid fa-train-subway"></i>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Selecciona Modo</h2>
                <p className="text-gray-500">¿Cómo quieres viajar hoy?</p>
            </div>

            <div className="space-y-4">
                {/* Free Mode */}
                <button 
                    onClick={onSelectFreeMode}
                    className="w-full bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                                <i className="fa-solid fa-person-walking-luggage mr-2"></i>
                                Juego Libre
                            </h3>
                            <p className="text-sm text-gray-500">
                                Explora Madrid sin rumbo fijo. Gana puntos por encontrar estaciones raras.
                            </p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-300 group-hover:text-blue-500 mt-2"></i>
                    </div>
                </button>

                {/* Work Mode */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-4">
                         <h3 className="text-xl font-bold text-gray-800 mb-1">
                            <i className="fa-solid fa-briefcase mr-2"></i>
                            Simular Trabajo
                        </h3>
                        <p className="text-sm text-gray-500">
                            Llega a tu destino lidiando con averías e incidencias.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button 
                            onClick={() => onSelectWorkMode('EASY')}
                            className="p-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 transition-colors flex justify-between items-center"
                        >
                            <span>Fácil <span className="font-normal opacity-70 ml-1">(Sin Incidencias)</span></span>
                            <i className="fa-solid fa-play"></i>
                        </button>
                        <button 
                            onClick={() => onSelectWorkMode('MEDIUM')}
                            className="p-3 rounded-xl bg-yellow-50 text-yellow-700 font-bold text-sm hover:bg-yellow-100 transition-colors flex justify-between items-center"
                        >
                            <span>Medio <span className="font-normal opacity-70 ml-1">(1-3 Incidencias)</span></span>
                            <i className="fa-solid fa-play"></i>
                        </button>
                        <button 
                            onClick={() => onSelectWorkMode('HARD')}
                            className="p-3 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors flex justify-between items-center"
                        >
                            <span>Difícil <span className="font-normal opacity-70 ml-1">(2-5 Incidencias)</span></span>
                            <i className="fa-solid fa-bomb"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 text-center pb-2">
                <p className="text-xs text-gray-400 font-medium">
                    Hecho con <i className="fa-solid fa-heart text-red-400 mx-1 animate-pulse"></i> para proyecto de Culturas de Owen Whelan
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                    v1.0 • No oficial
                </p>
            </div>
        </div>
    );
};

export default MainMenu;