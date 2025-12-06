
import React, { useState, useEffect } from 'react';
import { FitnessLevel, LessonMode, LessonPreferences, Sport, TENNIS_LESSON_FOCUS, PADEL_LESSON_FOCUS } from '../types';
import { Button } from './Button';
import { Users, Clock, Target, CircleDot, Trophy, GraduationCap } from 'lucide-react';

interface LessonFormProps {
  onSubmit: (prefs: LessonPreferences) => void;
  isLoading: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, isLoading }) => {
  const [sport, setSport] = useState<Sport>(Sport.TENNIS);
  const [level, setLevel] = useState<FitnessLevel>(FitnessLevel.INTERMEDIATE);
  const [mode, setMode] = useState<LessonMode>(LessonMode.INDIVIDUAL);
  
  // Initialize with the first option of the default sport
  const [focus, setFocus] = useState<string>(TENNIS_LESSON_FOCUS[0]);
  const [duration, setDuration] = useState<'60' | '90'>('60');

  // Determine which options to show based on selected sport
  const currentFocusOptions = sport === Sport.TENNIS ? TENNIS_LESSON_FOCUS : PADEL_LESSON_FOCUS;

  // Reset focus when sport changes to prevent mismatched data (e.g. asking for "Vibora" in Tennis)
  useEffect(() => {
    setFocus(currentFocusOptions[0]);
  }, [sport]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sport, level, mode, focus, duration });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-3 text-indigo-600">
           <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Coach Mode</h2>
        <p className="text-gray-500 mt-2">Crea una lezione tecnica perfetta per i tuoi allievi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sport Selection */}
        <div className="bg-gray-50 p-1.5 rounded-2xl flex">
           <button
             type="button"
             onClick={() => setSport(Sport.TENNIS)}
             className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               sport === Sport.TENNIS 
                 ? 'bg-white text-tennis-dark shadow-md' 
                 : 'text-gray-500 hover:bg-white/50'
             }`}
           >
             <CircleDot size={18} className={sport === Sport.TENNIS ? 'text-tennis-green' : ''} />
             Tennis
           </button>
           <button
             type="button"
             onClick={() => setSport(Sport.PADEL)}
             className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               sport === Sport.PADEL 
                 ? 'bg-white text-blue-900 shadow-md' 
                 : 'text-gray-500 hover:bg-white/50'
             }`}
           >
             <Trophy size={18} className={sport === Sport.PADEL ? 'text-blue-500' : ''} />
             Padel
           </button>
        </div>

        {/* Lesson Mode (Single/Group) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Users size={18} className="text-indigo-500" /> Tipologia Lezione
          </label>
          <div className="flex flex-col gap-2">
            {Object.values(LessonMode).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${
                  mode === m 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
           <label className="text-sm font-semibold text-gray-700 mb-2 block">Livello Allievi</label>
           <select 
              value={level}
              onChange={(e) => setLevel(e.target.value as FitnessLevel)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              {Object.values(FitnessLevel).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
        </div>

        {/* Focus & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Target size={18} className="text-indigo-500" /> Colpo / Tema
            </label>
            <select 
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              {currentFocusOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock size={18} className="text-indigo-500" /> Durata
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDuration('60')}
                className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                  duration === '60' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                60 min
              </button>
              <button
                type="button"
                onClick={() => setDuration('90')}
                className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                  duration === '90' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                90 min
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" fullWidth disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isLoading ? 'Creazione lezione...' : 'Crea Lezione'}
        </Button>
      </form>
    </div>
  );
};
