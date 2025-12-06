import React, { useState } from 'react';
import { FitnessLevel, SessionCount, TrainingFocus, UserPreferences, Sport } from '../types';
import { Button } from './Button';
import { Dumbbell, Calendar, Zap, Activity, CircleDot, Trophy } from 'lucide-react';

interface InputFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [sport, setSport] = useState<Sport>(Sport.TENNIS);
  const [level, setLevel] = useState<FitnessLevel>(FitnessLevel.INTERMEDIATE);
  const [sessions, setSessions] = useState<SessionCount>(SessionCount.TWO);
  const [focus, setFocus] = useState<TrainingFocus>(TrainingFocus.MIXED);
  const [phase, setPhase] = useState<UserPreferences['phase']>('In-season');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sport,
      level,
      sessionsPerWeek: sessions,
      focus,
      phase
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Imposta il tuo Allenamento</h2>
        <p className="text-gray-500 mt-2">Personalizza la settimana per le tue esigenze.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sport Selection */}
        <div className="bg-gray-50 p-1.5 rounded-2xl flex relative">
           {/* Slider background animation could go here, but simple conditional classes work well */}
           <button
             type="button"
             onClick={() => setSport(Sport.TENNIS)}
             className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
               sport === Sport.TENNIS 
                 ? 'bg-white text-tennis-dark shadow-md ring-1 ring-gray-200' 
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             <CircleDot size={18} className={sport === Sport.TENNIS ? 'text-tennis-green' : ''} />
             Tennis
           </button>
           <button
             type="button"
             onClick={() => setSport(Sport.PADEL)}
             className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
               sport === Sport.PADEL 
                 ? 'bg-white text-blue-900 shadow-md ring-1 ring-gray-200' 
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             <Trophy size={18} className={sport === Sport.PADEL ? 'text-blue-500' : ''} />
             Padel
           </button>
        </div>

        {/* Level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Dumbbell size={18} className="text-tennis-accent" /> Livello Atletico
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(FitnessLevel).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  level === l 
                    ? 'bg-tennis-dark text-white border-tennis-dark shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-tennis-dark'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar size={18} className="text-tennis-accent" /> Sessioni a Settimana
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.values(SessionCount).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSessions(s)}
                className={`py-3 rounded-xl font-bold border-2 transition-all flex flex-col items-center justify-center ${
                  sessions === s 
                    ? 'border-tennis-green bg-tennis-green/10 text-tennis-dark' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg leading-none">{s}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                  {s === '1' ? 'Volta' : 'Volte'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Zap size={18} className="text-tennis-accent" /> Focus Principale
          </label>
          <select 
            value={focus}
            onChange={(e) => setFocus(e.target.value as TrainingFocus)}
            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-transparent appearance-none"
          >
            {Object.values(TrainingFocus).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Phase */}
         <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
             Periodo della Stagione
          </label>
          <div className="flex flex-wrap gap-2">
            {['Pre-season', 'In-season', 'Off-season'].map((p) => (
              <button
                 key={p}
                 type="button"
                 onClick={() => setPhase(p as any)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                   phase === p
                   ? 'bg-gray-800 text-white'
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                 }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth disabled={isLoading} variant="secondary">
            {isLoading ? 'Generazione in corso...' : 'Genera Programma'}
          </Button>
        </div>
      </form>
    </div>
  );
};