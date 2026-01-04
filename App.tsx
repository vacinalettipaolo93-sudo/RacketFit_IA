
import React, { useState, useEffect } from 'react';
import { generateTrainingPlan, generateLessonPlan, getStoredApiKey, saveApiKey, removeApiKey, hasEnvApiKey } from './services/geminiService';
import { UserPreferences, WeeklyPlan, SavedPlan, LessonPreferences, LessonPlan, SavedLessonPlan, GroupSize } from './types';
import { InputForm } from './components/InputForm';
import { PlanDisplay } from './components/PlanDisplay';
import { TestsView } from './components/TestsView';
import { TrackerView } from './components/TrackerView';
import { ArchiveView } from './components/ArchiveView';
import { LessonForm } from './components/LessonForm';
import { LessonDisplay } from './components/LessonDisplay';
import { Activity, ClipboardList, Dumbbell, Trophy, Archive, LogOut, User as UserIcon, Lock, Mail, UserPlus, Settings, Key, X, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { auth, db } from './services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from './components/Button';

type ViewState = 'generator' | 'lessons' | 'tests' | 'tracker' | 'archive';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<ViewState>('generator');
  
  // Weekly Plan State
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [lastPrefs, setLastPrefs] = useState<UserPreferences | null>(null);
  
  // Lesson Plan State
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Settings / API Key State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [envKeyDetected, setEnvKeyDetected] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    // Check for keys on load
    setStoredKey(getStoredApiKey());
    setEnvKeyDetected(hasEnvApiKey());
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Alias management for 'admin'
    let finalEmail = email.trim();
    if (finalEmail.toLowerCase() === 'admin') {
      finalEmail = 'admin@racketfit.ai';
    }

    if (!finalEmail || !password) {
      setError("Inserisci email e password.");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri (richiesta Firebase).");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, finalEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, finalEmail, password);
      }
    } catch (error: any) {
      console.error("Auth failed", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Credenziali non valide.");
      } else if (error.code === 'auth/email-already-in-use') {
        setError("Email già registrata. Prova ad accedere.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password troppo debole (min 6 caratteri).");
      } else {
        setError("Errore di autenticazione: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPlan(null);
      setLessonPlan(null);
      setCurrentView('generator');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleGenerate = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setLastPrefs(prefs);
    try {
      const generatedPlan = await generateTrainingPlan(prefs);
      setPlan(generatedPlan);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        setError("Chiave API mancante. Configurala nelle impostazioni.");
        setShowSettings(true); 
      } else {
        setError("Si è verificato un errore durante la generazione. Verifica la connessione.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLesson = async (prefs: LessonPreferences) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedLesson = await generateLessonPlan(prefs);
      setLessonPlan(generatedLesson);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        setError("Chiave API mancante. Configurala nelle impostazioni.");
        setShowSettings(true);
      } else {
        setError("Errore generazione lezione. Riprova.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setStoredKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowSettings(false);
      setError(null); 
    }
  };

  const handleRemoveApiKey = () => {
    removeApiKey();
    setStoredKey(null);
  };

  const handleSavePlan = async (title: string) => {
    if (!plan || !lastPrefs || !user) return;
    
    setIsLoading(true);
    const newSavedPlan: Omit<SavedPlan, 'id'> = {
      ...plan,
      title,
      createdAt: new Date().toISOString(),
      sport: lastPrefs.sport,
      level: lastPrefs.level,
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'plans'), newSavedPlan);
    } catch (e) {
      console.error("Error saving plan: ", e);
      setError("Errore nel salvataggio online.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLesson = async (lesson: LessonPlan) => {
    if (!user) return;
    setIsLoading(true);
    const newSavedLesson: Omit<SavedLessonPlan, 'id'> = {
      ...lesson,
      createdAt: new Date().toISOString(),
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'lessons'), newSavedLesson);
    } catch (e) {
      console.error("Error saving lesson: ", e);
      setError("Errore nel salvataggio lezione.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPlan = (savedPlan: SavedPlan) => {
    setPlan(savedPlan);
    setCurrentView('generator');
    setLastPrefs({
        sport: savedPlan.sport as any,
        level: savedPlan.level as any,
        sessionsPerWeek: '2' as any,
        focus: 'Misto (Generale)' as any,
        phase: 'In-season',
        includeCognitive: false,
        useBlazepod: false,
        warmupType: 'Standard',
        groupSize: GroupSize.ONE
    });
  };

  const handleLoadLesson = (savedLesson: SavedLessonPlan) => {
    setLessonPlan(savedLesson);
    setCurrentView('lessons');
  };

  const reset = () => {
    setPlan(null);
    setLessonPlan(null);
    setError(null);
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="text-tennis-green mb-4" size={48} />
          <div className="text-gray-400 font-medium">Caricamento RacketFit AI...</div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tennis-green/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 sm:p-12 rounded-3xl max-w-md w-full text-center z-10 shadow-2xl">
          <div className="bg-tennis-dark w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-tennis-green/20">
            <Activity className="text-tennis-green" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">RacketFit AI</h1>
          <p className="text-gray-300 mb-8">
            {isRegistering ? 'Crea Nuovo Account' : 'Login Amministratore'}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email o 'admin'"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 caratteri)"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-900/30">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              fullWidth
              className="mt-2"
            >
              {isRegistering ? 'Registrati' : 'Accedi'}
            </Button>
            
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
              className="text-sm text-gray-400 hover:text-white mt-4 underline underline-offset-2"
            >
              {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Crealo qui'}
            </button>
          </form>
          
          <p className="text-xs text-gray-600 mt-6">
            Nota: Se usi l'utente "admin", la password deve essere di almeno 6 caratteri (es. "admin123").
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 relative">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="text-tennis-dark" /> Impostazioni
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stato Connessione AI
              </label>

              {/* Status Indicators */}
              <div className="space-y-3 mb-4">
                {envKeyDetected ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-800">Connessione Server Attiva</p>
                      <p className="text-xs text-green-700">L'app sta usando la configurazione automatica.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                     <AlertCircle size={20} className="text-amber-600" />
                     <div>
                       <p className="text-sm font-bold text-amber-800">Chiave manuale richiesta</p>
                       <p className="text-xs text-amber-700">Inserisci una chiave Gemini API per procedere.</p>
                     </div>
                  </div>
                )}
              </div>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2 mt-6">
                Chiave Manuale (Opzionale)
              </label>
              
              {storedKey ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-700 font-mono text-sm">
                    <Key size={16} />
                    <span>••••••••{storedKey.slice(-4)}</span>
                  </div>
                  <Button variant="danger" onClick={handleRemoveApiKey} className="px-3 py-1 text-xs">
                    Rimuovi
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Incolla qui la tua chiave (AIza...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-tennis-green focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    La chiave verrà salvata nel browser e utilizzata per le richieste AI.
                  </p>
                  <Button fullWidth onClick={handleSaveApiKey} disabled={!apiKeyInput.trim()}>
                    Salva Chiave
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 flex justify-between items-center">
              <span>RacketFit AI v1.2.0</span>
              {envKeyDetected && <span className="text-green-600 font-semibold">Online</span>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentView('generator'); reset(); }}>
            <div className="bg-tennis-dark p-2 rounded-lg">
              <Activity className="text-tennis-green" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-tennis-dark hidden sm:block">
              RacketFit <span className="text-tennis-accent font-light">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <UserIcon size={16} />
                <span>{user.email?.split('@')[0]}</span>
             </div>
             
             <button 
               onClick={() => setShowSettings(true)}
               className="text-gray-400 hover:text-tennis-dark transition-colors p-2 rounded-full hover:bg-gray-100"
               title="Impostazioni"
             >
               <Settings size={20} />
             </button>

             <button 
               onClick={handleLogout}
               className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
               title="Disconnetti"
             >
               <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-6 overflow-x-auto no-scroll-bar">
          <button
            onClick={() => setCurrentView('generator')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              currentView === 'generator' 
                ? 'border-tennis-dark text-tennis-dark' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Dumbbell size={16} /> Generatore
          </button>
          <button
            onClick={() => setCurrentView('lessons')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              currentView === 'lessons' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <GraduationCap size={16} /> Lezioni
          </button>
          <button
             onClick={() => setCurrentView('tests')}
             className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
               currentView === 'tests' 
                 ? 'border-tennis-dark text-tennis-dark' 
                 : 'border-transparent text-gray-400 hover:text-gray-600'
             }`}
          >
            <ClipboardList size={16} /> Test Fisici
          </button>
          <button
             onClick={() => setCurrentView('tracker')}
             className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
               currentView === 'tracker' 
                 ? 'border-tennis-dark text-tennis-dark' 
                 : 'border-transparent text-gray-400 hover:text-gray-600'
             }`}
          >
            <Trophy size={16} /> Registro
          </button>
          <button
             onClick={() => setCurrentView('archive')}
             className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
               currentView === 'archive' 
                 ? 'border-tennis-dark text-tennis-dark' 
                 : 'border-transparent text-gray-400 hover:text-gray-600'
             }`}
          >
            <Archive size={16} /> Archivio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center gap-2">
            <p>{error}</p>
            {error.includes("Chiave API") && (
              <Button variant="secondary" onClick={() => setShowSettings(true)} className="py-1 px-4 text-sm">
                Configura Chiave
              </Button>
            )}
          </div>
        )}

        {/* Loading State Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-tennis-green rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Activity className="text-tennis-dark animate-pulse" size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Elaborazione...</h3>
            <p className="text-gray-500 text-center max-w-md">
              Il Coach AI sta elaborando il tuo programma personalizzato.
            </p>
          </div>
        )}

        {/* View Switching logic */}
        {currentView === 'tests' ? (
          <TestsView />
        ) : currentView === 'tracker' ? (
          <TrackerView user={user} />
        ) : currentView === 'archive' ? (
          <ArchiveView user={user} onLoadPlan={handleLoadPlan} onLoadLesson={handleLoadLesson} />
        ) : currentView === 'lessons' ? (
          /* Coach / Lesson Mode */
          !lessonPlan ? (
             <LessonForm onSubmit={handleGenerateLesson} isLoading={isLoading} />
          ) : (
             <LessonDisplay lesson={lessonPlan} onReset={reset} onSave={handleSaveLesson} />
          )
        ) : (
          /* Generator View (Default) */
          !plan ? (
            <div className="animate-fade-in-up">
              <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
              
              {/* Features / Benefits Grid */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto no-print">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-700">
                    <Activity />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Cloud Sync</h3>
                  <p className="text-sm text-gray-600">I tuoi programmi e risultati sono salvati online e accessibili da qualsiasi dispositivo.</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-700">
                    <Activity />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">High Tech</h3>
                  <p className="text-sm text-gray-600">Include ora il supporto per Blazepod e task cognitivi per un training all'avanguardia.</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-700">
                    <Activity />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Adattabile</h3>
                  <p className="text-sm text-gray-600">Programmi per 2 o 3 sessioni settimanali basati sul tuo livello e periodo della stagione.</p>
                </div>
              </div>
            </div>
          ) : (
            <PlanDisplay plan={plan} onReset={reset} onSave={handleSavePlan} />
          )
        )}
      </main>

    </div>
  );
};

export default App;
