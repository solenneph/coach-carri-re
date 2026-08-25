import React from 'react';
import { CVAudit } from '../types';
import { AlertTriangle, Check, ArrowRight } from 'lucide-react';

interface Props {
  data: CVAudit;
}

const CVReview: React.FC<Props> = ({ data }) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-600';
    if (score >= 50) return 'text-yellow-600 border-yellow-600';
    return 'text-red-600 border-red-600';
  };

  const getScoreBg = (score: number) => {
     if (score >= 80) return 'bg-green-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  }

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${getScoreColor(data.currentScore)} ${getScoreBg(data.currentScore)}`}>
          <div className="text-center">
            <span className={`text-3xl font-bold block ${getScoreColor(data.currentScore).split(' ')[0]}`}>{data.currentScore}</span>
            <span className="text-xs text-slate-500 font-medium">Score ATS</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Diagnostic de Compatibilité</h3>
          {data.criticalMissingKeywords.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Mots-clés manquants critiques</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.criticalMissingKeywords.map((kw, i) => (
                   <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                     {kw}
                   </span>
                ))}
              </div>
            </div>
          )}
           {data.formattingIssues.length > 0 && (
             <div className="text-sm text-slate-600">
                <strong className="text-slate-800">Problèmes de forme :</strong> {data.formattingIssues.join(', ')}
             </div>
           )}
        </div>
      </div>

      {/* Improvements List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Modifications Chirurgicales Recommandées
        </h3>
        <div className="space-y-4">
          {data.improvements.map((imp, i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                     <div className="flex-1 p-3 bg-red-50 rounded border border-red-100 text-sm text-red-900 line-through decoration-red-900/30">
                        <span className="block text-xs text-red-600 font-bold mb-1 uppercase">Original / Contexte</span>
                        {imp.original}
                     </div>
                     <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
                     <div className="flex-1 p-3 bg-green-50 rounded border border-green-100 text-sm text-green-900 font-medium">
                        <span className="block text-xs text-green-600 font-bold mb-1 uppercase">Suggestion Optimisée</span>
                        {imp.suggestion}
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Check className="w-3 h-3 text-slate-400" />
                    <span className="italic">{imp.reason}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CVReview;