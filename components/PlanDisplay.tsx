import React, { useState } from 'react';
import { WeeklyPlan } from '../types';
import { SessionCard } from './SessionCard';
import { Info, Download, Save, Check } from 'lucide-react';
import { Button } from './Button';

interface PlanDisplayProps {
  plan: WeeklyPlan;
  onReset: () => void;
  onSave: (title: string) => void;
  saveFocus?: string;
  saveGroupSize?: string;
}

const formatGroupSizeLabel = (groupSize?: string): string => {
  const normalizedGroupSize = groupSize?.trim();
  if (!normalizedGroupSize) return 'Persone non specificate';

  const rangeMatch = normalizedGroupSize.match(/^(\d+)\s*-\s*(\d+)(?:\s*(?:persona|persone))?$/i);
  if (rangeMatch) {
    const [, from, to] = rangeMatch;
    return `${from}-${to} persone`;
  }

  const singleMatch = normalizedGroupSize.match(/^(\d+)(?:\s*(?:persona|persone))?$/i);
  if (singleMatch) {
    const participants = Number(singleMatch[1]);
    return `${participants} ${participants === 1 ? 'persona' : 'persone'}`;
  }

  if (/\bpersona\b|\bpersone\b/i.test(normalizedGroupSize)) {
    return normalizedGroupSize;
  }

  return `${normalizedGroupSize} persone`;
};

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset, onSave, saveFocus, saveGroupSize }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  const handleSaveClick = () => {
    if (hasSaved) return;
    setIsSaving(true);
    const sessionLabel = `${plan.sessions.length} ${plan.sessions.length === 1 ? 'sessione' : 'sessioni'}`;
    const peopleLabel = formatGroupSizeLabel(saveGroupSize);
    const focusLabel = saveFocus?.trim() || 'Focus non specificato';
    const dateLabel = new Date().toLocaleDateString('it-IT');
    setSaveTitle(`${focusLabel} - ${sessionLabel} - ${peopleLabel} - ${dateLabel}`);
  };

  const confirmSave = () => {
    if (!saveTitle.trim()) return;
    onSave(saveTitle);
    setIsSaving(false);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000); // Reset "Saved" state after 3s
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in print-content">
      
      {/* Weekly Summary Card */}
      <div className="bg-tennis-dark text-white rounded-3xl p-6 mb-8 shadow-xl print:shadow-none print:border print:border-gray-300 print:text-black print:bg-white">
        <h2 className="text-2xl font-bold mb-2 text-tennis-green print:text-black">Programma Settimanale</h2>
        <p className="text-gray-200 mb-4 text-lg print:text-gray-800">{plan.weeklyGoal}</p>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 print:bg-gray-100 print:border-gray-200">
          <div className="flex items-start gap-3">
            <Info className="text-tennis-green shrink-0 mt-1 print:text-black" size={20} />
            <p className="text-sm text-gray-100 italic print:text-gray-800">"{plan.advice}"</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {plan.sessions.map((session, index) => (
          <div key={index} className="page-break-inside-avoid">
            <SessionCard session={session} index={index} />
          </div>
        ))}
      </div>

      {/* Footer Actions (Hidden in Print) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center no-print">
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          Crea Nuovo
        </Button>
        
        {/* Save Interface */}
        {!isSaving ? (
          <Button 
            onClick={handleSaveClick} 
            variant="primary" 
            className={`w-full sm:w-auto flex items-center justify-center gap-2 ${hasSaved ? 'bg-green-600 text-white border-green-600' : ''}`}
            disabled={hasSaved}
          >
            {hasSaved ? <Check size={18} /> : <Save size={18} />}
            {hasSaved ? 'Salvato in Archivio' : 'Salva in Archivio'}
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto animate-fade-in">
            <input 
              type="text" 
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Nome del programma..."
              className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-tennis-green focus:border-transparent outline-none w-full sm:w-64"
              autoFocus
            />
            <Button onClick={confirmSave} variant="primary">Ok</Button>
            <Button onClick={() => setIsSaving(false)} variant="outline">X</Button>
          </div>
        )}

        <Button onClick={() => window.print()} variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Download size={18} /> Stampa / PDF
        </Button>
      </div>
    </div>
  );
};