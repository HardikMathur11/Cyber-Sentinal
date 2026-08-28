import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { playCyberBlip } from '../utils/audio';

interface SyntaxCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  highlightType?: 'vuln' | 'patch' | 'neutral' | 'diff';
  showLineNumbers?: boolean;
  minHeight?: string;
}

export const SyntaxCodeBlock: React.FC<SyntaxCodeBlockProps> = ({
  code,
  language = 'cpp',
  title,
  highlightType = 'neutral',
  showLineNumbers = true,
  minHeight = 'auto'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playCyberBlip(1200);
    setTimeout(() => setCopied(false), 2000);
  };

  // C++ Tokenizer for Syntax Highlighting
  const highlightCppLine = (line: string) => {
    // If it's a comment
    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1) {
      const beforeComment = line.substring(0, commentIdx);
      const commentText = line.substring(commentIdx);
      return (
        <>
          {renderTokens(beforeComment)}
          <span className="text-[#8B949E] italic">{commentText}</span>
        </>
      );
    }
    return renderTokens(line);
  };

  const renderTokens = (text: string) => {
    // Regex for C++ tokens
    const tokenRegex = /(\b(?:int|char|const|void|bool|float|double|size_t|uint32_t|uint8_t|struct|class|enum|auto|return|if|else|while|for|switch|case|break|continue|sizeof|new|delete|nullptr|true|false|public|private|protected|virtual|override)\b|\b(?:strcpy|strncpy|memcpy|strlen|printf|sprintf|snprintf|malloc|free|process_tag_internal|parse_header_tag|validate_packet|execute_payload|run_sanitizer|authenticate_token)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\b|#\w+)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchText = match[0];

      if (matchStart > lastIndex) {
        parts.push(
          <span key={`plain-${lastIndex}`} className="text-[#E6EDF3]">
            {text.substring(lastIndex, matchStart)}
          </span>
        );
      }

      // Categorize token
      if (/^(int|char|const|void|bool|float|double|size_t|uint32_t|uint8_t|struct|class|enum|auto|return|if|else|while|for|switch|case|break|continue|sizeof|new|delete|nullptr|true|false|public|private|protected|virtual|override)$/.test(matchText)) {
        parts.push(
          <span key={`kw-${matchStart}`} className="text-[#FF7B72] font-semibold">
            {matchText}
          </span>
        );
      } else if (/^(strcpy|strncpy|memcpy|strlen|printf|sprintf|snprintf|malloc|free|process_tag_internal|parse_header_tag|validate_packet|execute_payload|run_sanitizer|authenticate_token)$/.test(matchText)) {
        parts.push(
          <span key={`fn-${matchStart}`} className="text-[#79C0FF] font-medium">
            {matchText}
          </span>
        );
      } else if (matchText.startsWith('"') || matchText.startsWith("'")) {
        parts.push(
          <span key={`str-${matchStart}`} className="text-[#A5D6FF]">
            {matchText}
          </span>
        );
      } else if (/^\d+$/.test(matchText)) {
        parts.push(
          <span key={`num-${matchStart}`} className="text-[#79C0FF]">
            {matchText}
          </span>
        );
      } else if (matchText.startsWith('#')) {
        parts.push(
          <span key={`pre-${matchStart}`} className="text-[#FFA657] font-semibold">
            {matchText}
          </span>
        );
      } else {
        parts.push(
          <span key={`tok-${matchStart}`} className="text-[#E6EDF3]">
            {matchText}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`end-${lastIndex}`} className="text-[#E6EDF3]">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="text-[#E6EDF3]">{text}</span>;
  };

  const lines = code.trim().split('\n');

  return (
    <div
      className={`rounded-2xl border bg-[#0B0F19] text-[#E6EDF3] font-mono text-[12.5px] leading-relaxed overflow-hidden shadow-[0_4px_20px_rgba(10,15,25,0.25)] ${
        highlightType === 'vuln'
          ? 'border-[#3D1E24] shadow-[0_4px_20px_rgba(229,72,98,0.08)]'
          : highlightType === 'patch'
          ? 'border-[#1C3322] shadow-[0_4px_20px_rgba(33,150,83,0.08)]'
          : 'border-[#1E2638]'
      }`}
      style={{ minHeight }}
    >
      {/* Sleek Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#070A12] border-b border-[#1A2234] select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/70" />
          </div>

          {title && (
            <span className="text-[11px] font-sans font-semibold text-[#8B949E] flex items-center gap-1.5 ml-1 sm:ml-2 border-l border-[#1A2234] pl-2 sm:pl-3 min-w-0">
              {highlightType === 'vuln' && <ShieldAlert className="w-3 h-3 text-[#FF7B72] shrink-0" />}
              {highlightType === 'patch' && <ShieldCheck className="w-3 h-3 text-[#7EE787] shrink-0" />}
              <span className={`truncate max-w-[140px] sm:max-w-xs md:max-w-md ${highlightType === 'vuln' ? 'text-[#FF7B72]' : highlightType === 'patch' ? 'text-[#7EE787]' : 'text-[#C9D1D9]'}`}>
                {title}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-[#161B26] text-[#8B949E] border border-[#232D42]">
            {language.toUpperCase()}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#161B26]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#7EE787]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto">
        <div className="space-y-0.5">
          {lines.map((line, idx) => {
            const isDiffAdd = line.startsWith('+');
            const isDiffDel = line.startsWith('-');
            const displayLine = isDiffAdd || isDiffDel ? line.substring(1) : line;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 px-2 py-0.5 rounded ${
                  isDiffAdd
                    ? 'bg-[#153420] text-[#7EE787]'
                    : isDiffDel
                    ? 'bg-[#3D1418] text-[#FF7B72]'
                    : ''
                }`}
              >
                {showLineNumbers && (
                  <span className="text-[11px] text-[#484F58] select-none text-right w-6 shrink-0 font-mono">
                    {idx + 1}
                  </span>
                )}
                <div className="flex-1 font-mono break-all whitespace-pre">
                  {highlightType === 'diff' ? (
                    <span className={isDiffAdd ? 'text-[#7EE787]' : isDiffDel ? 'text-[#FF7B72]' : 'text-[#C9D1D9]'}>
                      {line}
                    </span>
                  ) : (
                    highlightCppLine(displayLine)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
