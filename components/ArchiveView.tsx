
import React, { useState, useEffect } from 'react';
import { SavedPlan, SavedLessonPlan } from '../types';
import { Trash2, Download, Calendar, Dumbbell, Trophy, ArrowRight, CloudOff, GraduationCap, Clock, Users } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ArchiveViewProps {
  onLoadPlan: (plan: SavedPlan) => void;
  onLoadLesson: (lesson: SavedLessonPlan) => void;
  user: User;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ onLoadPlan, onLoadLesson, user }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'lessons'>('plans');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [savedLessons, setSavedLessons] = useState<SavedLessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Plans
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'plans'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: SavedPlan[] = [];
      snapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() } as SavedPlan);
      });
      setSavedPlans(plans);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Lessons
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'lessons'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessons: SavedLessonPlan[] = [];
      snapshot.forEach((doc) => {
        lessons.push({ id: doc.id, ...doc.data() } as SavedLessonPlan);
      });
      setSavedLessons(lessons);
      setLoading(false); // Assume both load quickly enough or handle separate loading states
    });
    return () => unsubscribe();
  }, [user]);

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo programma dal cloud?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'plans', id));
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  const handleDeleteLesson = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questa lezione dal cloud?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'lessons', id));
      } catch (error) {
        console.error("Error deleting lesson:", error);
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
        <p className="text-gray-500">I tuoi allenamenti e lezioni salvati online.</p>
        
        {/* Tabs */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'plans' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Programmi ({savedPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'lessons' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lezioni Coach ({savedLessons.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'plans' ? (
        // PLANS LIST
        savedPlans.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Download className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nessun programma salvato</h3>
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
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(plan.createdAt).toLocaleDateString()}
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
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic">"{plan.weeklyGoal}"</p>
                  <div className="flex justify-end">
                     <span className="text-sm font-semibold text-tennis-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                       Apri <ArrowRight size={16} />
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // LESSONS LIST
        savedLessons.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <GraduationCap className="mx-auto h-12 w-12 text-indigo-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nessuna lezione salvata</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedLessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onLoadLesson(lesson)}
              >
                <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-indigo-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                      {lesson.title}
                    </h3>
                    <button 
                      onClick={(e) => handleDeleteLesson(lesson.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-indigo-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(lesson.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${
                      lesson.sport === 'Tennis' ? 'bg-tennis-green/20 text-tennis-dark' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Trophy size={12} /> {lesson.sport}
                    </span>
                    <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                      <Clock size={12} /> {lesson.duration}m
                    </span>
                    <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                      <Users size={12} /> {lesson.mode.split(' ')[0]}
                    </span>
                  </div>
                  
                  <div className="flex justify-end">
                     <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                       Apri Lezione <ArrowRight size={16} />
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
