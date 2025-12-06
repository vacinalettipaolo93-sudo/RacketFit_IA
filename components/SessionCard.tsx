import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { ChevronDown, ChevronUp, Clock, Flame, Activity } from 'lucide-react';

interface SessionCardProps {
  session: TrainingSession;
  index: number;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, index }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div 
        className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-tennis-dark text-tennis-green font-bold w-10 h-10 rounded-full flex items-center justify-center text-lg">
            {index + 1}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{session.dayName}</h3>
            <p className="text-sm text-tennis-accent font-medium flex items-center gap-1">
              <Activity size={14} /> {session.focusArea}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
            <Clock size={14} /> {session.totalDuration}
          </span>
          <button className="text-gray-400 hover:text-tennis-dark">
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-5 space-y-6">
          
          {/* Warmup */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3 flex items-center gap-2">
              <Flame size={16} className="text-orange-500" /> Riscaldamento
            </h4>
            <div className="bg-orange-50 rounded-xl p-4 text-gray-700 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {session.warmup.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Block */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">Lavoro Principale</h4>
            <div className="space-y-4">
              {session.mainBlock.map((drill, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-tennis-green/50 transition-colors bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-gray-900 text-lg">{drill.name}</h5>
                    <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                      {drill.durationOrReps}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{drill.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                     <span className="text-xs font-semibold text-tennis-accent bg-teal-50 px-2 py-1 rounded">
                      Recupero: {drill.rest}
                    </span>
                    {drill.notes && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Note: {drill.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cooldown */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">Defaticamento</h4>
            <div className="bg-blue-50 rounded-xl p-4 text-gray-700 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {session.cooldown.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
