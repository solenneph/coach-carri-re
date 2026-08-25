import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobAnalysis, CVAudit, ApplicationDocuments, FileData, CoverLetterAudit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas for structured output ---

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Les 5 mots-clés de compétences techniques ou comportementales les plus critiques."
    },
    tone: {
      type: Type.STRING,
      description: "Le ton général de l'entreprise et de l'offre (ex: Formel, Innovant, Start-up, Corporatif)."
    },
    mandatoryRequirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste des exigences obligatoires."
    },
    niceToHaveRequirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste des atouts souhaités."
    },
    companyInsights: {
      type: Type.STRING,
      description: "Un résumé court des valeurs ou de la mission de l'entreprise basé sur le contexte."
    }
  },
  required: ["keywords", "tone", "mandatoryRequirements", "niceToHaveRequirements", "companyInsights"]
};

const auditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    currentScore: {
      type: Type.INTEGER,
      description: "Score ATS estimé sur 100 basé sur la correspondance des mots-clés et la structure."
    },
    criticalMissingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Mots-clés importants de l'offre absents du CV."
    },
    formattingIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Problèmes de structure ou de clarté."
    },
    improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "La section ou phrase originale (ou 'Général')." },
          suggestion: { type: Type.STRING, description: "La version réécrite optimisée." },
          reason: { type: Type.STRING, description: "Pourquoi ce changement améliore le score/impact." }
        }
      }
    }
  },
  required: ["currentScore", "criticalMissingKeywords", "formattingIssues", "improvements"]
};

const coverLetterAuditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Score d'impact sur 100." },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Points forts de la lettre." },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Points faibles ou manquants." },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions d'amélioration concrètes." },
    revisedVersion: { type: Type.STRING, description: "Une version réécrite intégrant les améliorations." }
  },
  required: ["score", "strengths", "weaknesses", "suggestions", "revisedVersion"]
};

const documentsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coverLetter: {
      type: Type.STRING,
      description: "Lettre de motivation complète (300-400 mots) au format Markdown."
    },
    email: {
      type: Type.STRING,
      description: "Courriel d'accompagnement court et percutant."
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 questions pertinentes à poser au recruteur pour démontrer l'intérêt."
    }
  },
  required: ["coverLetter", "email", "interviewQuestions"]
};

// --- Helpers ---

const getCVPart = (cvInput: string | FileData) => {
  if (typeof cvInput === 'string') {
    return { text: `Voici le contenu texte du CV du candidat:\n${cvInput}` };
  } else {
    return {
      inlineData: {
        data: cvInput.data,
        mimeType: cvInput.mimeType
      }
    };
  }
};

// --- API Calls ---

/**
 * Step 1: Analyze Job Description and Company URL
 */
export const analyzeJobAndCompany = async (jobDescription: string, companyUrl: string): Promise<JobAnalysis> => {
  const prompt = `
    Tu es un expert en recrutement. Analyse l'offre d'emploi suivante et utilise l'outil de recherche pour analyser le site web de l'entreprise fourni (si possible).
    
    Offre d'emploi:
    "${jobDescription}"

    Site web de l'entreprise à analyser: ${companyUrl}

    Objectif: Extraire les compétences clés, le ton, et les exigences.
    Si le site web n'est pas accessible, base l'analyse uniquement sur l'offre et déduis le ton.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: "Tu es un coach carrière expert. Réponds toujours en JSON valide."
    }
  });

  const text = response.text;
  if (!text) throw new Error("Pas de réponse de l'IA pour l'analyse.");
  
  return JSON.parse(text) as JobAnalysis;
};

/**
 * Step 2: Audit CV against the Analysis
 */
export const auditCV = async (cvInput: string | FileData, analysis: JobAnalysis): Promise<CVAudit> => {
  const cvPart = getCVPart(cvInput);
  
  const promptPart = {
    text: `
    Agis comme un système ATS (Applicant Tracking System) strict et un recruteur expert.
    
    Tâche:
    1. Analyse le CV fourni (texte ou pièce jointe).
    2. Compare-le avec ces critères issus de l'offre:
    Mots-clés requis: ${analysis.keywords.join(', ')}
    Exigences obligatoires: ${analysis.mandatoryRequirements.join(', ')}

    3. Calcule un score de compatibilité (0-100).
    4. Propose des améliorations chirurgicales. Chaque modification doit répondre à une exigence précise.
    `
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [cvPart, promptPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: auditSchema,
      systemInstruction: "Tu es un auditeur de CV impitoyable mais constructif. Optimise pour le score ATS."
    }
  });

  const text = response.text;
  if (!text) throw new Error("Pas de réponse de l'IA pour l'audit.");

  return JSON.parse(text) as CVAudit;
};

/**
 * Step 3: Generate Cover Letter and Email
 */
export const generateDocuments = async (
  cvInput: string | FileData, 
  analysis: JobAnalysis, 
  audit: CVAudit
): Promise<ApplicationDocuments> => {
  const cvPart = getCVPart(cvInput);

  const promptPart = {
    text: `
    Rédige les documents de candidature.
    
    Contexte:
    - Candidat: (Voir CV fourni)
    - Entreprise/Poste: Utilise le ton "${analysis.tone}".
    - Points forts à mettre en avant: ${analysis.keywords.join(', ')}.
    - Lacunes comblées (basé sur l'audit): ${audit.criticalMissingKeywords.join(', ')}.

    Tâches:
    1. Une lettre de motivation (300-400 mots) : Professionnelle, bien structurée, lien direct entre expérience passée et besoins futurs de l'entreprise. Pas de jargon inutile.
    2. Un courriel d'accompagnement : Court, percutant, invite à l'action.
    3. Deux questions pertinentes à poser au recruteur.
    `
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [cvPart, promptPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: documentsSchema,
      systemInstruction: "Tu es un rédacteur professionnel de haut niveau. Ton français est impeccable."
    }
  });

  const text = response.text;
  if (!text) throw new Error("Pas de réponse de l'IA pour les documents.");

  return JSON.parse(text) as ApplicationDocuments;
};

/**
 * Step 4: Audit Cover Letter (Optional)
 */
export const auditCoverLetter = async (
  coverLetterInput: string | FileData,
  analysis: JobAnalysis
): Promise<CoverLetterAudit> => {
  const clPart = getCVPart(coverLetterInput); // Reusing getCVPart logic

  const promptPart = {
    text: `
    Agis comme un coach carrière expert.
    
    Tâche:
    1. Analyse la lettre de motivation fournie.
    2. Compare-la avec l'offre d'emploi et l'analyse de l'entreprise:
    Mots-clés requis: ${analysis.keywords.join(', ')}
    Ton attendu: ${analysis.tone}
    Insights entreprise: ${analysis.companyInsights}

    3. Fournis une critique constructive et une version améliorée.
    `
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [clPart, promptPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: coverLetterAuditSchema,
      systemInstruction: "Tu es un expert en rédaction de lettres de motivation. Sois précis et percutant."
    }
  });

  const text = response.text;
  if (!text) throw new Error("Pas de réponse de l'IA pour l'audit de la lettre.");

  return JSON.parse(text) as CoverLetterAudit;
};
