
import React, { useState } from 'react';
import { PhysicalTest } from '../types';
import { ChevronDown, ChevronUp, Timer, Ruler, Activity, Dumbbell, Eye, Move, Zap, Radio } from 'lucide-react';

export const TESTS_DATA: PhysicalTest[] = [
  {
    id: 'blazepod-reaction-4',
    name: 'Blazepod 4-Pod Static Reaction',
    category: 'Reaction',
    description: "Valuta la velocità di reazione pura e la visione periferica in uno spazio ristretto.",
    equipment: "4 Blazepod, supporto piano o tavolo.",
    procedure: [
      "Posiziona 4 pod a quadrato (distanza 50cm tra loro).",
      "L'atleta posiziona le mani al centro del quadrato.",
      "Imposta l'app Blazepod su 'Random' con un timeout di 1 secondo.",
      "Spegni 30 luci il più velocemente possibile.",
      "Mantieni il focus visivo al centro, usando la visione periferica per individuare le luci."
    ],
    measurement: "Tempo di reazione medio (millisecondi)."
  },
  {
    id: 'blazepod-lateral-shuttle',
    name: 'Blazepod Lateral Shuttle (Agility)',
    category: 'Reaction',
    description: "Combina lo scatto laterale specifico del tennis/padel con lo stimolo visivo imprevedibile.",
    equipment: "2 Blazepod, campo o spazio piano di 4 metri.",
    procedure: [
      "Posiziona 2 pod a 4 metri di distanza sulla linea laterale.",
      "L'atleta parte al centro in posizione di attesa.",
      "Imposta l'app per attivare un solo pod alla volta in modo casuale.",
      "L'atleta deve scattare lateralmente, toccare il pod attivo e tornare subito al centro.",
      "Durata: 45 secondi continui."
    ],
    measurement: "Numero totale di 'hits' (tocchi) in 45 secondi."
  },
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
    id: 'blazepod-scanning-180',
    name: 'Blazepod scanning 180°',
    category: 'Reaction',
    description: "Test di coordinazione e scansione visiva per giocatori di rete.",
    equipment: "6 Blazepod, fissati a muro o su coni a semicerchio.",
    procedure: [
      "Disponi 6 pod a semicerchio (raggio 2m) davanti all'atleta.",
      "Imposta 'All-in' o 'Random' con colori diversi (es. spegni solo il verde, ignora il rosso).",
      "L'atleta deve scansionare l'area e toccare solo i pod del colore corretto.",
      "Test di 30 secondi."
    ],
    measurement: "Percentuale di precisione e numero di tocchi corretti."
  },
  {
    id: 'hexagon',
    name: 'Test dell\'Esagono (Hexagon Test)',
    category: 'Agility',
    description: "Gold standard per valutare l'agilità dei piedi (footwork), equilibrio e velocità in spazi stretti.",
    equipment: "Nastro adesivo o gesso, cronometro. Disegnare un esagono con lati di 60cm e angoli di 120 gradi.",
    procedure: [
      "L'atleta parte al centro dell'esagono.",
      "Al via, salta a piedi uniti fuori dall'esagono oltre un lato e ritorna subito al centro.",
      "Procede in senso orario saltando fuori e dentro per tutti i 6 lati.",
      "Esegui 3 giri completi senza fermarti.",
      "Se si tocca una linea, il test va ripetuto o si aggiunge penalità."
    ],
    measurement: "Tempo totale per completare i 3 giri (secondi)."
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
    id: 'sprint-20m',
    name: 'Sprint 20 Metri',
    category: 'Power',
    description: "Valuta l'accelerazione pura su una distanza che copre la lunghezza del campo.",
    equipment: "Metro a nastro, cronometro, 2 coni.",
    procedure: [
      "Posiziona due coni a 20 metri di distanza.",
      "Partenza da fermo dietro la linea (piede anteriore dietro la linea).",
      "Al segnale, scatta alla massima velocità oltre il secondo cono.",
      "Esegui 2-3 tentativi con recupero completo."
    ],
    measurement: "Miglior tempo in secondi."
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
    id: 'lateral-hops',
    name: 'Saltelli Laterali (30 sec)',
    category: 'Agility',
    description: "Test di resistenza alla forza esplosiva laterale e stabilità delle caviglie.",
    equipment: "Cronometro, una linea a terra o ostacolino basso (<5cm).",
    procedure: [
      "Stai in piedi con la linea laterale a destra.",
      "Al via, salta a piedi uniti (o un piede, se specifico) oltre la linea e torna indietro continuamente.",
      "Conta ogni contatto con il suolo come 1 (oppure ogni ciclo completo).",
      "Continua alla massima velocità per 30 secondi."
    ],
    measurement: "Numero totale di salti/contatti in 30 secondi."
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
    id: 'wall-toss',
    name: 'Test Lancio al Muro (Wall Toss)',
    category: 'Coordination',
    description: "Test di coordinazione oculo-manuale (Hand-Eye Coordination).",
    equipment: "Palla da tennis, muro liscio, metro, cronometro.",
    procedure: [
      "Stai in piedi a 2 metri di distanza dal muro.",
      "Lancia la palla con la mano DESTRA contro il muro e afferrala con la SINISTRA.",
      "Lancia subito con la SINISTRA e afferra con la DESTRA.",
      "Continua alternando per 30 secondi.",
      "La palla deve essere lanciata dal basso verso l'alto."
    ],
    measurement: "Numero di prese corrette in 30 secondi."
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
  },
  {
    id: 'sit-reach',
    name: 'Sit and Reach',
    category: 'Flexibility',
    description: "Misura la flessibilità della bassa schiena e dei muscoli ischiocrurali (femorali).",
    equipment: "Box per sit and reach o un metro a terra e un nastro adesivo (linea dello zero a 15 pollici/38cm).",
    procedure: [
      "Siediti a terra gambe tese, piedi nudi contro il box (o al segno).",
      "Sovrapponi le mani e spingiti in avanti lentamente lungo il metro espirando.",
      "Mantieni la posizione massima per 2 secondi senza piegare le ginocchia.",
      "Non molleggiare."
    ],
    measurement: "Distanza raggiunta in cm."
  }
];

export const TestsView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getIcon = (category: string) => {
    switch(category) {
      case 'Reaction': return <Radio size={20} className="text-cyan-500" />;
      case 'Agility': return <Activity size={20} className="text-blue-500" />;
      case 'Endurance': return <Timer size={20} className="text-red-500" />;
      case 'Power': return <Zap size={20} className="text-orange-500" />;
      case 'Strength': return <Dumbbell size={20} className="text-purple-500" />;
      case 'Coordination': return <Eye size={20} className="text-teal-500" />;
      case 'Flexibility': return <Move size={20} className="text-pink-500" />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Libreria Test Fisici</h2>
        <p className="text-gray-500">Valuta la tua condizione atletica con questi test standardizzati da campo, inclusi i nuovi test Blazepod.</p>
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
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${
                    test.category === 'Reaction' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-500'
                  }`}>
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

                  {test.category === 'Reaction' && (
                    <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-lg flex items-center gap-2">
                       <Radio size={16} className="text-cyan-600" />
                       <span className="text-xs text-cyan-800 font-medium">Test ottimizzato per sistemi di luci Blazepod.</span>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
