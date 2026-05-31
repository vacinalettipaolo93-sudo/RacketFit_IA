import React, { useState } from 'react';
import { TrainingSession } from '../types';
import { ChevronDown, ChevronUp, Clock, Activity, MapPin, Users, Dumbbell, Settings, Flame, Gamepad2, PlayCircle, Repeat } from 'lucide-react';

interface SessionCardProps {
  session: TrainingSession;
  index: number;
}

const toInstructionSteps = (value?: string): string[] => {
  if (!value) return [];

  return value
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.replace(/^[\-\d.)\s]+/, '').trim())
    .filter(Boolean);
};

interface InstructionBlockProps {
  title: string;
  icon: React.ReactNode;
  content?: string;
  tone: string;
  textTone: string;
}

const InstructionBlock: React.FC<InstructionBlockProps> = ({ title, icon, content, tone, textTone }) => {
  const steps = toInstructionSteps(content);
  if (!steps.length) return null;

  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <p className={`text-xs font-semibold flex items-center gap-1 mb-2 ${textTone}`}>
        {icon} {title}
      </p>
      <ul className={`space-y-1 text-xs leading-relaxed ${textTone}`}>
        {steps.map((step, index) => (
          <li key={`${title}-${index}-${step.slice(0, 24)}`} className="flex gap-2">
            <span className="font-bold shrink-0">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SessionCard: React.FC<SessionCardProps> = ({ session, index }) => {
  const [isOpen, setIsOpen] = useState(true);
  const mainMinutes = session.totalDuration === '55 min' ? 55 : 50;
  const totalMinutes = session.warmup ? mainMinutes + 10 : mainMinutes;
  const totalBreakdown = session.warmup
    ? `${session.warmup.duration} extra + ${session.totalDuration} principale`
    : `${session.totalDuration} principale`;

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
            <Clock size={14} /> Lavoro principale: {session.totalDuration}
          </span>
          {session.warmup && (
            <span className="text-sm text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {session.warmup.type === 'Gioco' ? <Gamepad2 size={14} /> : <Flame size={14} />}
              Warm-up extra: {session.warmup.duration}
            </span>
          )}
          <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            Totale seduta: ~{totalMinutes} min ({totalBreakdown})
          </span>
          <button className="text-gray-400 hover:text-tennis-dark">
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-5 space-y-6">
          {session.warmup && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="text-sm uppercase tracking-wider text-orange-700 font-bold mb-2 flex items-center gap-2">
                {session.warmup.type === 'Gioco' ? <Gamepad2 size={14} /> : <Flame size={14} />}
                Riscaldamento extra ({session.warmup.duration}) — {session.warmup.type}
              </h4>
              <p className="text-sm text-orange-900">{session.warmup.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">
              Blocco principale ({session.totalDuration}) — separato dal riscaldamento extra
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

                  <div className="grid gap-3 md:grid-cols-3 mb-3">
                   <InstructionBlock
                     title="Setup materiali / posizionamento"
                     icon={<Settings size={11} />}
                     content={drill.setup}
                     tone="bg-blue-50 border-blue-100"
                     textTone="text-blue-800"
                   />
                   <InstructionBlock
                     title="Esecuzione pratica"
                     icon={<PlayCircle size={11} />}
                     content={drill.execution ?? drill.description}
                     tone="bg-emerald-50 border-emerald-100"
                     textTone="text-emerald-800"
                   />
                   <InstructionBlock
                     title="Rotazione atleti"
                     icon={<Repeat size={11} />}
                     content={drill.rotation}
                     tone="bg-violet-50 border-violet-100"
                     textTone="text-violet-800"
                   />
                  </div>

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
