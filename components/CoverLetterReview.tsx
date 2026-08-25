import React from 'react';
import { CoverLetterAudit } from '../types';
import { CheckCircle, XCircle, Lightbulb, FileText } from 'lucide-react';

interface Props {
  data: CoverLetterAudit;
}

const CoverLetterReview: React.FC<Props> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 border-yellow-600 bg-yellow-50';
    return 'text-red-600 border-red-600 bg-red-50';
  };

  return (
    <div className="space-y-8">
      {/* Score Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${getScoreColor(data.score)}`}>
          <div className="text-center">
            <span className="text-3xl font-bold block">{data.score}</span>
            <span className="text-xs text-slate-500 font-medium">Score Impact</span>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Points Forts
            </h4>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Points Faibles
            </h4>
            <ul className="space-y-1">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Suggestions d'Amélioration
        </h3>
        <ul className="space-y-3">
          {data.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700">{s}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Revised Version */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Version Réécrite Optimisée
        </h3>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-serif">
          {data.revisedVersion}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterReview;
