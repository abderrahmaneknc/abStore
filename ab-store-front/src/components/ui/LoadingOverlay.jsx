import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/language';

export default function LoadingOverlay({ isLoading, text }) {
  const { t } = useLanguage();
  if (!isLoading) return null;

  const displayText = text || t('processingText');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-800">{displayText}</p>
      </div>
    </div>
  );
}
