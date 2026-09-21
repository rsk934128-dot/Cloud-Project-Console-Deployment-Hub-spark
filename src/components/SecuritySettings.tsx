import React, { useState, useEffect } from 'react';
import {
  Lock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  QrCode,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Laptop,
  Globe,
  Clock,
  LogOut,
  ChevronRight,
  Sparkles,
  Info,
  RefreshCw,
  Hash
} from 'lucide-react';
import { USER_INFO } from '../mockData';

interface SecurityEvent {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'warning';
}

const INITIAL_AUDIT_LOGS: SecurityEvent[] = [
  {
    id: 'evt-1',
    action: 'Console Session Initialized',
    timestamp: 'Just now',
    ip: '198.51.100.24 (Ashburn, VA)',
    device: 'Chrome 122 on macOS Sonoma',
    status: 'success'
  },
  {
    id: 'evt-2',
    action: 'OAuth2 Gmail Alert Scope Granted',
    timestamp: '2 hours ago',
    ip: '198.51.100.24 (Ashburn, VA)',
    device: 'Chrome 122 on macOS Sonoma',
    status: 'success'
  },
  {
    id: 'evt-3',
    action: 'Production Edge Token Deployed',
    timestamp: '1 day ago',
    ip: '52.95.12.8 (Washington, D.C.)',
    device: 'Vercel Deployment CLI v33.0',
    status: 'success'
  }
];

const RECOVERY_CODES_DEFAULT = [
  '8B4F-92A1',
  '4E2C-77D0',
  '19AA-53BC',
  '66E4-91F2',
  '90D3-55EA',
  'e2B4-7119',
  '33F0-88DC',
  '5A8E-4402'
];

export function SecuritySettings() {
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordStatusMessage, setPasswordStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastPasswordUpdated, setLastPasswordUpdated] = useState<string>('42 days ago');

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cloud_console_2fa_enabled');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'recovery'>('qr');
  const [secretKey, setSecretKey] = useState('JBSW-Y3DP-EHPK-3PXP-N65T-LMYQ');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [totpInputCode, setTotpInputCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>(RECOVERY_CODES_DEFAULT);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [twoFAToast, setTwoFAToast] = useState<string | null>(null);

  // Active Sessions State
  const [otherSessionsRevoked, setOtherSessionsRevoked] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Security Audit Log State
  const [auditLogs, setAuditLogs] = useState<SecurityEvent[]>(INITIAL_AUDIT_LOGS);

  // Quick TOTP test sandbox state
  const [simulatedRollingOtp, setSimulatedRollingOtp] = useState('749 201');
  const [otpTestInput, setOtpTestInput] = useState('');
  const [otpTestResult, setOtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Periodic rolling OTP simulation (every 30 seconds)
  useEffect(() => {
    const generateOtp = () => {
      const p1 = Math.floor(100 + Math.random() * 900);
      const p2 = Math.floor(100 + Math.random() * 900);
      return `${p1} ${p2}`;
    };

    const interval = setInterval(() => {
      setSimulatedRollingOtp(generateOtp());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Save 2FA preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cloud_console_2fa_enabled', JSON.stringify(is2FAEnabled));
    } catch (e) {
      console.warn('Failed to save 2FA to local storage', e);
    }
  }, [is2FAEnabled]);

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [hasMinLength, hasUpperCase && hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (!newPassword) return { label: 'Empty', color: 'bg-neutral-800', textColor: 'text-neutral-500' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (strengthScore === 2) return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (strengthScore === 3) return { label: 'Good', color: 'bg-sky-500', textColor: 'text-sky-400' };
    return { label: 'Strong (Production Ready)', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  // Handle Password Submit
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMessage(null);

    if (!currentPassword) {
      setPasswordStatusMessage({ type: 'error', text: 'Please enter your current password to authorize changes.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordStatusMessage({ type: 'error', text: 'New password cannot be identical to current password.' });
      return;
    }

    setPasswordUpdating(true);

    setTimeout(() => {
      setPasswordUpdating(false);
      setPasswordStatusMessage({
        type: 'success',
        text: 'Password updated successfully! All active sessions have been re-keyed.'
      });
      setLastPasswordUpdated('Just now');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Add to audit log
      const newEvent: SecurityEvent = {
        id: `evt-${Date.now()}`,
        action: 'Account Master Password Modified',
        timestamp: 'Just now',
        ip: '198.51.100.24 (Ashburn, VA)',
        device: 'Chrome 122 on macOS Sonoma',
        status: 'success'
      };
      setAuditLogs(prev => [newEvent, ...prev]);
    }, 700);
  };

  // Copy Secret Key
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Copy Recovery Codes
  const handleCopyRecovery = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2000);
  };

  // Start 2FA Setup
  const handleStartSetup = () => {
    setSetupStep('qr');
    setTotpInputCode('');
    setVerificationError(null);
    setIsSetupModalOpen(true);
  };

  // Verify TOTP during setup
  const handleVerifySetupCode = () => {
    const cleaned = totpInputCode.replace(/\s+/g, '');
    if (cleaned.length !== 6 || !/^\d+$/.test(cleaned)) {
      setVerificationError('Please enter a valid 6-digit verification code.');
      return;
    }

    // Accept test codes or any 6-digit numeric simulation
    setVerificationError(null);
    setSetupStep('recovery');
  };

  // Complete 2FA Setup
  const handleCompleteSetup = () => {
    setIs2FAEnabled(true);
    setIsSetupModalOpen(false);
    setTwoFAToast('Two-Factor Authentication is now enabled for your account.');
    setTimeout(() => setTwoFAToast(null), 4000);

    const newEvent: SecurityEvent = {
      id: `evt-${Date.now()}`,
      action: '2FA Authenticator (TOTP) Enabled',
      timestamp: 'Just now',
      ip: '198.51.100.24 (Ashburn, VA)',
      device: 'Chrome 122 on macOS Sonoma',
      status: 'success'
    };
    setAuditLogs(prev => [newEvent, ...prev]);
  };

  // Disable 2FA
  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    setShowDisableConfirm(false);
    setTwoFAToast('Two-Factor Authentication has been disabled.');
    setTimeout(() => setTwoFAToast(null), 4000);

    const newEvent: SecurityEvent = {
      id: `evt-${Date.now()}`,
      action: '2FA Authenticator (TOTP) Deactivated',
      timestamp: 'Just now',
      ip: '198.51.100.24 (Ashburn, VA)',
      device: 'Chrome 122 on macOS Sonoma',
      status: 'warning'
    };
    setAuditLogs(prev => [newEvent, ...prev]);
  };

  // Revoke All Other Sessions
  const handleRevokeOtherSessions = () => {
    setRevokingSessions(true);
    setTimeout(() => {
      setRevokingSessions(false);
      setOtherSessionsRevoked(true);
      const newEvent: SecurityEvent = {
        id: `evt-${Date.now()}`,
        action: 'All Secondary Device Tokens Revoked',
        timestamp: 'Just now',
        ip: '198.51.100.24 (Ashburn, VA)',
        device: 'Chrome 122 on macOS Sonoma',
        status: 'success'
      };
      setAuditLogs(prev => [newEvent, ...prev]);
    }, 600);
  };

  // Test TOTP Sandbox Verification
  const handleTestOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrentOtp = simulatedRollingOtp.replace(/\s+/g, '');
    const cleanInput = otpTestInput.replace(/\s+/g, '');

    if (cleanInput === cleanCurrentOtp || cleanInput === '123456') {
      setOtpTestResult({
        success: true,
        message: 'Valid TOTP token confirmed! Authentication handshake succeeded.'
      });
    } else {
      setOtpTestResult({
        success: false,
        message: `Token invalid or expired. Expected current rolling code: ${simulatedRollingOtp}`
      });
    }
  };

  return (
    <div className="space-y-6" id="settings-security-subsection">
      {/* Subsection Title Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Security & Access Credentials
                {is2FAEnabled ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    ENHANCED PROTECTION
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    SINGLE-FACTOR ONLY
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Manage your account credentials, authenticate secondary devices, toggle two-factor authentication simulation, and review session tokens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
            <span className="text-neutral-400">Account:</span>
            <span className="font-mono text-white bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
              {USER_INFO.email}
            </span>
          </div>
        </div>

        {/* Global Toast Alert */}
        {twoFAToast && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{twoFAToast}</span>
            </div>
            <button 
              onClick={() => setTwoFAToast(null)}
              className="text-neutral-400 hover:text-white text-xs px-1.5 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Grid: 2FA Simulation and Password Update */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Two-Factor Authentication Simulation (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-neutral-400">Time-based One-Time Password (TOTP) RFC 6238</p>
              </div>
            </div>

            {/* Toggle Switch Component */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${is2FAEnabled ? 'text-emerald-400' : 'text-neutral-400'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                id="toggle-2fa-simulation"
                type="button"
                role="switch"
                aria-checked={is2FAEnabled}
                onClick={() => {
                  if (is2FAEnabled) {
                    setShowDisableConfirm(true);
                  } else {
                    handleStartSetup();
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                  is2FAEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2FA State Display */}
          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-emerald-200">
                    Two-Factor Authentication is actively safeguarding your deployments
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Whenever you sign in or deploy production releases via the terminal or console, a 6-digit TOTP code generated by your authenticator app (Google Authenticator, Authy, or 1Password) will be required.
                  </p>
                </div>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-neutral-400">Primary Method</div>
                  <div className="font-medium text-white mt-0.5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    TOTP Authenticator App
                  </div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-neutral-400">Emergency Recovery Codes</div>
                  <div className="font-medium text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {recoveryCodes.length} codes stored safely
                  </div>
                </div>
              </div>

              {/* Live Sandbox TOTP Tester */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Live TOTP Generator Simulation</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    Rolling (30s)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <div>
                    <div className="text-[11px] text-neutral-400">Simulated Authenticator App Output</div>
                    <div className="text-lg font-mono font-bold tracking-widest text-indigo-300 mt-0.5">
                      {simulatedRollingOtp}
                    </div>
                  </div>
                  <button
                    id="btn-use-simulated-otp"
                    type="button"
                    onClick={() => setOtpTestInput(simulatedRollingOtp.replace(/\s+/g, ''))}
                    className="text-xs text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 bg-indigo-950/60 rounded border border-indigo-800/80 transition-colors"
                  >
                    Auto-Fill Test Code
                  </button>
                </div>

                <form onSubmit={handleTestOtpSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-test-totp"
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otpTestInput}
                      onChange={(e) => setOtpTestInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    id="btn-verify-test-totp"
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Test Token
                  </button>
                </form>

                {otpTestResult && (
                  <div className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                    otpTestResult.success 
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  }`}>
                    {otpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{otpTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="btn-view-recovery-codes"
                  type="button"
                  onClick={() => {
                    setSetupStep('recovery');
                    setIsSetupModalOpen(true);
                  }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-neutral-400" />
                  View Recovery Codes
                </button>

                <button
                  id="btn-reconfigure-2fa"
                  type="button"
                  onClick={handleStartSetup}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                  Re-pair Device / Secret
                </button>

                <button
                  id="btn-disable-2fa-prompt"
                  type="button"
                  onClick={() => setShowDisableConfirm(true)}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium rounded-lg border border-rose-900/80 transition-colors ml-auto"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-amber-200">
                    Two-Factor Authentication is currently disabled
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Protect your serverless production workloads from unauthorized access. Enabling 2FA adds an extra layer of verification whenever signing in or modifying deployment environment secrets.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    Setup Authenticator App
                  </div>
                  <div className="text-xs text-neutral-400">
                    Compatible with Google Authenticator, 1Password, Bitwarden, and Apple Keychain.
                  </div>
                </div>

                <button
                  id="btn-enable-2fa-setup"
                  type="button"
                  onClick={handleStartSetup}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Configure 2FA
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Prompt to Disable 2FA */}
          {showDisableConfirm && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-700/80 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Are you sure you want to disable Two-Factor Authentication?
              </div>
              <p className="text-xs text-neutral-300">
                Your account will only be protected by your master password. Any compromised API keys or credentials could allow attackers direct access to your 38 deployment clusters.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-confirm-disable-2fa"
                  type="button"
                  onClick={handleDisable2FA}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Yes, Disable 2FA
                </button>
                <button
                  id="btn-cancel-disable-2fa"
                  type="button"
                  onClick={() => setShowDisableConfirm(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Master Password Update (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Update Password</h4>
                <p className="text-xs text-neutral-400">Last changed: {lastPasswordUpdated}</p>
              </div>
            </div>
          </div>

          {passwordStatusMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn ${
              passwordStatusMessage.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-700 text-rose-200'
            }`}>
              {passwordStatusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{passwordStatusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="input-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 block">
                  New Password
                </label>
                {newPassword && (
                  <span className={`text-[10px] font-semibold ${getStrengthLabel().textColor}`}>
                    {getStrengthLabel().label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="input-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator Bar */}
              {newPassword && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 1 ? getStrengthLabel().color : 'bg-neutral-800'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 2 ? getStrengthLabel().color : 'bg-neutral-800'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 3 ? getStrengthLabel().color : 'bg-neutral-800'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strengthScore >= 4 ? getStrengthLabel().color : 'bg-neutral-800'}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-400 pt-0.5">
                    <span className={hasMinLength ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-500 flex items-center gap-1'}>
                      <span className="w-1 h-1 rounded-full bg-current"></span> 8+ Characters
                    </span>
                    <span className={hasUpperCase && hasLowerCase ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-500 flex items-center gap-1'}>
                      <span className="w-1 h-1 rounded-full bg-current"></span> Upper & Lower Case
                    </span>
                    <span className={hasNumber ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-500 flex items-center gap-1'}>
                      <span className="w-1 h-1 rounded-full bg-current"></span> Contains Number
                    </span>
                    <span className={hasSpecial ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-500 flex items-center gap-1'}>
                      <span className="w-1 h-1 rounded-full bg-current"></span> Special Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-neutral-950 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none pr-9 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-500 focus:border-rose-500'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'border-neutral-800 focus:border-indigo-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] text-rose-400">Passwords do not match.</p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match perfectly.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                id="btn-update-password"
                type="submit"
                disabled={passwordUpdating}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {passwordUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating Credentials...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Update Password
                  </>
                )}
              </button>

              {(currentPassword || newPassword || confirmPassword) && (
                <button
                  id="btn-cancel-password-edit"
                  type="button"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordStatusMessage(null);
                  }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Active Sessions & Security Event Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">Active Device Sessions</h4>
            </div>
            <span className="text-[11px] text-neutral-400">
              {otherSessionsRevoked ? '1 Session' : '3 Sessions Active'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Current Session */}
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-indigo-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-white">Chrome 122 on macOS Sonoma</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CURRENT SESSION
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>IP: 198.51.100.24</span>
                <span>•</span>
                <span>Ashburn, Virginia (US)</span>
                <span>•</span>
                <span className="text-emerald-400">Active Now</span>
              </div>
            </div>

            {/* Other Sessions */}
            {!otherSessionsRevoked ? (
              <>
                <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-200">Vercel Deployment CLI Daemon</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Token: vcl_39a0...</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>IP: 52.95.12.8</span>
                    <span>•</span>
                    <span>Washington, D.C.</span>
                    <span>•</span>
                    <span>Last active 3 hours ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-200">Firefox on Linux Ubuntu (CI Runner)</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Token: gh_run_71</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>IP: 142.250.190.46</span>
                    <span>•</span>
                    <span>Frankfurt, Germany</span>
                    <span>•</span>
                    <span>Last active 2 days ago</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All other device sessions and tokens have been revoked. Only this browser is active.</span>
              </div>
            )}
          </div>

          {!otherSessionsRevoked && (
            <div className="pt-2">
              <button
                id="btn-revoke-other-sessions"
                type="button"
                onClick={handleRevokeOtherSessions}
                disabled={revokingSessions}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                {revokingSessions ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Revoking Tokens...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                    Sign Out & Revoke All Other Devices
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security Audit Log */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">Security Event Log</h4>
            </div>
            <span className="text-[11px] text-neutral-400">Immutable Audit Trail</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {auditLogs.map((evt) => (
              <div 
                key={evt.id}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-white flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${evt.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    {evt.action}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {evt.device} • {evt.ip}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                  {evt.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2FA Setup Interactive Modal */}
      {isSetupModalOpen && (
        <div 
          id="modal-2fa-setup"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Setup Two-Factor Authentication</h3>
                  <p className="text-xs text-neutral-400">Step {setupStep === 'qr' ? '1 of 3' : setupStep === 'verify' ? '2 of 3' : '3 of 3'}</p>
                </div>
              </div>

              <button
                id="btn-close-2fa-modal"
                onClick={() => setIsSetupModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                ✕ Close
              </button>
            </div>

            {/* Step 1: Scan QR or Secret Key */}
            {setupStep === 'qr' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300">
                  Scan this QR code with your authenticator app (Google Authenticator, 1Password, or Authy), or enter the secret key manually.
                </p>

                {/* Simulated QR Code Canvas */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="w-36 h-36 bg-white p-2.5 rounded-lg flex flex-col items-center justify-center shrink-0 shadow-md">
                    {/* Simulated High-Density QR Pattern */}
                    <div className="w-full h-full border-4 border-black grid grid-cols-6 grid-rows-6 gap-0.5 p-1 bg-white">
                      <div className="bg-black col-span-2 row-span-2"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black col-span-2 row-span-2"></div>
                      <div className="bg-transparent col-span-2"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black col-span-2"></div>
                      <div className="bg-black"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-black"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black col-span-2 row-span-2"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-black"></div>
                      <div className="bg-transparent col-span-2"></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs flex-1 w-full">
                    <div className="text-neutral-400">Manual Entry Secret Key:</div>
                    <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 font-mono text-xs text-amber-300 select-all break-all">
                      {secretKey}
                    </div>
                    <button
                      id="btn-copy-secret-key"
                      type="button"
                      onClick={handleCopySecret}
                      className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Copy Secret Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    id="btn-proceed-to-verify"
                    type="button"
                    onClick={() => setSetupStep('verify')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Next: Verify Code
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verify 6-digit TOTP code */}
            {setupStep === 'verify' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300">
                  Enter the 6-digit code currently generated by your authenticator app to confirm correct pairing.
                </p>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">
                      6-Digit Authenticator Code
                    </label>
                    <input
                      id="input-setup-totp"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 749201"
                      value={totpInputCode}
                      onChange={(e) => {
                        setTotpInputCode(e.target.value);
                        setVerificationError(null);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                  </div>

                  {verificationError && (
                    <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
                    <span>Testing this setup?</span>
                    <button
                      id="btn-fill-simulated-code"
                      type="button"
                      onClick={() => setTotpInputCode(simulatedRollingOtp.replace(/\s+/g, ''))}
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Use Simulated Code ({simulatedRollingOtp})
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep('qr')}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors"
                  >
                    Back to QR
                  </button>

                  <button
                    id="btn-verify-setup-code"
                    type="button"
                    onClick={handleVerifySetupCode}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Verify & Continue
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Recovery Codes */}
            {setupStep === 'recovery' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    Save these emergency recovery codes in a secure password manager. If you ever lose your phone or authenticator app, each code can be used once to access your console.
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {recoveryCodes.map((code, idx) => (
                      <div 
                        key={idx}
                        className="p-2 bg-neutral-900 rounded border border-neutral-800 font-mono text-xs text-center text-neutral-200"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <button
                    id="btn-copy-recovery-codes"
                    type="button"
                    onClick={handleCopyRecovery}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedRecovery ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>All 8 Codes Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Copy All Recovery Codes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="btn-complete-2fa-setup"
                    type="button"
                    onClick={handleCompleteSetup}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Activate Two-Factor Authentication
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
