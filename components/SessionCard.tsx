import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { ChevronDown, ChevronUp, Clock, Activity, MapPin, Users, Dumbbell, Settings } from 'lucide-react';

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
            <MapPin size={14} /> {session.location}
          </span>
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
          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">
              Lavoro (50' netti) — NO riscaldamento / NO defaticamento
            </h4>

            <div className="space-y-4">
              {session.mainBlock.map((drill, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-4 hover:border-tennis-green/50 transition-colors bg-gray-50/50"
                >
                  {/* Exercise header */}
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h5 className="font-bold text-gray-900 text-lg">{drill.name}</h5>
                    <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                      {drill.durationOrReps}
                    </span>
                  </div>

                  {/* Equipment badge */}
                  {drill.equipment && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded">
                        <Dumbbell size={11} /> {drill.equipment}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{drill.description}</p>

                  {/* Setup instructions */}
                  {drill.setup && (
                    <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1">
                        <Settings size={11} /> Setup pratico
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">{drill.setup}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-semibold text-tennis-accent bg-teal-50 px-2 py-1 rounded">
                      Recupero: {drill.rest}
                    </span>

                    {drill.totalDurationEstimate && (
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        <Clock size={11} /> Tot: {drill.totalDurationEstimate}
                      </span>
                    )}

                    {drill.pairWork && (
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        <Users size={12} /> A coppie
                      </span>
                    )}

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
        </div>
      )}
    </div>
  );
};
