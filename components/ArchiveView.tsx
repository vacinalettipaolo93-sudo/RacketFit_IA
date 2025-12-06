import React, { useState, useEffect } from 'react';
import { SavedPlan } from '../types';
import { Trash2, Download, Calendar, Dumbbell, Trophy, ArrowRight, CloudOff } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ArchiveViewProps {
  onLoadPlan: (plan: SavedPlan) => void;
  user: User;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ onLoadPlan, user }) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'plans'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: SavedPlan[] = [];
      snapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() } as SavedPlan);
      });
      setSavedPlans(plans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo programma dal cloud?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'plans', id));
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Errore durante l'eliminazione.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 w-4 bg-gray-300 rounded-full mx-1"></div>
          <div className="h-4 w-4 bg-gray-300 rounded-full mx-1"></div>
          <div className="h-4 w-4 bg-gray-300 rounded-full mx-1"></div>
        </div>
        <p className="mt-4 text-gray-500">Sincronizzazione archivio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Archivio Cloud</h2>
        <p className="text-gray-500">I tuoi allenamenti salvati online, sicuri e pronti.</p>
      </div>

      {savedPlans.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Download className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nessun programma salvato</h3>
          <p className="text-gray-500 mt-1">Genera un programma e salvalo per vederlo qui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedPlans.map((plan) => (
            <div 
              key={plan.id} 
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onLoadPlan(plan)}
            >
              <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-tennis-dark transition-colors">
                    {plan.title}
                  </h3>
                  <button 
                    onClick={(e) => handleDelete(plan.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} /> Creato il {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${
                    plan.sport === 'Tennis' ? 'bg-tennis-green/20 text-tennis-dark' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Trophy size={12} /> {plan.sport}
                  </span>
                  <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                    <Dumbbell size={12} /> {plan.level}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic">
                  "{plan.weeklyGoal}"
                </p>

                <div className="flex justify-end">
                   <span className="text-sm font-semibold text-tennis-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                     Apri Programma <ArrowRight size={16} />
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
