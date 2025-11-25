import React from 'react';

interface OutageModalProps {
    line: string;
    onDismiss: () => void;
}

const OutageModal: React.FC<OutageModalProps> = ({ line, onDismiss }) => {
    return (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-b-8 border-red-500 transform scale-100 animate-jump-in">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                
                <h3 className="text-2xl font-black text-gray-800 mb-2">¡Servicio Interrumpido!</h3>
                <p className="text-gray-600 mb-6">
                    Hay una avería en la <strong>Línea {line}</strong>. Los trenes no pueden continuar en esta dirección.
                </p>

                <button 
                    onClick={onDismiss}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all"
                >
                    Entendido, buscaré otra ruta
                </button>
            </div>
        </div>
    );
};

export default OutageModal;