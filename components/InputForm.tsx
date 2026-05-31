import React, { useState } from 'react';
import {
  FitnessLevel,
  SessionCount,
  TrainingFocus,
  UserPreferences,
  Sport,
  WarmupType,
  GroupSize,
  SessionLocation,
  EquipmentMode
} from '../types';
import { Button } from './Button';
import { Dumbbell, Calendar, Zap, CircleDot, Trophy, Brain, Flame, Gamepad2, Users, Radio, MapPin, Smartphone } from 'lucide-react';

interface InputFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [sport, setSport] = useState<Sport>(Sport.TENNIS);
  const [groupSize, setGroupSize] = useState<GroupSize>(GroupSize.ONE);
  const [level, setLevel] = useState<FitnessLevel>(FitnessLevel.INTERMEDIATE);
  const [sessions, setSessions] = useState<SessionCount>(SessionCount.TWO);
  const [focus, setFocus] = useState<TrainingFocus>(TrainingFocus.MIXED);
  const [equipmentMode, setEquipmentMode] = useState<EquipmentMode>(EquipmentMode.BODYWEIGHT_MINIMAL);
  const [phase, setPhase] = useState<UserPreferences['phase']>('In-season');

  // NEW: location
  const [location, setLocation] = useState<SessionLocation>('Campo');

  // Advanced Options
  const [includeWarmup, setIncludeWarmup] = useState(false);
  const [includeCognitive, setIncludeCognitive] = useState(false);
  const [useBlazepod, setUseBlazepod] = useState(false);
  const [useBuzzoni, setUseBuzzoni] = useState(false);
  const [warmupType, setWarmupType] = useState<WarmupType>('Normale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sport,
      groupSize,
      level,
      sessionsPerWeek: sessions,
      focus,
      equipmentMode,
      phase,
      includeWarmup,
      includeCognitive,
      useBlazepod,
      useBuzzoni,
      warmupType,
      location
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

        {/* NEW: Location (Campo / Fuori) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MapPin size={18} className="text-tennis-accent" /> Dove si svolge
          </label>
          <div className="bg-gray-50 p-1.5 rounded-2xl flex">
            <button
              type="button"
              onClick={() => setLocation('Campo')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                location === 'Campo'
                  ? 'bg-white text-tennis-dark shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              CAMPO
            </button>
            <button
              type="button"
              onClick={() => setLocation('Fuori')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                location === 'Fuori'
                  ? 'bg-white text-tennis-dark shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FUORI CAMPO
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Le sedute saranno generate in base allo spazio scelto.
          </p>
        </div>

        {/* Group Size */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Users size={18} className="text-tennis-accent" /> Numero Atleti
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(GroupSize).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupSize(g)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all truncate ${
                  groupSize === g
                    ? 'bg-tennis-dark text-white border-tennis-dark shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-tennis-dark'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
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
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Dumbbell size={18} className="text-tennis-accent" /> Attrezzatura disponibile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(EquipmentMode).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setEquipmentMode(mode)}
                className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-medium border text-left transition-all ${
                  equipmentMode === mode
                    ? 'bg-tennis-dark text-white border-tennis-dark shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-tennis-dark'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Corpo libero: solo cinesini/coni. Con attrezzi: elastici, palle mediche, bastoni, step. Racchetta: solo palle, racchette, strumenti di tennis/padel e ostacoli.
          </p>
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
                  phase === p ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Opzioni Avanzate</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Warmup Toggle */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                includeWarmup ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => setIncludeWarmup(!includeWarmup)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-sm ${includeWarmup ? 'text-orange-700' : 'text-gray-600'}`}>
                  Riscaldamento extra (10 min)
                </span>
                <Flame size={20} className={includeWarmup ? 'text-orange-600' : 'text-gray-400'} />
              </div>
              <p className="text-xs text-gray-500 leading-tight">Si aggiunge al blocco principale da 50/55 minuti.</p>
            </div>

            {/* Cognitive Toggle */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                includeCognitive ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => setIncludeCognitive(!includeCognitive)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-sm ${includeCognitive ? 'text-purple-700' : 'text-gray-600'}`}>
                  Parte Cognitiva
                </span>
                <Brain size={20} className={includeCognitive ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <p className="text-xs text-gray-500 leading-tight">Include esercizi di reazione, scelta e memoria.</p>
            </div>

            {/* Blazepod Toggle */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                useBlazepod ? 'border-cyan-500 bg-cyan-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => setUseBlazepod(!useBlazepod)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-sm ${useBlazepod ? 'text-cyan-700' : 'text-gray-600'}`}>
                  Blazepod / Luci
                </span>
                <Radio size={20} className={useBlazepod ? 'text-cyan-600' : 'text-gray-400'} />
              </div>
              <p className="text-xs text-gray-500 leading-tight">Usa luci di reazione per velocità e riflessi.</p>
            </div>

            {/* Buzzoni Toggle */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                useBuzzoni ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => setUseBuzzoni(!useBuzzoni)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-sm ${useBuzzoni ? 'text-fuchsia-700' : 'text-gray-600'}`}>
                  Sistema Buzzoni
                </span>
                <Smartphone size={20} className={useBuzzoni ? 'text-fuchsia-600' : 'text-gray-400'} />
              </div>
              <p className="text-xs text-gray-500 leading-tight">Include chiamate, segnali e reazioni guidate dall&apos;app Buzzoni.</p>
            </div>

            {includeWarmup && (
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-gray-500 block">Tipo Riscaldamento (10 min extra)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWarmupType('Normale')}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                      warmupType === 'Normale'
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <Flame size={14} /> Normale
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarmupType('Gioco')}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                      warmupType === 'Gioco'
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <Gamepad2 size={14} /> Gioco
                  </button>
                </div>
              </div>
            )}
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
