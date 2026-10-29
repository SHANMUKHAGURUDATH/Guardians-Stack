import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  X,
  Send,
  Maximize2,
  Minimize2,
  Sparkles,
  FileText,
  Shield,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Globe,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  familyMemberName?: string;
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

export const PersistentAiAssistant: React.FC = () => {
  const {
    isAiWidgetOpen,
    setIsAiWidgetOpen,
    familyMembers,
    policies,
    documents,
    medicalRecords,
    language,
    setLanguage,
    navigate,
    user,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${user?.displayName || 'there'}! I am your Guardian Stack Document Intelligence Assistant.\n\nI answer questions directly from your verified family insurance policies, medical records, and vault documents without guessing or hallucinations. What can I verify for you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceStatus: 'System Verified',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      familyMemberName:
        selectedMemberFilter === 'all'
          ? 'All Family Members'
          : familyMembers.find((m) => m.id === selectedMemberFilter)?.fullName,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      // Filter authorized records for selected family member (NO RAG: direct bounded evidence retrieval)
      const targetMember =
        selectedMemberFilter !== 'all'
          ? familyMembers.find((m) => m.id === selectedMemberFilter)
          : undefined;

      const filteredPolicies =
        selectedMemberFilter === 'all'
          ? policies
          : policies.filter((p) => p.familyMemberId === selectedMemberFilter);

      const filteredDocs =
        selectedMemberFilter === 'all'
          ? documents
          : documents.filter((d) => d.familyMemberId === selectedMemberFilter);

      const filteredMeds =
        selectedMemberFilter === 'all'
          ? medicalRecords
          : medicalRecords.filter((m) => m.familyMemberId === selectedMemberFilter);

      const response = await fetch('/api/gemini/ask', {
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document query');
      }

      // Check citations and actions
      const citations: ChatMessage['sourceCitations'] = [];
      let suggestedAction: ChatMessage['suggestedAction'] | undefined = undefined;

      // Extract document or policy citations from answer text or records
      filteredDocs.forEach((d) => {
        if (data.answer?.toLowerCase().includes(d.title.toLowerCase()) || data.answer?.includes(d.originalFileName)) {
          citations.push({ title: d.title, docId: d.id });
          if (!suggestedAction) {
            suggestedAction = { label: `Open "${d.title}"`, view: 'document_detail', targetId: d.id };
          }
        }
      });

      filteredPolicies.forEach((p) => {
        if (data.answer?.toLowerCase().includes(p.policyName.toLowerCase()) || data.answer?.includes(p.policyNumber)) {
          citations.push({ title: p.policyName, policyId: p.id });
          if (!suggestedAction) {
            suggestedAction = { label: `View Policy: ${p.policyName}`, view: 'policy_detail', targetId: p.id };
          }
        }
      });

      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.answer || 'Answer provided based on stored records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceCitations: citations.length > 0 ? citations : undefined,
        confidenceStatus: data.source === 'gemini-3.8-flash' ? 'Document-Grounded (Gemini 3.8 Flash)' : 'Local Record Match',
        suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[AI Assistant Client]', err);
      setErrorMsg(err.message || 'Error communicating with Document Intelligence API');
      const errorReply: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `I encountered an issue verifying this request: ${err.message}. Please check your connection or inspect the document directly in Document Vault.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceStatus: 'Error State',
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What is the annual premium for our health policy?',
    'What is the documented grace period?',
    'Are there any recorded drug allergies?',
    'What documents are needed for a cashless claim?',
  ];

  return (
    <>
      {/* Floating Button in Bottom-Right (Southeast) */}
      {!isAiWidgetOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          <button
            onClick={() => setIsAiWidgetOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 text-white font-bold text-xs shadow-xl shadow-teal-900/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
            aria-label="Open Ask AI assistant"
          >
            {/* Subtle Pulse Halo */}
            <span className="absolute -inset-1 rounded-full bg-teal-400/25 blur-sm animate-pulse group-hover:bg-teal-400/40"></span>

            <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="relative tracking-wide font-semibold pr-1">Ask AI</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Workspace Panel */}
      {isAiWidgetOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out shadow-2xl bg-white dark:bg-[#0B101E] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-8'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Document Intelligence AI
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    No-RAG Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct Evidence Grounding • Gemini 3.8 Flash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsAiWidgetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar: Family Member & Language */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1424] flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-900">All Family Members</option>
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id} className="dark:bg-slate-900">
                    {m.fullName} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Globe className="w-3 h-3" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="en" className="dark:bg-slate-900">English</option>
                <option value="te" className="dark:bg-slate-900">తెలుగు</option>
                <option value="hi" className="dark:bg-slate-900">हिंदी</option>
              </select>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {msg.sender === 'user' ? 'You' : 'Guardian Stack Intelligence'}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-600">
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.text}

                  {/* Confidence / Status Pill */}
                  {msg.confidenceStatus && msg.sender === 'assistant' && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-500" />
                        {msg.confidenceStatus}
                      </span>
                    </div>
                  )}

                  {/* Clickable Citations */}
                  {msg.sourceCitations && msg.sourceCitations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        Evidence Sources:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sourceCitations.map((cite, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (cite.docId) navigate('document_detail', cite.docId);
                              else if (cite.policyId) navigate('policy_detail', cite.policyId);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-100 transition-colors text-[10px] font-medium cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{cite.title}</span>
                            {cite.page && <span className="opacity-75">(P.{cite.page})</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Direct Action Button */}
                  {msg.suggestedAction && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => {
                          navigate(
                            msg.suggestedAction!.view as any,
                            msg.suggestedAction!.targetId
                          );
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-500" />
                <span className="text-xs font-medium">
                  Inspecting stored documents & verifying evidence...
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Queries */}
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0A0E1A] overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101E]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about grace periods, premiums, allergies..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white disabled:opacity-50 hover:shadow-md transition-all cursor-pointer"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
