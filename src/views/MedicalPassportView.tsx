import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalRecord, MedicalRecordType } from '../types';
import {
  HeartPulse,
  AlertTriangle,
  Pill,
  Activity,
  FileText,
  Calendar,
  User,
  Plus,
  Printer,
  ChevronRight,
  ShieldAlert,
  Hospital,
  Sparkles,
} from 'lucide-react';

export const MedicalPassportView: React.FC = () => {
  const {
    familyMembers,
    medicalRecords,
    documents,
    navigate,
    setSelectedDocId,
    selectedMemberId,
    setSelectedMemberId,
  } = useApp();

  const [currentMemberId, setCurrentMemberId] = useState<string>(
    selectedMemberId || familyMembers[0]?.id || ''
  );

  const activeMember =
    familyMembers.find((m) => m.id === currentMemberId) || familyMembers[0];

  const memberRecords = medicalRecords.filter(
    (m) => m.familyMemberId === activeMember?.id
  );

  const allergies = memberRecords.filter((m) => m.recordType === 'allergy');
  const medications = memberRecords.filter((m) => m.recordType === 'medication');
  const conditions = memberRecords.filter((m) => m.recordType === 'condition');
  const hospitalVisits = memberRecords.filter(
    (m) => m.recordType === 'hospital_visit' || m.recordType === 'discharge_summary'
  );
  const labReports = memberRecords.filter((m) => m.recordType === 'lab_report');
  const procedures = memberRecords.filter((m) => m.recordType === 'procedure');
  const vaccinations = memberRecords.filter((m) => m.recordType === 'vaccination');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Family Medical Passport
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              Verified Clinical Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standardized health passports for doctor consultations and hospital transfers without losing allergy alerts or dosage histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Transfer Summary</span>
          </button>
          <button
            onClick={() => navigate('add_medical_record')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Entry</span>
          </button>
        </div>
      </div>

      {/* Member Selection Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 no-scrollbar">
        {familyMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setCurrentMemberId(m.id);
              setSelectedMemberId(m.id);
            }}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              m.id === activeMember?.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className={`h-6 w-6 rounded-lg bg-gradient-to-tr ${m.avatarColor} text-white flex items-center justify-center text-[10px]`}>
              {m.fullName.slice(0, 2).toUpperCase()}
            </div>
            <span>{m.fullName}</span>
            <span className="text-[10px] opacity-75">({m.bloodGroup})</span>
          </button>
        ))}
      </div>

      {/* Active Member Passport Summary Bar */}
      {activeMember && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${activeMember.avatarColor} text-white flex items-center justify-center text-xl font-black shadow-md`}>
              {activeMember.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeMember.fullName}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeMember.relationship}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Blood Group: <strong className="text-red-500 font-bold">{activeMember.bloodGroup}</strong></span>
                <span>•</span>
                <span>DOB: {activeMember.dateOfBirth}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Primary Emergency Helpline:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {activeMember.emergencyContact.name} ({activeMember.emergencyContact.relationship}) — {activeMember.emergencyContact.phone}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Medical Passport Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Explicit Allergies */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Known Allergies (Documented)
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
              {allergies.length} Flagged
            </span>
          </div>

          {allergies.length === 0 ? (
            <p className="text-xs text-slate-500">
              No allergies explicitly documented in clinical records for {activeMember?.fullName}.
            </p>
          ) : (
            <div className="space-y-3">
              {allergies.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs space-y-1"
                >
                  <div className="font-bold text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
                    <span>{a.title}</span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                      High Alert
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{a.description}</p>
                  <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Facility: {a.clinicianOrFacility || 'Clinical Alert'}</span>
                    <span>Recorded: {a.dateRecorded}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Prescriptions & Medications */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                <Pill className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Current Medications as Documented
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {medications.length} Active
            </span>
          </div>

          {medications.length === 0 ? (
            <p className="text-xs text-slate-500">
              No regular medication prescriptions on file for this member.
            </p>
          ) : (
            <div className="space-y-3">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Prescribed
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{m.description}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>Physician: {m.details.doctorName || 'Attending Physician'}</span>
                    <span>Date: {m.dateRecorded}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Documented Medical Conditions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Documented Chronic Conditions
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {conditions.length} Conditions
            </span>
          </div>

          {conditions.length === 0 ? (
            <p className="text-xs text-slate-500">No chronic medical conditions recorded.</p>
          ) : (
            <div className="space-y-3">
              {conditions.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                  <p className="text-slate-600 dark:text-slate-400">{c.description}</p>
                  {c.details.dischargeAdvice && (
                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 text-[11px] mt-2">
                      {c.details.dischargeAdvice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Hospital Visits & Discharge Summaries */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600">
                <Hospital className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Hospital Admissions & Procedures
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {hospitalVisits.length + procedures.length} Records
            </span>
          </div>

          {hospitalVisits.length + procedures.length === 0 ? (
            <p className="text-xs text-slate-500">No hospital admissions or procedures recorded.</p>
          ) : (
            <div className="space-y-3">
              {[...hospitalVisits, ...procedures].map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{rec.title}</span>
                    <span className="text-[10px] text-slate-400">{rec.dateRecorded}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{rec.description}</p>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 pt-1">
                    Facility: {rec.clinicianOrFacility || 'Apollo Hospitals'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
