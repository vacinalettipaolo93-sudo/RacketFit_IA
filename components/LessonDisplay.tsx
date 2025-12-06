import React from 'react';
import { LessonPlan } from '../types';
import { Button } from './Button';
import { Download, PlayCircle, Users, Clock, CheckCircle, Disc } from 'lucide-react';

interface LessonDisplayProps {
  lesson: LessonPlan;
  onReset: () => void;
}

export const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, onReset }) => {
  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in print-content">
      
      {/* Header Card */}
      <div className="bg-indigo-700 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden print:bg-white print:text-black print:border print:border-gray-300">
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4 text-indigo-200 print:text-gray-600">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 print:bg-gray-100">
              <Users size={12} /> {lesson.mode}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 print:bg-gray-100">
              <Clock size={12} /> {lesson.duration} Minuti
            </span>
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider print:bg-gray-100">
              {lesson.level}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{lesson.title}</h2>
          <p className="text-indigo-100 text-lg opacity-90 print:text-gray-800">Piano di lezione per {lesson.sport}</p>
        </div>
        
        {/* Decorator */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl print:hidden"></div>
      </div>

      <div className="space-y-6">
        
        {/* Warmup */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 page-break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PlayCircle className="text-indigo-500" /> Riscaldamento Tecnico
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
             <ul className="list-disc list-inside space-y-2">
               {lesson.warmup.map((item, i) => (
                 <li key={i}>{item}</li>
               ))}
             </ul>
          </div>
        </div>

        {/* Basket Drills (Cesto) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 page-break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Disc className="text-orange-500" /> Esercizi al Cesto
          </h3>
          <div className="space-y-4">
             {lesson.basketDrills.map((drill, i) => (
               <div key={i} className="border-l-4 border-orange-400 bg-orange-50/30 pl-4 py-2">
                 <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{drill.name}</h4>
                    <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded text-gray-600">
                      {drill.durationOrReps}
                    </span>
                 </div>
                 <p className="text-gray-700 text-sm mb-2">{drill.description}</p>
                 {drill.notes && (
                   <p className="text-xs text-orange-700 italic">💡 Coach Tip: {drill.notes}</p>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Live Drills */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 page-break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-green-500" /> Situazionale / Live
          </h3>
          <div className="space-y-4">
             {lesson.liveDrills.map((drill, i) => (
               <div key={i} className="border-l-4 border-green-400 bg-green-50/30 pl-4 py-2">
                 <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{drill.name}</h4>
                    <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded text-gray-600">
                      {drill.durationOrReps}
                    </span>
                 </div>
                 <p className="text-gray-700 text-sm">{drill.description}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Final Game */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 page-break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-blue-500" /> Partita Finale
          </h3>
          <div className="bg-blue-50 rounded-xl p-4 text-blue-900 text-sm leading-relaxed">
            {lesson.finalGame}
          </div>
        </div>

      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center no-print">
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          Crea Nuova Lezione
        </Button>
        <Button onClick={() => window.print()} variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Download size={18} /> Stampa Scheda
        </Button>
      </div>

    </div>
  );
};