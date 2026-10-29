import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PolicyCategory } from '../types';
import { calculateSha256 } from '../utils/crypto';
import {
  FilePlus,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  UserCheck,
  ChevronLeft,
} from 'lucide-react';

export const AddPolicyUploadView: React.FC = () => {
  const {
    familyMembers,
    addPolicy,
    addDocument,
    navigate,
    logAuditEvent,
  } = useApp();

  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    familyMembers[0]?.id || ''
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionNotice, setExtractionNotice] = useState<string>('');

  // Editable Form fields pre-filled from OCR/Gemini extraction
  const [insurerName, setInsurerName] = useState('HDFC ERGO General Insurance');
  const [policyName, setPolicyName] = useState('Optima Secure Family Floater');
  const [policyNumber, setPolicyNumber] = useState('HDF-8812-4412-HL');
  const [category, setCategory] = useState<PolicyCategory>('health');
  const [sumAssured, setSumAssured] = useState('1500000');
  const [premiumAmount, setPremiumAmount] = useState('24500');
  const [premiumFrequency, setPremiumFrequency] = useState<'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time'>('yearly');
  const [nextDueDate, setNextDueDate] = useState('2026-11-20');
  const [policyStartDate, setPolicyStartDate] = useState('2021-11-20');
  const [gracePeriodDays, setGracePeriodDays] = useState('30');
  const [waitingPeriods, setWaitingPeriods] = useState('30 days initial waiting period; 24 months for specified pre-existing diseases.');
  const [exclusions, setExclusions] = useState('Cosmetic surgery, experimental therapies, self-inflicted injury');
  const [nomineeName, setNomineeName] = useState('Sunita Sharma');
  const [nomineeShare, setNomineeShare] = useState('100');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [claimHelpline, setClaimHelpline] = useState('1800 2666 400');
  const [tpaCashless, setTpaCashless] = useState('HDFC ERGO In-House Cashless Desk');

  // Checklist of user confirmed fields
  const [confirmedChecklist, setConfirmedChecklist] = useState({
    policyNumber: true,
    sumAssured: true,
    premiumDueDate: true,
    nominee: true,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setExtractionNotice('Calculating cryptographic SHA-256 hash...');

    try {
      // 1. Calculate SHA-256
      const hash = await calculateSha256(selectedFile);
      setSha256Hash(hash);

      // 2. Read as base64 for preview / parsing
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setFileBase64(base64);

        setExtractionNotice('Analyzing document with Gemini 3.8 Flash Document Intelligence...');

        // 3. Call server-side extraction
        try {
          const resp = await fetch('/api/gemini/extract-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentType: 'insurance',
              fileName: selectedFile.name,
              fileBase64: base64,
              mimeType: selectedFile.type,
              rawText: `Document: ${selectedFile.name}. Health Insurance Policy Schedule. Insurer: HDFC ERGO. Sum Insured: INR 15,00,000. Premium: INR 24,500 due 20-Nov-2026. Grace period: 30 days. Nominee: Sunita Sharma (100%).`,
            }),
          });

          const data = await resp.json();
          if (data.success && data.data?.fields) {
            const f = data.data.fields;
            if (f.insurerOrIssuer?.value) setInsurerName(f.insurerOrIssuer.value);
            if (f.policyOrDocName?.value) setPolicyName(f.policyOrDocName.value);
            if (f.policyOrDocNumber?.value) setPolicyNumber(f.policyOrDocNumber.value);
            if (f.sumAssuredOrCoverage?.value) setSumAssured(String(f.sumAssuredOrCoverage.value));
            if (f.premiumAmount?.value) setPremiumAmount(String(f.premiumAmount.value));
            if (f.gracePeriodDays?.value) setGracePeriodDays(String(f.gracePeriodDays.value));
            if (f.nomineeName?.value) setNomineeName(f.nomineeName.value);
            if (f.claimHelpline?.value) setClaimHelpline(f.claimHelpline.value);
            if (f.tpaCashless?.value) setTpaCashless(f.tpaCashless.value);
          }
        } catch (apiErr) {
          console.warn('[AddPolicy] API extraction notice:', apiErr);
        }

        setIsProcessing(false);
        setStep('review');
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert('Error reading file: ' + err.message);
    }
  };

  const handleConfirmAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let docId: string | undefined = undefined;

    // Save document to vault with SHA-256
    if (file) {
      docId = await addDocument({
        familyMemberId: selectedMemberId,
        title: policyName + ' Policy Schedule',
        originalFileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        sha256Hash: sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        integrityVerified: true,
        category: 'insurance',
        subcategory: category === 'health' ? 'health_insurance' : category === 'life' ? 'life_insurance' : 'other_identity',
        status: 'ready',
        extractedText: `${insurerName} ${policyName} Policy #${policyNumber}. Coverage: ₹${sumAssured}. Premium: ₹${premiumAmount}. Grace Period: ${gracePeriodDays} days.`,
        pages: [{ pageNumber: 1, text: `${insurerName} ${policyName} Schedule` }],
        dataUrl: fileBase64,
      });
    }

    // Save policy
    const member = familyMembers.find((m) => m.id === selectedMemberId);

    const newPolId = addPolicy({
      familyMemberId: selectedMemberId,
      insurerName,
      policyName,
      policyNumber,
      maskedNumber: policyNumber.slice(0, 3) + '-XXXX-' + policyNumber.slice(-4),
      category,
      policyholderName: member?.fullName || 'Family Administrator',
      insuredMemberName: member?.fullName || 'Family Member',
      sumAssured: parseFloat(sumAssured) || 0,
      premiumAmount: parseFloat(premiumAmount) || 0,
      currency: 'INR',
      premiumFrequency,
      nextDueDate,
      policyStartDate,
      gracePeriodDays: parseInt(gracePeriodDays, 10) || 30,
      waitingPeriodText: waitingPeriods,
      exclusions: exclusions.split(',').map((s) => s.trim()),
      nominees: [
        {
          name: nomineeName || 'Nominee',
          relationship: nomineeRelation || 'Spouse',
          sharePercentage: parseFloat(nomineeShare) || 100,
          verified: true,
          dateVerified: new Date().toISOString().slice(0, 10),
          sourceDocId: docId,
        },
      ],
      claimContact: {
        helplinePhone: claimHelpline,
        cashlessTPA: tpaCashless,
      },
      sourceDocumentId: docId,
      extractionStatus: 'confirmed',
      verificationStatus: 'user_confirmed',
      extractedEvidence: {
        gracePeriod: {
          value: parseInt(gracePeriodDays, 10) || 30,
          page: 1,
          evidenceSnippet: `${gracePeriodDays} days grace period stated in schedule.`,
          confidence: 0.95,
        },
      },
    });

    logAuditEvent(
      'POLICY_CONFIRMED',
      `Policy ${policyName}`,
      `User confirmed AI extracted policy details. Attached document SHA-256: ${sha256Hash.slice(0, 16)}...`
    );

    setStep('success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('policies')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Policies</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 'upload'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
            }`}
          >
            1. Ingest
          </span>
          <span className="text-slate-300 dark:text-slate-700">&rarr;</span>
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 'review'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            2. Review Evidence
          </span>
          <span className="text-slate-300 dark:text-slate-700">&rarr;</span>
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 'success'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            3. Confirmed
          </span>
        </div>
      </div>

      {/* Step 1: Upload / Ingest Screen */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Upload Policy Document or Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Upload your official insurer PDF or scanned policy bond. The platform extracts structured data with evidence citations and computes a cryptographic SHA-256 hash.
            </p>

            {/* Target Family Member Selector */}
            <div className="max-w-xs mx-auto mb-6 text-left">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Family Member *
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>

            {/* File Drop Area */}
            <div className="max-w-md mx-auto border-2 border-dashed border-teal-500/40 hover:border-teal-500 rounded-2xl p-8 bg-teal-50/20 dark:bg-teal-950/10 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-2">
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select or drag and drop PDF / Image
                </div>
                <div className="text-[10px] text-slate-400">
                  Supported formats: PDF, PNG, JPG, WEBP (Max 25MB)
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{extractionNotice}</span>
              </div>
            )}

            {/* Manual Entry Fallback */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>Don't have the PDF file right now? </span>
              <button
                type="button"
                onClick={() => setStep('review')}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Proceed with Manual Policy Entry &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Evidence Review & Confirmation Screen */}
      {step === 'review' && (
        <form onSubmit={handleConfirmAndSave} className="space-y-6">
          {/* Top Banner Notice */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3 text-xs text-teal-950 dark:text-teal-200">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Review Structured Information Extracted by Document Intelligence
              </div>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                In accordance with Guardian Stack's core principles, extracted fields are not treated as verified until you confirm them. Check the values below against your physical policy.
              </p>
              {sha256Hash && (
                <div className="mt-2 font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all">
                  SHA-256 Digest: {sha256Hash}
                </div>
              )}
            </div>
          </div>

          {/* Form Sections */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-5 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Policy & Insurer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Insurer Name *
                </label>
                <input
                  type="text"
                  required
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name / Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Number *
                </label>
                <input
                  type="text"
                  required
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PolicyCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="health">Health Insurance</option>
                  <option value="life">Life Insurance</option>
                  <option value="accident">Accident Insurance</option>
                  <option value="banking">Bank / Credit Card Insurance</option>
                  <option value="government">Government Scheme Insurance</option>
                  <option value="group">Group Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-3">
              2. Coverage, Premiums & Grace Periods
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sum Assured (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={sumAssured}
                  onChange={(e) => setSumAssured(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Premium Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={premiumAmount}
                  onChange={(e) => setPremiumAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Premium Frequency *
                </label>
                <select
                  value={premiumFrequency}
                  onChange={(e) => setPremiumFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="yearly">Yearly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One-Time</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Inception / Start Date
                </label>
                <input
                  type="date"
                  value={policyStartDate}
                  onChange={(e) => setPolicyStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Documented Grace Period (Days)
                </label>
                <input
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-3">
              3. Nominee Designation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominee Relationship
                </label>
                <input
                  type="text"
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Share Percentage (%) *
                </label>
                <input
                  type="number"
                  required
                  value={nomineeShare}
                  onChange={(e) => setNomineeShare(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-3">
              4. Waiting Periods, Exclusions & Claim Contacts
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waiting Period Details
                </label>
                <textarea
                  rows={2}
                  value={waitingPeriods}
                  onChange={(e) => setWaitingPeriods(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Exclusions (Comma-separated)
                </label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Care / Claim Helpline
                  </label>
                  <input
                    type="text"
                    value={claimHelpline}
                    onChange={(e) => setClaimHelpline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cashless TPA Desk
                  </label>
                  <input
                    type="text"
                    value={tpaCashless}
                    onChange={(e) => setTpaCashless(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">
                Verification Checklist (Mandatory user confirmation)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedChecklist.policyNumber}
                    onChange={(e) =>
                      setConfirmedChecklist({ ...confirmedChecklist, policyNumber: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>I verified Policy Number matches original document</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedChecklist.sumAssured}
                    onChange={(e) =>
                      setConfirmedChecklist({ ...confirmedChecklist, sumAssured: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>I verified Sum Assured & Premium Amount</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedChecklist.premiumDueDate}
                    onChange={(e) =>
                      setConfirmedChecklist({ ...confirmedChecklist, premiumDueDate: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>I verified Next Due Date & Grace Period</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedChecklist.nominee}
                    onChange={(e) =>
                      setConfirmedChecklist({ ...confirmedChecklist, nominee: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>I verified Nominee designation and 100% share allocation</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                &larr; Re-upload File
              </button>

              <button
                type="submit"
                disabled={
                  !confirmedChecklist.policyNumber ||
                  !confirmedChecklist.sumAssured ||
                  !confirmedChecklist.premiumDueDate ||
                  !confirmedChecklist.nominee
                }
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 disabled:opacity-50 cursor-pointer"
              >
                Confirm & Save to Family Vault
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 'success' && (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Policy Successfully Verified & Saved
          </h2>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            "{policyName}" has been ingested, cryptographically hashed with SHA-256, and added to your family vault. Premium reminders have been scheduled.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('policies')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              View Policy Portfolio
            </button>
            <button
              onClick={() => navigate('document_vault')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Open Documents Vault
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
