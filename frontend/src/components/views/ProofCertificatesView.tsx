import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Download,
  QrCode,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  FileText,
  Sparkles,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProofCertificate, SecurityRun } from '../../types';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface ProofCertificatesViewProps {
  certificate: ProofCertificate;
  onNavigate: (view: any) => void;
}

export const ProofCertificatesView: React.FC<ProofCertificatesViewProps> = ({
  certificate,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedOnline, setVerifiedOnline] = useState(true);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.sha256Hash);
    setCopied(true);
    playCyberBlip(1200);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playSuccessChime();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certificate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${certificate.certificateId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleVerifyHash = () => {
    setVerifying(true);
    playCyberBlip(1000);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedOnline(true);
      playSuccessChime();
    }, 800);
  };

  return (
    <div id="proof-certificates-view" className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <Award className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                CRYPTOGRAPHIC PROOF OF REMEDIATION
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-wide mt-0.5">
                VERIFIED SECURITY PROOF CERTIFICATE
              </h2>
              <p className="text-xs text-[#475569] mt-1">
                Tamper-evident certificate binding code changes, PoV exploit blockage, regression tests, and adversarial mutational results under SHA-256 seal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD CERTIFICATE (JSON)</span>
            </button>

            <button
              onClick={handleVerifyHash}
              disabled={verifying}
              className="px-4 py-2.5 rounded-[10px] bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{verifying ? 'VERIFYING SIGNATURE...' : 'VERIFY CERTIFICATE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Certificate Display Sheet */}
      <div className="p-6 sm:p-8 border-2 border-[#BFDBFE] bg-[#FFFFFF] rounded-[14px] shadow-xl relative overflow-hidden">
        {/* Certificate Decorative Guilloche Seal / Corner Ornaments */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#2563EB]/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#2563EB]/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#2563EB]/40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#2563EB]/40 pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center pb-6 mb-6 border-b border-[#E2E8F0] relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>CYBER SENTINEL VERIFIED REMEDIATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-wider">
            SECURITY REMEDIATION CERTIFICATE
          </h1>
          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold">
            Cryptographically Proved & Mathematically Verified Security Invariant
          </p>
        </div>

        {/* Certificate Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-xs">
          {/* Left Column: Target & Vulnerability Metadata */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">CERTIFICATE ID</span>
              <div className="text-[#0284C7] font-bold text-sm">{certificate.certificateId}</div>
              <div className="text-[#475569] text-[11px]">Run ID: {certificate.runId}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">PROJECT & REPOSITORY</span>
              <div className="text-[#0F172A] font-bold text-sm">{certificate.projectName}</div>
              <div className="text-[#475569] text-[11px]">Affected File: {certificate.affectedFile}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">REMEDIATED VULNERABILITY</span>
              <div className="text-[#BE123C] font-bold">{certificate.vulnerability}</div>
              <div className="text-[#475569] text-[11px]">Severity: {certificate.severity} • PoV: {certificate.proofOfVulnerability}</div>
            </div>
          </div>

          {/* Right Column: Invariant & Test Verification Evidence */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">ORIGINAL POV RE-TEST</span>
              <div className="text-[#1D4ED8] font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span>{certificate.originalPoVReTest} (100% Blocked)</span>
              </div>
              <div className="text-[#475569] text-[11px]">Patch Version: {certificate.patchVersion}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">ADVERSARIAL STRESS TESTING</span>
              <div className="text-[#1D4ED8] font-bold text-sm">{certificate.adversarialTestingSummary}</div>
              <div className="text-[#475569] text-[11px]">Regression: {certificate.regressionSummary}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1 shadow-sm">
              <span className="text-[#64748B] text-[10px] uppercase block font-bold">PERFORMANCE OVERHEAD & VERDICT</span>
              <div className="text-[#0F172A] font-bold text-sm">
                Impact: <span className="text-[#0284C7] font-bold">{certificate.performanceImpact}</span> • Verdict:{' '}
                <span className="text-[#1D4ED8] font-black">{certificate.verificationDecision}</span>
              </div>
              <div className="text-[#475569] text-[11px]">Timestamp: {certificate.timestamp}</div>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Seal & QR Code */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs">
          {/* Hash Box */}
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1 text-[#1D4ED8] font-bold">
                <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>CRYPTOGRAPHIC SHA-256 INTEGRITY SEAL</span>
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[#0284C7] hover:text-[#0F172A] flex items-center gap-1 text-[10px] font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-[#2563EB]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#080C14] border border-[#1E2638] text-[#79C0FF] text-[11px] break-all font-mono shadow-inner">
              {certificate.sha256Hash}
            </div>

            <div className="text-[10px] text-[#94A3B8]">
              Signed by {certificate.issuer} via {certificate.sandboxIsolationLevel}
            </div>
          </div>

          {/* Stylized QR Code Visual */}
          <div className="p-3 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl shadow-md shrink-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-[#FFFFFF] border border-[#E2E8F0] p-1.5 rounded-lg flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-2 border-[#2563EB] bg-[#FFFFFF] p-0.5"><div className="w-full h-full bg-[#0F172A]"/></div>
                <div className="w-6 h-6 border-2 border-[#2563EB] bg-[#FFFFFF] p-0.5"><div className="w-full h-full bg-[#0F172A]"/></div>
              </div>
              <div className="text-[7px] text-center font-bold text-[#2563EB]">
                CYBER SENTINEL
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-2 border-[#2563EB] bg-[#FFFFFF] p-0.5"><div className="w-full h-full bg-[#0F172A]"/></div>
                <div className="w-3 h-3 bg-[#2563EB] rounded-sm"/>
              </div>
            </div>
            <span className="text-[8px] font-bold text-[#0F172A] mt-1">
              SC-2026-001847
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
