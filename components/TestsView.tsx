import React, { useState } from 'react';
import { PhysicalTest } from '../types';
import { ChevronDown, ChevronUp, Timer, Ruler, Activity, Dumbbell } from 'lucide-react';

export const TESTS_DATA: PhysicalTest[] = [
  {
    id: 'spider',
    name: 'Spider Run (Test a Ragno)',
    category: 'Agility',
    description: "Il test specifico per eccellenza per i movimenti del tennis e padel. Misura l'agilità e la capacità di cambio di direzione.",
    equipment: "Campo da tennis/padel, 5 palline, 1 racchetta, cronometro.",
    procedure: [
      "Posiziona una racchetta a terra al centro della linea di fondocampo (punto di partenza).",
      "Posiziona 5 palline a raggiera: 1 all'incrocio riga servizio/singolare sx, 1 all'incrocio riga servizio/singolare dx, 1 all'incrocio fondocampo/singolare sx, 1 all'incrocio fondocampo/singolare dx, 1 sulla T del servizio.",
      "Partendo dal centro, scatta verso una palla, raccoglila e riportala sulla racchetta al centro.",
      "Ripeti per tutte le 5 palline il più velocemente possibile.",
      "Il tempo si ferma quando l'ultima palla è posata sulla racchetta."
    ],
    measurement: "Tempo totale (in secondi). Un buon tempo per agonisti è sotto i 18-19 secondi."
  },
  {
    id: 'cooper',
    name: 'Test di Cooper (12 Minuti)',
    category: 'Endurance',
    description: "Test classico adattato al campo per valutare la capacità aerobica.",
    equipment: "Campo da tennis/padel, cronometro.",
    procedure: [
      "Riscaldamento di 10-15 minuti.",
      "Corri lungo il perimetro esterno delle righe del campo (doppio per il tennis) per esattamente 12 minuti.",
      "Il perimetro di un campo standard (righe doppio) è circa 70 metri.",
      "Mantieni un passo costante.",
      "Allo scadere dei 12 minuti, conta i giri completi e i metri dell'ultimo giro parziale."
    ],
    measurement: "Numero di GIRI completati. (Esempio: 30 giri = 2100m circa). >35 giri è un ottimo risultato."
  },
  {
    id: 'broad-jump',
    name: 'Salto in Lungo da Fermo',
    category: 'Power',
    description: "Misura la potenza esplosiva degli arti inferiori, fondamentale per scatti e smash.",
    equipment: "Metro a nastro, superficie non scivolosa.",
    procedure: [
      "Stai in piedi con i piedi alla larghezza delle spalle dietro una linea.",
      "Piega le ginocchia e porta le braccia indietro.",
      "Spingi forte saltando in avanti il più lontano possibile, atterrando su entrambi i piedi.",
      "Misura la distanza dalla linea di partenza al tallone più arretrato all'atterraggio.",
      "Esegui 3 tentativi e tieni il migliore."
    ],
    measurement: "Distanza (in cm/metri). >220cm è un buon riferimento per maschi agonisti, >180cm per femmine."
  },
  {
    id: 'shuttle-10x5',
    name: 'Navetta 10 x 5 metri',
    category: 'Agility',
    description: "Valuta la velocità e la capacità di frenata e ripartenza su brevi distanze.",
    equipment: "Due coni distanti 5 metri, cronometro.",
    procedure: [
      "Posiziona due coni a 5 metri di distanza.",
      "Parti in piedi accanto a un cono.",
      "Corri al cono opposto, tocca la linea con un piede (o supera il cono) e torna indietro.",
      "Ripeti per 10 tratti totali (5 cicli andata e ritorno).",
      "Il cronometro si ferma quando attraversi la linea finale al decimo tratto."
    ],
    measurement: "Tempo totale (secondi). Fondamentale non scivolare nelle curve."
  },
  {
    id: 'plank',
    name: 'Plank Test (Max Hold)',
    category: 'Strength',
    description: "Valuta la resistenza e la stabilità del Core, essenziale per prevenire infortuni alla schiena.",
    equipment: "Tappetino, cronometro.",
    procedure: [
      "Assumi la posizione di plank sugli avambracci.",
      "Corpo in linea retta dalla testa ai talloni. Contrai glutei e addome.",
      "Mantieni la posizione finché non riesci più a tenere la schiena dritta o cadi.",
    ],
    measurement: "Tempo (minuti/secondi). >2:00 minuti indica una buona stabilità del core."
  },
  {
    id: 'push-up',
    name: 'Push-up Test (1 Minuto)',
    category: 'Strength',
    description: "Misura la forza resistente della parte superiore del corpo.",
    equipment: "Cronometro.",
    procedure: [
      "Posizione di piegamenti classica (mani larghezza spalle).",
      "Esegui il massimo numero di piegamenti corretti in 60 secondi.",
      "Il petto deve scendere fino a sfiorare il pavimento (o un pugno di distanza).",
      "Le pause sono ammesse solo nella posizione alta."
    ],
    measurement: "Numero di ripetizioni corrette."
  }
];

export const TestsView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getIcon = (category: string) => {
    switch(category) {
      case 'Agility': return <Activity size={20} className="text-blue-500" />;
      case 'Endurance': return <Timer size={20} className="text-red-500" />;
      case 'Power': return <Activity size={20} className="text-orange-500" />; // Zap alternative
      case 'Strength': return <Dumbbell size={20} className="text-purple-500" />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Libreria Test Fisici</h2>
        <p className="text-gray-500">Valuta la tua condizione atletica con questi test standardizzati da campo.</p>
      </div>

      <div className="space-y-4">
        {TESTS_DATA.map((test) => (
          <div key={test.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            
            <div 
              className="p-5 flex justify-between items-center cursor-pointer select-none"
              onClick={() => toggleExpand(test.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100`}>
                  {getIcon(test.category)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{test.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
                    {test.category}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-tennis-dark transition-colors">
                {expandedId === test.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {expandedId === test.id && (
              <div className="px-5 pb-6 pt-0 border-t border-gray-50">
                <div className="mt-4 grid gap-4">
                  
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                      <Ruler size={16} /> Attrezzatura Necessaria
                    </h4>
                    <p className="text-sm text-blue-900">{test.equipment}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Procedura</h4>
                    <ul className="list-decimal list-inside space-y-2 text-gray-600 text-sm bg-gray-50 p-4 rounded-xl">
                      {test.procedure.map((step, i) => (
                        <li key={i} className="leading-relaxed">{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                      <h4 className="text-sm font-bold text-green-800 mb-1">Obiettivo</h4>
                      <p className="text-xs text-green-900">{test.description}</p>
                    </div>
                    <div className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-800 mb-1">Misurazione</h4>
                      <p className="text-xs text-amber-900">{test.measurement}</p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};