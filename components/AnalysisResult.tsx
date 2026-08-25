import React from 'react';
import { JobAnalysis } from '../types';
import { CheckCircle2, AlertCircle, Building2, TrendingUp } from 'lucide-react';

interface Props {
  data: JobAnalysis;
}

const AnalysisResult: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Analyse Stratégique
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Mots-clés Essentiels</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          
          <div>
             <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Ton de l'entreprise</h4>
             <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{data.tone}</span>
             </div>
          </div>
        </div>

        <div className="mt-6">
           <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Contexte Entreprise</h4>
           <p className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-slate-200 pl-4">
             "{data.companyInsights}"
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
          <h4 className="text-green-800 font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Exigences Obligatoires
          </h4>
          <ul className="space-y-2">
            {data.mandatoryRequirements.map((req, i) => (
              <li key={i} className="text-green-900 text-sm flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Atouts Souhaités
          </h4>
          <ul className="space-y-2">
            {data.niceToHaveRequirements.map((req, i) => (
              <li key={i} className="text-blue-900 text-sm flex items-start gap-2">
                 <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;