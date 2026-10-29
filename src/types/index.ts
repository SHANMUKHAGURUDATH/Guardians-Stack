export type Language = 'en' | 'te' | 'hi';

export type UserRole = 'family_admin' | 'authorized_member' | 'viewer';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  preferredLanguage: Language;
  createdAt: string;
}

export type RelationshipType =
  | 'Self'
  | 'Spouse'
  | 'Father'
  | 'Mother'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Father-in-law'
  | 'Mother-in-law'
  | 'Other';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  relationship: RelationshipType;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  avatarColor: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  emergencyContact: EmergencyContact;
  preferredLanguage?: Language;
  notes?: string;
  createdAt: string;
  isDemo?: boolean;
}

export type PolicyCategory =
  | 'life'
  | 'health'
  | 'accident'
  | 'banking'
  | 'government'
  | 'group'
  | 'other';

export type PolicyExtractionStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'needs_review'
  | 'confirmed'
  | 'failed'
  | 'archived';

export type PolicyVerificationStatus =
  | 'unverified'
  | 'user_confirmed'
  | 'active_verified';

export interface PolicyNominee {
  name: string;
  relationship: string;
  sharePercentage: number;
  verified: boolean;
  dateVerified?: string;
  sourceDocId?: string;
}

export interface ExtractedFieldEvidence {
  value: any;
  page?: number | null;
  evidenceSnippet?: string | null;
  confidence: number;
}

export interface InsurancePolicy {
  id: string;
  familyMemberId: string;
  insurerName: string;
  policyName: string;
  policyNumber: string;
  maskedNumber: string;
  category: PolicyCategory;
  policyholderName: string;
  insuredMemberName: string;
  sumAssured: number;
  premiumAmount: number;
  currency: 'INR' | 'USD' | 'EUR';
  premiumFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  nextDueDate: string;
  policyStartDate: string;
  policyEndDate?: string;
  gracePeriodDays: number;
  waitingPeriodText?: string;
  exclusions: string[];
  nominees: PolicyNominee[];
  claimContact: {
    helplinePhone?: string;
    email?: string;
    cashlessTPA?: string;
    portalUrl?: string;
  };
  sourceDocumentId?: string;
  extractionStatus: PolicyExtractionStatus;
  verificationStatus: PolicyVerificationStatus;
  extractedEvidence?: Record<string, ExtractedFieldEvidence>;
  notes?: string;
  createdAt: string;
  isDemo?: boolean;
}

export type DocumentCategory = 'insurance' | 'medical' | 'identity' | 'other';

export type DocumentSubcategory =
  | 'life_insurance'
  | 'health_insurance'
  | 'accident_insurance'
  | 'bank_insurance'
  | 'govt_scheme'
  | 'group_insurance'
  | 'prescription'
  | 'lab_report'
  | 'scan_report'
  | 'discharge_summary'
  | 'consultation'
  | 'vaccination'
  | 'allergy_record'
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving_licence'
  | 'other_identity'
  | 'family_legal'
  | 'financial_tax'
  | 'miscellaneous';

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface DocumentRecord {
  id: string;
  familyMemberId: string;
  title: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  sha256Hash: string;
  calculatedHash?: string;
  integrityVerified: boolean;
  category: DocumentCategory;
  subcategory: DocumentSubcategory;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'ready' | 'flagged' | 'failed';
  extractedText: string;
  pages: DocumentPage[];
  maskedIdentifierPreview?: string;
  notes?: string;
  dataUrl?: string;
  isDemo?: boolean;
}

export type MedicalRecordType =
  | 'allergy'
  | 'medication'
  | 'condition'
  | 'hospital_visit'
  | 'discharge_summary'
  | 'lab_report'
  | 'procedure'
  | 'vaccination';

export interface MedicalRecord {
  id: string;
  familyMemberId: string;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  dateRecorded: string;
  clinicianOrFacility?: string;
  sourceDocumentId?: string;
  sourcePage?: number;
  isUserEntered: boolean;
  verified: boolean;
  details: {
    severity?: string;
    reaction?: string;
    dosage?: string;
    frequency?: string;
    prescribedDate?: string;
    isActive?: boolean;
    testName?: string;
    resultValue?: string;
    normalRange?: string;
    unit?: string;
    doctorName?: string;
    dischargeAdvice?: string;
  };
  isDemo?: boolean;
}

export interface NomineeRecord {
  id: string;
  familyMemberId: string;
  policyId: string;
  policyName: string;
  nomineeName: string;
  relationship: string;
  sharePercentage: number;
  dateLastVerified: string;
  sourceDocumentId?: string;
  verified: boolean;
  isDemo?: boolean;
}

export interface PremiumSchedule {
  id: string;
  policyId: string;
  familyMemberId: string;
  insurerName: string;
  policyName: string;
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  nextDueDate: string;
  gracePeriodDays: number;
  reminderDaysBefore: number[];
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid_pending_verification' | 'verified';
  isDemo?: boolean;
}

export type PaymentVerificationStatus =
  | 'not_paid'
  | 'evidence_required'
  | 'evidence_submitted'
  | 'awaiting_verification'
  | 'verified_by_reviewer'
  | 'rejected'
  | 'needs_resubmission'
  | 'disputed';

export interface PaymentEvidenceFile {
  name: string;
  size: number;
  sha256: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface AdvisoryAiPaymentAnalysis {
  extractedAmount?: number | null;
  extractedDate?: string | null;
  extractedMerchant?: string | null;
  extractedTransactionRef?: string | null;
  extractedStatus?: string | null;
  amountMatchesExpected?: boolean;
  mismatchWarnings: string[];
  confidenceScore: number;
  analysisNotes?: string;
}

export interface PaymentRecord {
  id: string;
  scheduleId: string;
  policyId: string;
  familyMemberId: string;
  policyName: string;
  insurerName: string;
  amountPaid: number;
  currency: 'INR' | 'USD' | 'EUR';
  paymentDate: string;
  paymentMethod: string;
  transactionRef?: string;
  evidenceFile?: PaymentEvidenceFile;
  advisoryAiAnalysis?: AdvisoryAiPaymentAnalysis;
  verificationStatus: PaymentVerificationStatus;
  userConfirmation: {
    confirmed: boolean;
    confirmedAt?: string;
    confirmedByEmail?: string;
  };
  reviewerDecision?: {
    reviewerEmail: string;
    decision: 'approved' | 'rejected';
    timestamp: string;
    notes?: string;
  };
  rejectionReason?: string;
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
  isDemo?: boolean;
}

export interface NotificationItem {
  id: string;
  type:
    | 'upcoming_premium'
    | 'premium_overdue'
    | 'evidence_required'
    | 'awaiting_verification'
    | 'payment_verified'
    | 'payment_rejected'
    | 'policy_renewal'
    | 'document_processed'
    | 'security_alert';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  relatedEntity?: {
    type: 'policy' | 'document' | 'payment' | 'member';
    id: string;
  };
  targetView: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  targetEntity: string;
  ipOrLocation: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface HospitalLocation {
  name: string;
  address: string;
  phone: string;
  emergencyHelpline: string;
  type: string;
  tpaCashless: string[];
  hasCardiologyICU: boolean;
  distanceKm: number;
  mapsUrl: string;
}
