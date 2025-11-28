import React from 'react';
import { AIEquipment } from '../types';

interface EquipmentToggleProps {
    slot: keyof AIEquipment;
    enabled: boolean;
    onToggle: (slot: keyof AIEquipment, enabled: boolean) => void;
}

export const EquipmentToggle: React.FC<EquipmentToggleProps> = ({ slot, enabled, onToggle }) => {
    return (
        <button
            className={`w-4 h-4 ml-1 border-2 rounded-sm transition-colors ${enabled
                    ? 'bg-green-600 border-green-700 hover:bg-green-500'
                    : 'bg-gray-600 border-gray-700 hover:bg-gray-500'
                }`}
            onClick={(e) => {
                e.stopPropagation();
                onToggle(slot, !enabled);
            }}
            title={`Auto-equip ${slot}: ${enabled ? 'ON' : 'OFF'}`}
        >
            <span className="text-[8px] font-bold text-white opacity-0 group-hover:opacity-100">
                {enabled ? '✓' : '✗'}
            </span>
        </button>
    );
};
