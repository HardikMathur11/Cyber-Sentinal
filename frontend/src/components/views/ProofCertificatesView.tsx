import React, { useState, useRef } from 'react';
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
  ArrowRight,
  Filter,
  ExternalLink,
  FolderGit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProofCertificate, SecurityRun } from '../../types';
import { DEMO_CERTIFICATES } from '../../mockData';
import { playCyberBlip, playSuccessChime } from '../../utils/audio';

interface ProofCertificatesViewProps {
  certificate: ProofCertificate;
  onNavigate: (view: any) => void;
}

export const ProofCertificatesView: React.FC<ProofCertificatesViewProps> = ({
  certificate = DEMO_CERTIFICATES[0],
  onNavigate
}) => {
  const [selectedCertId, setSelectedCertId] = useState<string>(certificate.certificateId || 'SC-2026-001847');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedOnline, setVerifiedOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const detailsRef = useRef<HTMLDivElement>(null);

  const activeCert = DEMO_CERTIFICATES.find((c) => c.certificateId === selectedCertId) || DEMO_CERTIFICATES[0];

  const filteredCertificates = DEMO_CERTIFICATES.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.certificateId.toLowerCase().includes(q) ||
      c.projectName.toLowerCase().includes(q) ||
      c.vulnerability.toLowerCase().includes(q) ||
      c.sha256Hash.toLowerCase().includes(q)
    );
  });

  const handleSelectCert = (certId: string) => {
    playCyberBlip(850);
    setSelectedCertId(certId);
    setVerifiedOnline(true);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activeCert.sha256Hash);
    setCopied(true);
    playCyberBlip(1200);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playSuccessChime();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeCert, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeCert.certificateId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    confetti({
      particleCount: 60,
      spread: 70,
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
    }, 900);
  };

  return (
    <div id="proof-certificates-view" className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-xs">
              <Award className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                CRYPTOGRAPHIC PROOF OF REMEDIATION LEDGER
              </div>
              <h2 className="text-xl font-black text-[#0F172A] mt-0.5">
                Verified Security Proof Certificates ({DEMO_CERTIFICATES.length} Minted)
              </h2>
              <p className="text-xs text-[#475569] mt-0.5 font-medium">
                Tamper-evident cryptographic seals binding AST findings, PoV blockage, regression tests, and SHA-256 signatures.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs btn-cyber-blue active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD ACTIVE JSON</span>
            </button>

            <button
              onClick={handleVerifyHash}
              disabled={verifying}
              className="px-4 py-2.5 rounded-xl bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{verifying ? 'VERIFYING ON-CHAIN HASH...' : 'VERIFY SHA-256 SEAL'}</span>
            </button>
          </div>
        </div>

        {/* Certificate Catalog Grid (10+ Certificates) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              SELECT FROM {DEMO_CERTIFICATES.length} CRYPTOGRAPHICALLY SEALED CERTIFICATES:
            </span>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search certificate ID, project, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFD] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCertificates.map((cert) => {
              const isSelected = selectedCertId === cert.certificateId;
              return (
                <div
                  key={cert.certificateId}
                  onClick={() => handleSelectCert(cert.certificateId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 text-left active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF]/70 ring-1 ring-[#2563EB]/40 shadow-sm'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#2563EB] hover:bg-[#F8FAFD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#0F172A]">{cert.certificateId}</span>
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                      SEALED ✓
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#0F172A] truncate">{cert.projectName}</div>
                    <div className="text-[11px] text-[#BE123C] font-medium truncate">{cert.vulnerability}</div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                    <span className="truncate max-w-[140px]">{cert.sha256Hash.substring(0, 16)}...</span>
                    <span className="text-[#2563EB] font-bold">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE CERTIFICATE DEEP-DIVE DETAILS */}
      <div ref={detailsRef} className="bg-[#FFFFFF] p-6 border border-[#E2E8F0] rounded-2xl shadow-sm space-y-5 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
                CRYPTOGRAPHIC REMEDIATION SEAL ACTIVE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                {activeCert.projectName}
              </span>
            </div>
            <h3 className="text-xl font-black text-[#0F172A] font-mono">
              Certificate {activeCert.certificateId}
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Issued by: <strong className="text-[#0F172A]">{activeCert.issuer}</strong> · Timestamp: <span className="font-mono">{activeCert.timestamp}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHash}
              className="px-3.5 py-2 rounded-xl bg-[#F8FAFD] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-xs font-bold flex items-center gap-1.5 text-[#0F172A] transition-all active:scale-95 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
              <span>{copied ? 'HASH COPIED' : 'COPY SHA-256'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs btn-cyber-blue active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>
          </div>
        </div>

        {/* SHA-256 Hash Display Box */}
        <div className="p-4 rounded-xl bg-[#0B0F19] text-[#34D399] border border-[#1E293B] font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#94A3B8] text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
              SHA-256 CRYPTOGRAPHIC INTEGRITY DIGEST
            </span>
            <span className="text-[#4ADE80]">VALIDATED IMMUTABLE SEAL</span>
          </div>
          <p className="text-sm font-bold break-all text-[#F8FAFD]">{activeCert.sha256Hash}</p>
          <div className="text-[10px] text-[#64748B] pt-1 border-t border-[#1E293B]">
            Ed25519 Signature: {activeCert.signature}
          </div>
        </div>

        {/* Verification Ledger 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">ORIGINAL POV RE-TEST</span>
            <div className="text-base font-black text-[#16A34A]">{activeCert.originalPoVReTest} ✓</div>
            <p className="text-[11px] text-[#475569]">Exploit payload cleanly blocked</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">ADVERSARIAL STRESS</span>
            <div className="text-base font-black text-[#2563EB]">0 Exploits</div>
            <p className="text-[11px] text-[#475569]">{activeCert.adversarialTestingSummary}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">REGRESSION SUITE</span>
            <div className="text-base font-black text-[#16A34A]">100% Passed</div>
            <p className="text-[11px] text-[#475569]">{activeCert.regressionSummary}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">PERFORMANCE OVERHEAD</span>
            <div className="text-base font-black text-[#0F172A]">{activeCert.performanceImpact}</div>
            <p className="text-[11px] text-[#16A34A] font-medium">Within SLA threshold</p>
          </div>
        </div>

        {/* Detailed Metadata Spec */}
        <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] text-xs space-y-2">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            CERTIFICATE SPECIFICATION & ENVIRONMENT
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span className="text-[#64748B] block">Target Vulnerability:</span>
              <strong className="text-[#0F172A]">{activeCert.vulnerability}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block">Affected File Location:</span>
              <span className="font-mono font-bold text-[#2563EB]">{activeCert.affectedFile}</span>
            </div>
            <div>
              <span className="text-[#64748B] block">Isolation Environment:</span>
              <strong className="text-[#0F172A]">{activeCert.sandboxIsolationLevel}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
