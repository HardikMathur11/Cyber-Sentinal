import React from 'react';
import {
  Terminal,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Wrench,
  Bot,
  Activity,
  Code2,
  FileCode,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { playCyberBlip, playSuccessChime } from '../utils/audio';

export interface LogItemDetail {
  id?: string | number;
  time?: string;
  type?: string;
  tag?: string;
  message?: string;
  agent?: string;
  file?: string;
  line?: number;
  snippet?: string;
  payloadHex?: string;
  details?: string;
  relatedView?: 'vulnerabilities' | 'patch-center' | 'agent-control' | 'analytics' | 'certificates';
}

interface LogDetailModalProps {
  log: LogItemDetail | null;
  onClose: () => void;
  onNavigate?: (view: any) => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose, onNavigate }) => {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const handleCopy = () => {
    const text = `[${log.time || 'NOW'}] [${log.tag || log.type || 'LOG'}] ${log.message || ''}\nFile: ${log.file || 'N/A'}:${log.line || ''}\n${log.details || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'DANGER':
      case 'VULN':
      case 'CRITICAL':
        return 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]';
      case 'SUCCESS':
      case 'VERIFY':
      case 'CERT':
        return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
      case 'WARN':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'AGENT':
      case 'AST':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] text-left font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getTagColor(log.type || log.tag)}`}>
                  {log.tag || log.type || 'EVENT'}
                </span>
                <span className="text-xs font-mono text-[#64748B]">{log.time || 'Real-time Event'}</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-0.5">Sentinel Telemetry Event Inspector</h3>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberBlip(700);
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Main Log Message */}
          <div className="p-4 rounded-xl bg-[#0B0F19] text-[#F8FAFD] border border-[#1E293B] font-mono text-xs leading-relaxed">
            <div className="text-[#60A5FA] text-[10px] uppercase font-bold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
              <span>Full Raw Log Message</span>
            </div>
            <p className="text-[#E2E8F0] break-words">{log.message}</p>
          </div>

          {/* Contextual Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] font-bold uppercase">Responsible Agent / Service</span>
              <span className="font-bold text-[#0F172A] flex items-center gap-1.5 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[#2563EB]" />
                {log.agent || log.tag || 'Autonomous Orchestrator'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] font-bold uppercase">Source Location</span>
              <span className="font-mono font-bold text-[#2563EB] flex items-center gap-1.5 mt-0.5">
                <FileCode className="w-3.5 h-3.5 text-[#64748B]" />
                {log.file || 'src/parser.cpp'}{log.line ? `:${log.line}` : ''}
              </span>
            </div>
          </div>

          {/* Detailed Explanation / Reasoning */}
          {log.details && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
              <span className="text-[#64748B] text-[10px] font-bold uppercase block">Agent Cyber-Reasoning & Context</span>
              <p className="text-xs text-[#334155] leading-relaxed font-medium">{log.details}</p>
            </div>
          )}

          {/* Snippet / Memory / Payload if present */}
          {(log.snippet || log.payloadHex) && (
            <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
              <span className="text-[#94A3B8] text-[10px] font-bold uppercase block font-mono">
                {log.snippet ? 'Source Code AST Excerpt' : 'Trigger Payload Hex'}
              </span>
              <pre className="text-xs font-mono text-[#34D399] overflow-x-auto p-2 bg-[#080C14] rounded-lg">
                {log.snippet || log.payloadHex}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFD]">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] flex items-center gap-1.5 transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY EVENT DETAILS'}</span>
          </button>

          <div className="flex items-center gap-2">
            {log.relatedView && onNavigate && (
              <button
                onClick={() => {
                  playCyberBlip(950);
                  onNavigate(log.relatedView);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <span>OPEN IN {log.relatedView.toUpperCase().replace('-', ' ')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
