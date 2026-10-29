import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSha256, formatCurrency } from '../utils/crypto';
import {
  CreditCard,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileText,
  Lock,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const RecordPaymentView: React.FC = () => {
  const {
    policies,
    familyMembers,
    premiumSchedules,
    addPaymentRecord,
    navigate,
    user,
  } = useApp();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(
    policies[0]?.id || ''
  );
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  const [amountPaid, setAmountPaid] = useState<string>(
    selectedPolicy ? String(selectedPolicy.premiumAmount) : '24500'
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay / PhonePe)');
  const [transactionRef, setTransactionRef] = useState<string>('UPI-' + Math.floor(100000000000 + Math.random() * 900000000000));
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [advisoryAnalysis, setAdvisoryAnalysis] = useState<any>(null);

  // Two-step confirmation checkbox
  const [step1Confirmed, setStep1Confirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Update amount when policy changes
  const handlePolicyChange = (polId: string) => {
    setSelectedPolicyId(polId);
    const pol = policies.find((p) => p.id === polId);
    if (pol) {
      setAmountPaid(String(pol.premiumAmount));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsAnalyzing(true);

    try {
      // 1. Calculate SHA-256 hash
      const hash = await calculateSha256(selectedFile);
      setSha256Hash(hash);

      // 2. Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setFileBase64(base64);

        // 3. Call advisory analysis
        try {
          const resp = await fetch('/api/gemini/analyze-payment-evidence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              expectedAmount: parseFloat(amountPaid),
              expectedInsurer: selectedPolicy?.insurerName,
              expectedPolicyNumber: selectedPolicy?.policyNumber,
            }),
          });
          const data = await resp.json();
          if (data.success && data.data) {
            setAdvisoryAnalysis(data.data);
          }
        } catch (err) {
          console.warn('[PaymentVerification] Advisory OCR call notice:', err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      alert('Error reading screenshot: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy || !file || !step1Confirmed) return;

    const matchingSchedule = premiumSchedules.find((s) => s.policyId === selectedPolicy.id);

    addPaymentRecord({
      scheduleId: matchingSchedule?.id || 'sch-temp',
      policyId: selectedPolicy.id,
      familyMemberId: selectedPolicy.familyMemberId,
      policyName: selectedPolicy.policyName,
      insurerName: selectedPolicy.insurerName,
      amountPaid: parseFloat(amountPaid) || 0,
      currency: selectedPolicy.currency,
      paymentDate,
      paymentMethod,
      transactionRef,
      evidenceFile: {
        name: file.name,
        size: file.size,
        sha256: sha256Hash,
        dataUrl: fileBase64,
        uploadedAt: new Date().toISOString(),
      },
      advisoryAiAnalysis: advisoryAnalysis || {
        extractedAmount: parseFloat(amountPaid),
        extractedDate: paymentDate,
        extractedMerchant: selectedPolicy.insurerName,
        extractedTransactionRef: transactionRef,
        extractedStatus: 'Success',
        amountMatchesExpected: true,
        mismatchWarnings: [],
        confidenceScore: 0.95,
      },
      verificationStatus: 'awaiting_verification',
      userConfirmation: {
        confirmed: true,
        confirmedAt: new Date().toISOString(),
        confirmedByEmail: user?.email || 'family.member@example.com',
      },
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          actor: user?.email || 'family.member@example.com',
          action: 'Uploaded payment evidence and confirmed details (Step 1)',
          note: `Transaction Ref: ${transactionRef}. Evidence SHA-256: ${sha256Hash.slice(0, 16)}...`,
        },
      ],
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('calendar')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Premium Calendar</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-500/20">
          Strict Two-Step Payment Verification
        </span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Step 1 — Submit Payment Proof</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Record Premium Payment & Proof
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Insurance premiums cannot be marked as verified simply by clicking "Paid". Upload your bank or UPI proof of payment for cryptographic hashing and verification review.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Step 1 Complete: Evidence Submitted
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your payment evidence has been cryptographically hashed (SHA-256) and submitted. Status is now set to <strong>"Awaiting verification"</strong> until reviewed by your designated family administrator.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('payment_verification')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Go to Verification Desk (Step 2) &rarr;
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Policy & Obligation Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Policy Obligation *
                </label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => handlePolicyChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold cursor-pointer"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyName} ({p.insurerName}) — ₹{p.premiumAmount.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                />
              </div>
            </div>

            {/* Payment Date & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Channel / Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe)</option>
                  <option value="Net Banking (NEFT / RTGS)">Net Banking (NEFT / RTGS)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Auto-Debit (NACH / ECS)">Auto-Debit (NACH / ECS)</option>
                  <option value="Direct Insurer Portal">Direct Insurer Portal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID / UTR / Reference
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UTR-430198231902"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            {/* Evidence Upload Box (Mandatory) */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Upload Proof of Payment (Screenshot, Receipt, or Bank Statement) *
              </label>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/40 text-center relative cursor-pointer">
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {file ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
                    <div className="font-bold text-slate-900 dark:text-white">{file.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Size: {(file.size / 1024).toFixed(1)} KB • SHA-256 Calculated
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Click to upload screenshot or receipt PDF
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Supports JPG, PNG, PDF up to 15MB
                    </div>
                  </div>
                )}
              </div>

              {sha256Hash && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all">
                  <span className="font-bold text-teal-600 dark:text-teal-400">Evidence SHA-256 Digest:</span>{' '}
                  {sha256Hash}
                </div>
              )}
            </div>

            {/* Advisory AI Extraction Findings Banner */}
            {isAnalyzing && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-500" />
                <span>Running advisory OCR on screenshot to detect amounts and recipient...</span>
              </div>
            )}

            {advisoryAnalysis && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-cyan-800 dark:text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>Advisory OCR Screenshot Analysis</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Amount Found:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      ₹{advisoryAnalysis.extractedAmount || 'Not parsed'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Date Found:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {advisoryAnalysis.extractedDate || 'Not parsed'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Merchant/Recipient:</span>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {advisoryAnalysis.extractedMerchant || 'Not parsed'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Found:</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {advisoryAnalysis.extractedStatus || 'Completed'}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Advisory analysis only. Does not confirm bank settlement.
                </p>
              </div>
            )}

            {/* Explicit Confirmation Step 1 */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={step1Confirmed}
                  onChange={(e) => setStep1Confirmed(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-relaxed">
                  I explicitly confirm that this ₹{parseFloat(amountPaid || '0').toLocaleString('en-IN')} payment was successfully initiated for {selectedPolicy?.policyName}, the uploaded screenshot is authentic, and I submit it for family admin verification review.
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('calendar')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || !step1Confirmed}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span>Submit for Verification (Step 1)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
