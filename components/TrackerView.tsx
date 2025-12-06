import React, { useState, useEffect } from 'react';
import { TestResult } from '../types';
import { TESTS_DATA } from './TestsView';
import { Button } from './Button';
import { Trash2, User as UserIcon, Calendar, ClipboardCheck, History } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface TrackerViewProps {
  user: User;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ user }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [athleteName, setAthleteName] = useState(user.displayName || '');
  const [selectedTestId, setSelectedTestId] = useState(TESTS_DATA[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'test_results'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResults: TestResult[] = [];
      snapshot.forEach((doc) => {
        fetchedResults.push({ id: doc.id, ...doc.data() } as TestResult);
      });
      setResults(fetchedResults);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName || !value) return;

    const test = TESTS_DATA.find(t => t.id === selectedTestId);
    
    const newResult: Omit<TestResult, 'id'> = {
      testId: selectedTestId,
      testName: test?.name || 'Test Sconosciuto',
      athleteName: athleteName.trim(),
      date,
      value,
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'test_results'), newResult);
      setValue('');
    } catch (error) {
      console.error("Error adding result:", error);
      alert("Errore nel salvataggio.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo risultato?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'test_results', id));
      } catch (error) {
        console.error("Error deleting result:", error);
      }
    }
  };

  // Group results by athlete
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.athleteName]) {
      acc[curr.athleteName] = [];
    }
    acc[curr.athleteName].push(curr);
    return acc;
  }, {} as Record<string, TestResult[]>);

  // Sort athletes alphabetically
  const athleteNames = Object.keys(groupedResults).sort();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-tennis-dark p-2 rounded-xl text-tennis-green">
            <ClipboardCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Inserisci Risultato</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <UserIcon size={16} /> Atleta
            </label>
            <input
              type="text"
              placeholder="Nome e Cognome"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tennis-green bg-gray-50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} /> Data Esecuzione
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tennis-green bg-gray-50"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Seleziona Test</label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tennis-green bg-gray-50"
            >
              {TESTS_DATA.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Risultato</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Es. 22 secondi, 2400 metri, 35 giri..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tennis-green bg-gray-50"
                required
              />
              <Button type="submit" variant="primary" className="whitespace-nowrap">
                Salva nel Cloud
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggerimento: Inserisci anche l'unità di misura (es. 'giri', 'sec', 'cm').
            </p>
          </div>

        </form>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 px-2 flex items-center gap-2">
          <History size={20} className="text-tennis-accent" /> Registro Storico
        </h3>
        
        {loading ? (
            <div className="text-center py-8 text-gray-400">Caricamento risultati...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            Nessun risultato registrato nel cloud.
          </div>
        ) : (
          athleteNames.map(name => (
            <div key={name} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full text-tennis-dark shadow-sm font-bold w-10 h-10 flex items-center justify-center">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">{name}</h4>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                  {groupedResults[name].length} test
                </span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {groupedResults[name]
                  .map((result) => (
                    <div key={result.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <span className="font-semibold text-gray-800">{result.testName}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(result.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-tennis-accent bg-teal-50 inline-block px-2 py-0.5 rounded">
                          {result.value}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(result.id)}
                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                        title="Elimina risultato"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
