import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Package, MapPin, CircleDashed } from 'lucide-react';
import Tooltip from './Tooltip';

const SeatGrid = ({ seats = [], onSeatClick }) => {
    const [selectedSeat, setSelectedSeat] = useState(null);

    // Generate 40 seats in 2-2 layout (10 rows)
    const rows = 10;
    const seatsPerRow = 4;

    const getSeatData = (seatNumber) => {
        return seats.find(s => s.number === seatNumber) || {
            number: seatNumber,
            state: "EMPTY",
            lastUpdated: new Date().toISOString()
        };
    };

    const getSeatColor = (state, index) => {
        const intensity = (index % 3) === 0 ? 'bg-opacity-30' : (index % 2) === 0 ? 'bg-opacity-20' : 'bg-opacity-40';
        
        switch (state) {
            case 'LUGGAGE':
                return 'bg-[#EF4444] border-[#EF4444] text-[#EF4444] bg-opacity-20';
            case 'OCCUPIED':
                return `bg-[#22C55E] border-[#22C55E] text-[#22C55E] ${intensity}`;
            case 'EMPTY':
            default:
                return 'bg-[#1F2937]/50 border-[#1F2937] text-gray-500 hover:bg-[#1F2937]';
        }
    };

    const getSeatIcon = (state) => {
        if (state === 'LUGGAGE') {
            return <Package className="w-5 h-5" />;
        }
        if (state === 'OCCUPIED') {
            return <User className="w-5 h-5" />;
        }
        return <CircleDashed className="w-5 h-5 opacity-40" />;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleSeatClick = (seat) => {
        setSelectedSeat(seat.number === selectedSeat ? null : seat.number);
        if (onSeatClick) {
            onSeatClick(seat);
        }
    };

    const renderSeat = (seatNumber) => {
        const seat = getSeatData(seatNumber);
        const state = seat.state || 'EMPTY';
        const colorClass = getSeatColor(state, seat.number);
        const isSuspicious = state === 'LUGGAGE';

        const tooltipContent = (
            <div className="text-left w-48">
                <div className="font-bold text-sm mb-1 pb-1 border-b border-slate-600 flex justify-between">
                    <span>Seat {seat.number}</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-black/30">
                        {state}
                    </span>
                </div>
                <div className="text-xs space-y-1 mt-2">
                    <div className="text-slate-300">
                        Status: <strong className={
                            state === 'OCCUPIED' ? 'text-emerald-400' :
                            state === 'LUGGAGE' ? 'text-red-400' : 'text-slate-400'
                        }>{state}</strong>
                    </div>
                    {isSuspicious && (
                        <div className="text-orange-400 font-semibold animate-pulse">
                            ⚠️ Suspicious Luggage
                        </div>
                    )}
                    <div className="text-slate-500 mt-2 text-[10px]">
                        Last Update: {formatTime(seat.lastUpdated)}
                    </div>
                </div>
            </div>
        );

        return (
            <Tooltip content={tooltipContent} position="top" key={seatNumber}>
                <motion.button
                    layout
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSeatClick(seat)}
                    className={`relative w-full aspect-square rounded-xl border-2 ${colorClass} 
                        transition-all duration-300 flex items-center justify-center
                        focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden
                        ${selectedSeat === seat.number ? 'ring-2 ring-blue-500 scale-105 shadow-xl font-bold' : ''}`}
                    aria-label={`Seat ${seat.number}, ${state}`}
                    aria-pressed={selectedSeat === seat.number}
                    tabIndex={0}
                >
                    {/* Blinking overlay for luggage */}
                    {isSuspicious && (
                        <div className="absolute inset-0 bg-red-500/20 animate-ping opacity-75" />
                    )}
                    
                    <div className={`flex flex-col items-center gap-1 z-10 ${isSuspicious ? 'animate-pulse' : ''}`}>
                        {getSeatIcon(state)}
                        <span className="text-[11px] font-bold tracking-wider">{seat.number}</span>
                    </div>

                    {isSuspicious && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                </motion.button>
            </Tooltip>
        );
    };

    const renderRow = (rowIndex) => {
        const startSeat = rowIndex * seatsPerRow + 1;

        return (
            <div key={rowIndex} className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-3 items-center mb-2 sm:mb-3 relative">
                {/* Left side - 2 seats */}
                <div className="col-span-2 grid grid-cols-2 gap-1.5 sm:gap-3">
                    {renderSeat(startSeat)}
                    {renderSeat(startSeat + 1)}
                </div>

                {/* Aisle */}
                <div className="col-span-1 flex flex-col items-center justify-center h-full min-h-[40px] relative">
                    <div className="h-full w-0.5 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 rounded-full opacity-30 absolute" />
                    {/* Compact row label for mobile, centered in aisle */}
                    <div className="z-10 bg-[#161616] px-1.5 py-0.5 rounded border border-slate-800 sm:hidden">
                        <span className="text-[8px] text-slate-400 font-extrabold tracking-tight">R{rowIndex + 1}</span>
                    </div>
                </div>

                {/* Right side - 2 seats */}
                <div className="col-span-2 grid grid-cols-2 gap-1.5 sm:gap-3">
                    {renderSeat(startSeat + 2)}
                    {renderSeat(startSeat + 3)}
                </div>

                {/* Row label - desktop only */}
                <div className="col-span-4 text-right hidden sm:block">
                    <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 font-bold tracking-wider uppercase border border-slate-700">
                        Row {rowIndex + 1}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="card !p-0 overflow-hidden"
            role="region"
            aria-label="Bus seat occupancy grid"
        >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 sm:mb-8 p-4 sm:p-6 border-b border-[#1F2937] bg-[#0A0A0A]">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Real-Time Mapping
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                        Live monitoring with 3-state AI computer vision
                    </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 lg:mt-0 text-xs sm:text-sm font-bold bg-slate-950/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="text-base sm:text-lg leading-none">🟩</span>
                        <span className="uppercase tracking-widest text-[10px] sm:text-xs">Occupied</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500">
                        <span className="text-base sm:text-lg leading-none animate-pulse">🟧</span>
                        <span className="uppercase tracking-widest text-[10px] sm:text-xs animate-pulse">Luggage</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-base sm:text-lg leading-none">⬜</span>
                        <span className="uppercase tracking-widest text-[10px] sm:text-xs">Empty</span>
                    </div>
                </div>
            </div>

            {/* Bus Front Indicator */}
            <div className="flex items-center justify-center mb-8 relative px-6">
                <div className="absolute inset-0 flex items-center px-6">
                    <div className="w-full border-t border-[#1F2937] border-dashed"></div>
                </div>
                <div className="relative flex items-center gap-2 px-6 py-2 bg-[#111827] border border-[#6366F1]/50 rounded-full">
                    <MapPin className="w-5 h-5 text-[#6366F1]" />
                    <span className="text-sm font-bold tracking-widest uppercase text-[#6366F1]">Front of Bus</span>
                </div>
            </div>

            {/* Seat Grid */}
            <div
                className="space-y-1 relative px-6"
                role="grid"
                aria-label="Seat grid with 10 rows and 4 seats per row"
            >
                {Array.from({ length: rows }, (_, i) => renderRow(i))}
            </div>

            {/* Interaction Hint */}
            <div className="mt-8 p-4 text-center border-t border-[#1F2937] bg-[#0A0A0A]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    The seat grid dynamically reflects real-time occupancy using backend polling and state-driven UI updates with only three normalized classifications.
                </p>
            </div>
        </div>
    );
};

export default SeatGrid;
