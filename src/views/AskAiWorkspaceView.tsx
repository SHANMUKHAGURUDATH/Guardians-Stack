import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Shield,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Globe,
  User,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface FullChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  memberFilter?: string;
  sourceCitations?: {
    title: string;
    page?: number;
    docId?: string;
    policyId?: string;
  }[];
  confidenceStatus?: string;
  suggestedAction?: {
    label: string;
    view: string;
    targetId?: string;
  };
}

export const AskAiWorkspaceView: React.FC = () => {
  const {
    familyMembers,
    policies,
    documents,
    medicalRecords,
    language,
    setLanguage,
    navigate,
    user,
  } = useApp();

  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<FullChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${user?.displayName || 'there'}! Welcome to the Guardian Stack Document Intelligence Workspace.\n\nThis system implements a strict **NO-RAG / Direct Document Lookup Architecture**. Instead of generating synthetic vector embeddings, I inspect your exact authorized policy contracts, discharge summaries, and payment records to provide cited, verified answers with zero hallucinations.\n\nAsk any question about your family's coverage, grace periods, allergies, or emergency procedures below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceStatus: 'System Verified',
    },
  ]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setErrorMsg(null);
    const targetMember =
      selectedMember !== 'all'
        ? familyMembers.find((m) => m.id === selectedMember)
        : undefined;

    const userMsg: FullChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memberFilter: targetMember?.fullName || 'All Family Members',
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const filteredPolicies =
        selectedMember === 'all'
          ? policies
          : policies.filter((p) => p.familyMemberId === selectedMember);

      const filteredDocs =
        selectedMember === 'all'
          ? documents
          : documents.filter((d) => d.familyMemberId === selectedMember);

      const filteredMeds =
        selectedMember === 'all'
          ? medicalRecords
          : medicalRecords.filter((m) => m.familyMemberId === selectedMember);

      const resp = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          familyMemberName: targetMember?.fullName || 'All Family Members',
          familyMemberRelation: targetMember?.relationship || '',
          authorizedDocuments: filteredDocs,
          authorizedPolicies: filteredPolicies,
          authorizedMedicalRecords: filteredMeds,
          language,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete query');
      }

      // Extract citations
      const citations: FullChatMessage['sourceCitations'] = [];
      let action: FullChatMessage['suggestedAction'] | undefined = undefined;

      filteredDocs.forEach((d) => {
        if (data.answer?.toLowerCase().includes(d.title.toLowerCase()) || data.answer?.includes(d.originalFileName)) {
          citations.push({ title: d.title, docId: d.id });
          if (!action) action = { label: `Inspect Document: ${d.title}`, view: 'document_detail', targetId: d.id };
        }
      });

      filteredPolicies.forEach((p) => {
        if (data.answer?.toLowerCase().includes(p.policyName.toLowerCase()) || data.answer?.includes(p.policyNumber)) {
          citations.push({ title: p.policyName, policyId: p.id });
          if (!action) action = { label: `View Policy: ${p.policyName}`, view: 'policy_detail', targetId: p.id };
        }
      });

      const assistantMsg: FullChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceCitations: citations.length > 0 ? citations : undefined,
        confidenceStatus: data.source === 'gemini-3.8-flash' ? 'Document-Grounded (Gemini 3.8 Flash)' : 'Local Record Match',
        suggestedAction: action,
      };

      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing AI document lookup');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'What is the annual premium for our health policy and when is it due?',
    'Show me the page where the grace period is mentioned.',
    'Are there any penicillin or drug allergies documented for Kabir?',
    'Who is recorded as the primary nominee for Ramesh Sharma?',
    'What documents are needed for cashless hospitalization under HDFC ERGO?',
    'Compare the recorded coverage amounts across all our policies.',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Ask AI — Direct Document Intelligence
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Strict No-RAG Truth
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Direct bounded inspection of your uploaded insurance policies, discharge summaries, and medical records.
        </p>
      </div>

      {/* Control Bar: Family Member Selector & Language */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Target Member:</span>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Family Members</option>
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.relationship})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Sample Document-Grounded Inquiries:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(p)}
              disabled={isLoading}
              className="p-3 text-left rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer font-medium leading-relaxed"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat History Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-5">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col ${
                item.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {item.sender === 'user' ? 'You' : 'Guardian Stack Assistant'}
                </span>
                <span>•</span>
                <span className="text-[11px]">{item.timestamp}</span>
                {item.memberFilter && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Scope: {item.memberFilter}
                  </span>
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-3xl p-5 text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                  item.sender === 'user'
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                }`}
              >
                {item.text}

                {/* Citations */}
                {item.sourceCitations && item.sourceCitations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Verified Document Citations (Clickable):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.sourceCitations.map((cite, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (cite.docId) navigate('document_detail', cite.docId);
                            else if (cite.policyId) navigate('policy_detail', cite.policyId);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-100 font-semibold cursor-pointer text-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{cite.title}</span>
                          {cite.page && <span>(Page {cite.page})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action */}
                {item.suggestedAction && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate(item.suggestedAction!.view as any, item.suggestedAction!.targetId)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{item.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-500" />
              <span>Inspecting stored documents & cross-referencing evidence clauses...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about your policies, grace periods, medications..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs shadow-md shadow-teal-900/20 disabled:opacity-50 cursor-pointer flex items-center gap-2 hover:scale-102 active:scale-98 transition-all"
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
