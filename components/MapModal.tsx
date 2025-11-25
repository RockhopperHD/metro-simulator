import React from 'react';

interface MapModalProps {
    onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
                <h3 className="font-bold text-lg"><i className="fa-solid fa-map mr-2"></i>Plano del Metro</h3>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div className="flex-1 w-full bg-white relative">
                <iframe 
                    src="/planoesquematico.pdf" 
                    className="w-full h-full border-0" 
                    title="Plano Esquematico Metro Madrid"
                />
            </div>
        </div>
    );
};

export default MapModal;