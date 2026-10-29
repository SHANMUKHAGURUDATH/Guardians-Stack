import React from 'react';
import { useApp } from './context/AppContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { PersistentAiAssistant } from './components/ai/PersistentAiAssistant';

// Views
import { AuthView } from './views/AuthView';
import { OverviewView } from './views/OverviewView';
import { FamilyMembersView } from './views/FamilyMembersView';
import { MemberDetailWorkspaceView } from './views/MemberDetailWorkspaceView';
import { InsurancePoliciesView } from './views/InsurancePoliciesView';
import { PolicyDetailView } from './views/PolicyDetailView';
import { AddPolicyUploadView } from './views/AddPolicyUploadView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { MedicalPassportView } from './views/MedicalPassportView';
import { AddMedicalRecordView } from './views/AddMedicalRecordView';
import { CoverageAnalysisView } from './views/CoverageAnalysisView';
import { LifeNeedsFinderView } from './views/LifeNeedsFinderView';
import { FamilyNomineesView } from './views/FamilyNomineesView';
import { PremiumCalendarView } from './views/PremiumCalendarView';
import { RecordPaymentView } from './views/RecordPaymentView';
import { PaymentVerificationView } from './views/PaymentVerificationView';
import { AskAiWorkspaceView } from './views/AskAiWorkspaceView';
import { EmergencySosView } from './views/EmergencySosView';
import { NotificationsView } from './views/NotificationsView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsView } from './views/SettingsView';
import { HelpSupportView } from './views/HelpSupportView';
import { SystemTestsView } from './views/SystemTestsView';

export function App() {
  const { isAuthenticated, activeView } = useApp();

  // If user is not authenticated and not in demo mode, display Auth View
  if (!isAuthenticated) {
    return <AuthView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'family_members':
        return <FamilyMembersView />;
      case 'member_detail':
        return <MemberDetailWorkspaceView />;
      case 'policies':
        return <InsurancePoliciesView />;
      case 'policy_detail':
        return <PolicyDetailView />;
      case 'add_policy':
        return <AddPolicyUploadView />;
      case 'document_vault':
      case 'document_detail':
        return <DocumentVaultView />;
      case 'medical_passport':
        return <MedicalPassportView />;
      case 'add_medical_record':
        return <AddMedicalRecordView />;
      case 'coverage_analysis':
        return <CoverageAnalysisView />;
      case 'needs_finder':
        return <LifeNeedsFinderView />;
      case 'nominees':
        return <FamilyNomineesView />;
      case 'calendar':
      case 'payment_history':
        return <PremiumCalendarView />;
      case 'record_payment':
        return <RecordPaymentView />;
      case 'payment_verification':
        return <PaymentVerificationView />;
      case 'ask_ai':
        return <AskAiWorkspaceView />;
      case 'emergency_sos':
        return <EmergencySosView />;
      case 'notifications':
        return <NotificationsView />;
      case 'audit_log':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      case 'help_support':
        return <HelpSupportView />;
      case 'system_tests':
        return <SystemTestsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <TopNavbar />

      {/* Slide-out Navigation Drawer */}
      <NavigationDrawer />

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {renderActiveView()}
      </main>

      {/* Persistent Bottom-Right (Southeast) AI Assistant */}
      <PersistentAiAssistant />
    </div>
  );
}

export default App;
