import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalRecordType } from '../types';
import {
  HeartPulse,
  Plus,
  AlertTriangle,
  FileText,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export const AddMedicalRecordView: React.FC = () => {
  const {
    familyMembers,
    addMedicalRecord,
    navigate,
    selectedMemberId,
  } = useApp();

  const [memberId, setMemberId] = useState<string>(
    selectedMemberId || familyMembers[0]?.id || ''
  );
  const [recordType, setRecordType] = useState<MedicalRecordType>('allergy');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateRecorded, setDateRecorded] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [clinicianOrFacility, setClinicianOrFacility] = useState('');
  const [severity, setSeverity] = useState('High');
  const [doctorName, setDoctorName] = useState('');
  const [dosage, setDosage] = useState('');
  const [advice, setAdvice] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !memberId) return;

    addMedicalRecord({
      familyMemberId: memberId,
      recordType,
      title: title.trim(),
      description: description.trim(),
      dateRecorded,
      clinicianOrFacility: clinicianOrFacility.trim(),
      isUserEntered: true,
      verified: true,
      details: {
        severity: recordType === 'allergy' ? severity : undefined,
        doctorName: doctorName.trim() || undefined,
        dosage: recordType === 'medication' ? dosage.trim() : undefined,
        dischargeAdvice: advice.trim() || undefined,
        isActive: true,
      },
    });

    setIsSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('medical_passport')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Medical Passport</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Clinical Entry</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Add Medical Passport Record
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Document allergies, prescribed medications, diagnostic reports, or hospital admissions.
          </p>
        </div>

        {isSaved ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Medical Record Saved
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The entry has been added to the family member's Medical Passport and emergency transfer compilation.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsSaved(false);
                  setTitle('');
                  setDescription('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
              >
                Add Another
              </button>
              <button
                onClick={() => navigate('medical_passport')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                View Medical Passport
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Member *
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Record Category *
                </label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as MedicalRecordType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="allergy">Allergy Alert (Penicillin, Food, etc.)</option>
                  <option value="medication">Current Medication / Prescription</option>
                  <option value="condition">Chronic Medical Condition</option>
                  <option value="hospital_visit">Hospital Visit / Admission</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="lab_report">Diagnostic / Lab Report</option>
                  <option value="procedure">Surgery / Clinical Procedure</option>
                  <option value="vaccination">Vaccination Record</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Record Title / Condition / Drug Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Penicillin Allergy or Telmisartan 40mg"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>

            {recordType === 'medication' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dosage & Regimen
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg twice daily after meals"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {recordType === 'allergy' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Allergy Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="Critical / Anaphylaxis Risk">Critical / Anaphylaxis Risk</option>
                  <option value="Moderate">Moderate (Rash, Swelling)</option>
                  <option value="Mild">Mild</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Description & Observations *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the diagnosis, symptoms observed, or treatment protocol..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Documented
                </label>
                <input
                  type="date"
                  value={dateRecorded}
                  onChange={(e) => setDateRecorded(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Treating Clinician / Doctor
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. S. K. Gupta"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hospital / Clinical Center
                </label>
                <input
                  type="text"
                  value={clinicianOrFacility}
                  onChange={(e) => setClinicianOrFacility(e.target.value)}
                  placeholder="e.g. Apollo Hospitals"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discharge Advice / Emergency Clinical Notes
              </label>
              <textarea
                rows={2}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="e.g. Carry emergency EpiPen at all times; avoid Beta-Lactam antibiotics."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate('medical_passport')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 cursor-pointer"
              >
                Save to Medical Passport
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
