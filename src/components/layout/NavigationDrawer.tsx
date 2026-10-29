import React, { useEffect } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { GuardianShieldLogo } from '../brand/GuardianShieldLogo';
import {
  X,
  LayoutDashboard,
  Users,
  Shield,
  FilePlus,
  HeartPulse,
  PieChart,
  UserCheck,
  Calendar,
  CheckCircle2,
  FolderLock,
  Bot,
  AlertTriangle,
  Bell,
  Activity,
  Settings,
  HelpCircle,
  FlaskConical,
  Calculator,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    activeView,
    navigate,
    notifications,
    payments,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingVerificationCount = payments.filter((p) => p.verificationStatus === 'awaiting_verification').length;

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  const navGroups: NavGroup[] = [
    {
      groupName: 'Core Navigation',
      items: [
        { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
        { id: 'family_members', label: '2. Family Members', icon: Users },
        { id: 'policies', label: '3. Insurance Policies', icon: Shield },
        { id: 'add_policy', label: '4. Add Policy / Upload Docs', icon: FilePlus },
      ],
    },
    {
      groupName: 'Medical & Protection',
      items: [
        { id: 'medical_passport', label: '5. Medical Passport', icon: HeartPulse },
        { id: 'coverage_analysis', label: '6. Coverage Analysis', icon: PieChart },
        { id: 'needs_finder', label: 'Life Needs Finder (HLV)', icon: Calculator },
        { id: 'nominees', label: '7. Family Nominees', icon: UserCheck },
      ],
    },
    {
      groupName: 'Payments & Vault',
      items: [
        { id: 'calendar', label: '8. Premium Calendar', icon: Calendar },
        {
          id: 'payment_verification',
          label: '9. Payment Verification',
          icon: CheckCircle2,
          badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
        },
        { id: 'document_vault', label: '10. Documents Vault', icon: FolderLock },
      ],
    },
    {
      groupName: 'Intelligence & Readiness',
      items: [
        { id: 'ask_ai', label: '11. Ask AI (Direct Lookup)', icon: Bot },
        {
          id: 'emergency_sos',
          label: '12. Emergency Mode (SOS)',
          icon: AlertTriangle,
          highlight: true,
        },
      ],
    },
    {
      groupName: 'System & Security',
      items: [
        {
          id: 'notifications',
          label: '13. Notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { id: 'audit_log', label: '14. Activity & Security Log', icon: Activity },
        { id: 'settings', label: '15. Settings', icon: Settings },
        { id: 'help_support', label: '16. Help and Support', icon: HelpCircle },
        { id: 'system_tests', label: 'System & Security Tests', icon: FlaskConical },
      ],
    },
  ];

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <aside
          className="w-80 max-w-[85vw] bg-white dark:bg-[#0E1322] border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-250 ease-out"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <GuardianShieldLogo size={32} showTagline={true} />
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.groupName}
                </div>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          item.highlight
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : isActive
                            ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              item.highlight
                                ? 'text-red-500'
                                : isActive
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-slate-400 dark:text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-teal-500 text-white shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer Info */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0E1A] text-[11px] text-slate-500 flex items-center justify-between">
            <span>Guardian Stack v1.0</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Encrypted Vault
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};
