import React, { useState } from 'react';
import { ApplicationDocuments } from '../types';
import { Copy, Mail, FileText, Check } from 'lucide-react';

interface Props {
  data: ApplicationDocuments;
}

const Documents: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'email'>('letter');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = activeTab === 'letter' ? data.coverLetter : data.email;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Questions Section */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
        <h3 className="text-indigo-900 font-semibold mb-3 text-sm uppercase tracking-wide">
          2 Questions pour le recruteur
        </h3>
        <ul className="list-disc list-inside space-y-2 text-indigo-800 text-sm">
          {data.interviewQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'letter' 
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" /> Lettre de Motivation
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'email' 
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4" /> Courriel d'accompagnement
          </button>
        </div>

        <div className="p-6 relative">
          <button
            onClick={handleCopy}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Copier le texte"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-serif">
            {activeTab === 'letter' ? data.coverLetter : data.email}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;