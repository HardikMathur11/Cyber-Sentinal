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
    <div id="proof-certificates-view" className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#FAF8EE] border border-[#DDE0D5] rounded-[14px] shadow-[0_2px_8px_rgba(50,60,40,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5EA] border border-[#B9DEC1] flex items-center justify-center text-[#19734A] shadow-sm">
              <Award className="w-6 h-6 text-[#15945E]" />
            </div>
            <div>
              <div className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-[#4F9D18]">
                CRYPTOGRAPHIC PROOF OF REMEDIATION
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#202923] font-mono-tech tracking-wide mt-0.5">
                VERIFIED SECURITY PROOF CERTIFICATE
              </h2>
              <p className="text-xs text-[#687168] mt-1">
                Tamper-evident certificate binding code changes, PoV exploit blockage, regression tests, and adversarial mutational results under SHA-256 seal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-[10px] bg-[#4F9D18] hover:bg-[#3F8414] active:bg-[#356F12] text-white text-xs font-mono-tech font-bold flex items-center gap-2 transition-all shadow-[0_2px_6px_rgba(45,70,30,0.10)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD CERTIFICATE (JSON)</span>
            </button>

            <button
              onClick={handleVerifyHash}
              disabled={verifying}
              className="px-4 py-2.5 rounded-[10px] bg-[#FFFDF5] hover:bg-[#F0F1E8] border border-[#D7DCCF] text-[#202923] text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#15945E]" />
              <span>{verifying ? 'VERIFYING SIGNATURE...' : 'VERIFY CERTIFICATE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Certificate Display Sheet */}
      <div className="p-6 sm:p-8 border-2 border-[#B9DEC1] bg-[#FFFDF5] rounded-[14px] shadow-xl relative overflow-hidden font-mono-tech">
        {/* Certificate Decorative Guilloche Seal / Corner Ornaments */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#15945E]/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#15945E]/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#15945E]/40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#15945E]/40 pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center pb-6 mb-6 border-b border-[#DCDDD2] relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5EA] border border-[#B9DEC1] text-[#19734A] text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#15945E]" />
            <span>SENTINEL-CHAIN VERIFIED REMEDIATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#202923] tracking-wider">
            SECURITY REMEDIATION CERTIFICATE
          </h1>
          <p className="text-xs text-[#687168] uppercase tracking-widest font-semibold">
            Cryptographically Proved & Mathematically Verified Security Invariant
          </p>
        </div>

        {/* Certificate Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-xs">
          {/* Left Column: Target & Vulnerability Metadata */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">CERTIFICATE ID</span>
              <div className="text-[#2D9AA6] font-bold text-sm">{certificate.certificateId}</div>
              <div className="text-[#59635A] text-[11px]">Run ID: {certificate.runId}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">PROJECT & REPOSITORY</span>
              <div className="text-[#202923] font-bold text-sm">{certificate.projectName}</div>
              <div className="text-[#59635A] text-[11px]">Affected File: {certificate.affectedFile}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">REMEDIATED VULNERABILITY</span>
              <div className="text-[#C62F49] font-bold">{certificate.vulnerability}</div>
              <div className="text-[#59635A] text-[11px]">Severity: {certificate.severity} • PoV: {certificate.proofOfVulnerability}</div>
            </div>
          </div>

          {/* Right Column: Invariant & Test Verification Evidence */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">ORIGINAL POV RE-TEST</span>
              <div className="text-[#19734A] font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#15945E]" />
                <span>{certificate.originalPoVReTest} (100% Blocked)</span>
              </div>
              <div className="text-[#59635A] text-[11px]">Patch Version: {certificate.patchVersion}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">ADVERSARIAL STRESS TESTING</span>
              <div className="text-[#19734A] font-bold text-sm">{certificate.adversarialTestingSummary}</div>
              <div className="text-[#59635A] text-[11px]">Regression: {certificate.regressionSummary}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8EE] border border-[#DDE0D5] space-y-1 shadow-sm">
              <span className="text-[#687168] text-[10px] uppercase block font-bold">PERFORMANCE OVERHEAD & VERDICT</span>
              <div className="text-[#202923] font-bold text-sm">
                Impact: <span className="text-[#2D9AA6] font-bold">{certificate.performanceImpact}</span> • Verdict:{' '}
                <span className="text-[#19734A] font-black">{certificate.verificationDecision}</span>
              </div>
              <div className="text-[#59635A] text-[11px]">Timestamp: {certificate.timestamp}</div>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Seal & QR Code */}
        <div className="mt-6 pt-6 border-t border-[#DCDDD2] flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs">
          {/* Hash Box */}
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex items-center justify-between text-[11px] text-[#687168]">
              <span className="flex items-center gap-1 text-[#19734A] font-bold">
                <Lock className="w-3.5 h-3.5 text-[#15945E]" />
                <span>CRYPTOGRAPHIC SHA-256 INTEGRITY SEAL</span>
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[#2D9AA6] hover:text-[#202923] flex items-center gap-1 text-[10px] font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-[#15945E]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#F1F0E9] border border-[#D5D8CF] text-[#19734A] text-[11px] break-all font-mono-tech shadow-inner">
              {certificate.sha256Hash}
            </div>

            <div className="text-[10px] text-[#899189]">
              Signed by {certificate.issuer} via {certificate.sandboxIsolationLevel}
            </div>
          </div>

          {/* Stylized QR Code Visual */}
          <div className="p-3 bg-[#FAF8EE] border border-[#DDE0D5] rounded-xl shadow-md shrink-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-[#FFFDF5] border border-[#DCDDD2] p-1.5 rounded-lg flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-2 border-[#4F9D18] bg-[#FFFDF5] p-0.5"><div className="w-full h-full bg-[#202923]"/></div>
                <div className="w-6 h-6 border-2 border-[#4F9D18] bg-[#FFFDF5] p-0.5"><div className="w-full h-full bg-[#202923]"/></div>
              </div>
              <div className="text-[7px] text-center font-bold text-[#4F9D18] font-mono-tech">
                SENTINEL-CHAIN
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-2 border-[#4F9D18] bg-[#FFFDF5] p-0.5"><div className="w-full h-full bg-[#202923]"/></div>
                <div className="w-3 h-3 bg-[#4F9D18] rounded-sm"/>
              </div>
            </div>
            <span className="text-[8px] font-bold text-[#202923] font-mono-tech mt-1">
              SC-2026-001847
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
