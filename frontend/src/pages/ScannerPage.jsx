import React from 'react';
import PhishingScanner from '../components/widgets/PhishingScanner';
import { Network } from 'lucide-react';

const ScannerPage = () => {
  return (
    <div className="flex flex-col gap-6 h-full pb-20 mt-4 md:mt-0">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Threat Intelligence</h1>
        <p className="text-sm text-textMuted">Manual IOC scanning and intelligence gathering tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="h-full">
           <PhishingScanner />
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center text-textMuted border-dashed">
            <Network size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">Network Sandbox</h3>
            <p className="text-xs text-center max-w-sm">
                Additional intelligence tools (e.g. IP Reputation, File Hash lookup) are managed via centralized APIs and not exposed directly in this tier.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
