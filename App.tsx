import React, { useState, useRef } from 'react';
import { analyzeJobAndCompany, auditCV, generateDocuments, auditCoverLetter } from './services/geminiService';
import { JobAnalysis, CVAudit, ApplicationDocuments, ProcessingStatus, UserInput, CoverLetterAudit } from './types';
import AnalysisResult from './components/AnalysisResult';
import CVReview from './components/CVReview';
import CoverLetterReview from './components/CoverLetterReview';
import Documents from './components/Documents';
import { Briefcase, Sparkles, Loader2, ChevronRight, PenTool, Upload, FileText, X, FileType, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<UserInput>({
    jobDescription: '',
    companyUrl: '',
    cvContent: '',
    cvFile: null,
    inputMethod: 'text',
    coverLetterContent: '',
    coverLetterFile: null,
    coverLetterInputMethod: 'text'
  });

  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [audit, setAudit] = useState<CVAudit | null>(null);
  const [clAudit, setClAudit] = useState<CoverLetterAudit | null>(null);
  const [docs, setDocs] = useState<ApplicationDocuments | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'cl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      
      if (type === 'cv') {
        setInputs(prev => ({
          ...prev,
          cvFile: {
            data: base64String,
            mimeType: file.type,
            name: file.name
          },
          error: null
        }));
      } else {
        setInputs(prev => ({
          ...prev,
          coverLetterFile: {
            data: base64String,
            mimeType: file.type,
            name: file.name
          },
          error: null
        }));
      }
    };
    reader.onerror = () => setError("Erreur lors de la lecture du fichier.");
    reader.readAsDataURL(file);
  };

  const clearFile = (type: 'cv' | 'cl') => {
    if (type === 'cv') {
      setInputs(prev => ({ ...prev, cvFile: null }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setInputs(prev => ({ ...prev, coverLetterFile: null }));
      if (clFileInputRef.current) clFileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    const hasCV = inputs.inputMethod === 'text' ? !!inputs.cvContent.trim() : !!inputs.cvFile;

    if (!inputs.jobDescription.trim() || !hasCV) {
      setError("Veuillez remplir l'offre d'emploi et fournir votre CV (texte ou fichier).");
      return;
    }

    setError(null);
    setStatus('analyzing');

    try {
      // Step 1: Analyze Job & Company
      const analysisResult = await analyzeJobAndCompany(inputs.jobDescription, inputs.companyUrl);
      setAnalysis(analysisResult);
      
      const cvInput = inputs.inputMethod === 'text' ? inputs.cvContent : inputs.cvFile!;

      setStatus('auditing');
      // Step 2: Audit CV
      const auditResult = await auditCV(cvInput, analysisResult);
      setAudit(auditResult);

      // Step 2.5: Audit Cover Letter (if provided)
      const hasCoverLetter = inputs.coverLetterInputMethod === 'text' ? !!inputs.coverLetterContent.trim() : !!inputs.coverLetterFile;
      if (hasCoverLetter) {
        const clInput = inputs.coverLetterInputMethod === 'text' ? inputs.coverLetterContent : inputs.coverLetterFile!;
        const clAuditResult = await auditCoverLetter(clInput, analysisResult);
        setClAudit(clAuditResult);
      } else {
        setClAudit(null);
      }

      setStatus('generating');
      // Step 3: Generate Docs
      const docsResult = await generateDocuments(cvInput, analysisResult, auditResult);
      setDocs(docsResult);

      setStatus('complete');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Une erreur est survenue lors du traitement. Veuillez vérifier votre connexion ou réessayer.");
      setStatus('error');
    }
  };

  const getStatusMessage = () => {
    switch(status) {
      case 'analyzing': return "Analyse de l'offre et du site web...";
      case 'auditing': return "Audit chirurgical de votre CV (et lettre)...";
      case 'generating': return "Rédaction de vos documents...";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Coach Carrière IA</h1>
              <p className="text-xs text-slate-500">Optimisation chirurgicale de candidature</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
            <span className={status === 'idle' ? 'text-indigo-600 font-medium' : ''}>1. Données</span>
            <ChevronRight className="w-4 h-4" />
            <span className={['analyzing', 'auditing', 'generating'].includes(status) ? 'text-indigo-600 font-medium' : ''}>2. Traitement</span>
            <ChevronRight className="w-4 h-4" />
            <span className={status === 'complete' ? 'text-green-600 font-medium' : ''}>3. Résultats</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                L'Offre
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description du poste <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-40 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                    placeholder="Collez l'offre d'emploi ici..."
                    value={inputs.jobDescription}
                    onChange={(e) => setInputs({...inputs, jobDescription: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Site web de l'entreprise
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="https://entreprise.com"
                    value={inputs.companyUrl}
                    onChange={(e) => setInputs({...inputs, companyUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-500" />
                Votre Profil (CV)
              </h2>
              
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setInputs(prev => ({ ...prev, inputMethod: 'text' }))}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputs.inputMethod === 'text' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Texte
                </button>
                <button
                  onClick={() => setInputs(prev => ({ ...prev, inputMethod: 'file' }))}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputs.inputMethod === 'file' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Fichier (PDF)
                </button>
              </div>

              {inputs.inputMethod === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contenu du CV <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-40 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                    placeholder="Copiez le texte complet de votre CV actuel ici..."
                    value={inputs.cvContent}
                    onChange={(e) => setInputs({...inputs, cvContent: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Téléverser le CV (PDF) <span className="text-red-500">*</span>
                  </label>
                  
                  {!inputs.cvFile ? (
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Cliquez pour importer</p>
                      <p className="text-xs text-slate-400 mt-1">PDF uniquement (Max 5MB)</p>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-indigo-200 p-2 rounded">
                          <FileType className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-indigo-900 truncate">{inputs.cvFile.name}</p>
                          <p className="text-xs text-indigo-600">PDF Importé</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('cv'); }}
                        className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, 'cv')}
                    accept="application/pdf"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Cover Letter Input (Optional) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Lettre de Motivation (Optionnel)
              </h2>
              
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setInputs(prev => ({ ...prev, coverLetterInputMethod: 'text' }))}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputs.coverLetterInputMethod === 'text' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Texte
                </button>
                <button
                  onClick={() => setInputs(prev => ({ ...prev, coverLetterInputMethod: 'file' }))}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputs.coverLetterInputMethod === 'file' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Fichier (PDF)
                </button>
              </div>

              {inputs.coverLetterInputMethod === 'text' ? (
                <div>
                  <textarea
                    className="w-full h-40 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                    placeholder="Copiez votre lettre de motivation existante ici pour analyse..."
                    value={inputs.coverLetterContent}
                    onChange={(e) => setInputs({...inputs, coverLetterContent: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {!inputs.coverLetterFile ? (
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors"
                      onClick={() => clFileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Cliquez pour importer</p>
                      <p className="text-xs text-slate-400 mt-1">PDF uniquement (Max 5MB)</p>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-indigo-200 p-2 rounded">
                          <FileType className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-indigo-900 truncate">{inputs.coverLetterFile.name}</p>
                          <p className="text-xs text-indigo-600">PDF Importé</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('cl'); }}
                        className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={clFileInputRef}
                    onChange={(e) => handleFileUpload(e, 'cl')}
                    accept="application/pdf"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleProcess}
              disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {status !== 'idle' && status !== 'complete' && status !== 'error' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getStatusMessage()}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyser & Optimiser
                </>
              )}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-8">
            {status === 'idle' && !analysis && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Sparkles className="w-16 h-16 mb-4 text-slate-200" />
                <p className="text-lg font-medium">En attente de vos données...</p>
                <p className="text-sm">Remplissez le formulaire pour démarrer l'optimisation.</p>
              </div>
            )}

            {analysis && (
              <section>
                <AnalysisResult data={analysis} />
              </section>
            )}

            {audit && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Audit du CV</h2>
                <CVReview data={audit} />
              </section>
            )}

            {clAudit && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Audit de la Lettre de Motivation</h2>
                <CoverLetterReview data={clAudit} />
              </section>
            )}

            {docs && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Documents Prêts à l'Envoi</h2>
                <Documents data={docs} />
              </section>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
