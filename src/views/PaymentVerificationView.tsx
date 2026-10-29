import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord } from '../types';
import { formatCurrency } from '../utils/crypto';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Shield,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

export const PaymentVerificationView: React.FC = () => {
  const {
    payments,
    familyMembers,
    verifyPaymentDecision,
    navigate,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [rejectionModalPayment, setRejectionModalPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingPayments = payments.filter((p) => p.verificationStatus === 'awaiting_verification');
  const verifiedPayments = payments.filter((p) => p.verificationStatus === 'verified_by_reviewer');
  const rejectedPayments = payments.filter((p) => p.verificationStatus === 'rejected');

  const displayedList =
    activeTab === 'pending'
      ? pendingPayments
      : activeTab === 'verified'
      ? verifiedPayments
      : rejectedPayments;

  const handleApprove = (paymentId: string) => {
    verifyPaymentDecision(
      paymentId,
      'approved',
      reviewerNotes || 'Verified against bank transaction proof & policy schedule by Family Administrator.'
    );
    setSelectedPayment(null);
    setReviewerNotes('');
  };

  const handleReject = () => {
    if (!rejectionModalPayment || !rejectionReason.trim()) return;
    verifyPaymentDecision(rejectionModalPayment.id, 'rejected', rejectionReason.trim());
    setRejectionModalPayment(null);
    setRejectionReason('');
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Two-Step Payment Verification Desk
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
              Step 2 Review
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized administrator inspection of uploaded payment evidence, transaction references, and SHA-256 hashes.
          </p>
        </div>

        <button
          onClick={() => navigate('record_payment')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer"
        >
          <span>Record New Payment (Step 1)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Awaiting Verification ({pendingPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verified')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'verified'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Verified Payments ({verifiedPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected / Disputed ({rejectedPayments.length})</span>
        </button>
      </div>

      {/* Main Inspection List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800">
            <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No payments in this queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'pending'
                ? 'All submitted premium obligations have been reviewed and verified.'
                : 'No records matching this status.'}
            </p>
          </div>
        ) : (
          displayedList.map((payment) => {
            const member = familyMembers.find((m) => m.id === payment.familyMemberId);

            return (
              <div
                key={payment.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {payment.insurerName}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {payment.policyName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Submitted by: {payment.userConfirmation.confirmedByEmail}</span>
                      <span>•</span>
                      <span>Member: {member?.fullName}</span>
                      <span>•</span>
                      <span>Date: {payment.paymentDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(payment.amountPaid, payment.currency)}
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {payment.paymentMethod}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        payment.verificationStatus === 'verified_by_reviewer'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : payment.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {payment.verificationStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Side-by-side Evidence Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Transaction Evidence Details */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Transaction Proof File</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Ref: {payment.transactionRef || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div className="truncate flex-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {payment.evidenceFile?.name || 'Evidence Screenshot'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          SHA256: {payment.evidenceFile?.sha256}
                        </div>
                      </div>
                    </div>

                    {/* Advisory OCR Findings */}
                    {payment.advisoryAiAnalysis && (
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] space-y-1">
                        <div className="font-bold text-cyan-800 dark:text-cyan-300">
                          Advisory OCR Extraction:
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          • Amount Detected: ₹{payment.advisoryAiAnalysis.extractedAmount || 'N/A'}<br />
                          • Recipient Detected: {payment.advisoryAiAnalysis.extractedMerchant || 'N/A'}<br />
                          • Status Detected: {payment.advisoryAiAnalysis.extractedStatus || 'Completed'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Reviewer Audit Trail */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white mb-2">
                        Audit Trail & Verification Log
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        {payment.auditHistory.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                              <span>{item.action}</span>
                              <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {item.note && (
                              <p className="text-slate-500 text-[10px] mt-0.5">{item.note}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {payment.rejectionReason && (
                        <div className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium">
                          <strong>Rejection Reason:</strong> {payment.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Review Actions if Pending */}
                    {payment.verificationStatus === 'awaiting_verification' && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRejectionModalPayment(payment)}
                          className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Reject Submission
                        </button>
                        <button
                          onClick={() => handleApprove(payment.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Verify (Step 2)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModalPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Reject Payment Submission
            </h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason why this payment evidence cannot be verified (e.g. blurred screenshot, amount mismatch, wrong policy number).
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Screenshot amount (₹18,500) does not match policy annual premium (₹24,500). Please re-upload correct bank statement."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRejectionModalPayment(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
