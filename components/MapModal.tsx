import React, { useState, useRef } from 'react';
import mapImage from '../planoesquematico.png'; // Verified: This is the correct import

interface MapModalProps {
    onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPosition = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastPosition.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastPosition.current.x;
        const deltaY = e.clientY - lastPosition.current.y;
        
        setPosition(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const zoomIn = () => setScale(prev => Math.min(prev * 1.5, 4));
    const zoomOut = () => setScale(prev => Math.max(prev / 1.5, 0.5));

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md z-10 shrink-0">
                <h3 className="font-bold text-lg"><i className="fa-solid fa-map mr-2"></i>Plano del Metro</h3>
                <div className="flex gap-2">
                    <div className="bg-gray-800 rounded-lg flex items-center mr-2">
                        <button onClick={zoomOut} className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-l-lg transition-colors">
                             <i className="fa-solid fa-minus"></i>
                        </button>
                        <button onClick={zoomIn} className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-r-lg transition-colors">
                             <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            
            <div 
                ref={containerRef}
                className="flex-1 w-full bg-gray-100 overflow-hidden relative cursor-move touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div 
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="w-full h-full flex items-center justify-center"
                >
                    {/* 👇 THIS WAS MISSING IN YOUR CODE 👇 */}
                    <img 
                        src={mapImage} 
                        alt="Plano Metro Madrid" 
                        className="max-w-none w-auto h-auto min-w-full min-h-full object-contain pointer-events-none select-none"
                        draggable={false}
                    />
                </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                    Arrastra para mover • Botones para zoom
                </span>
            </div>
        </div>
    );
};

export default MapModal;