import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  FileText,
  CloudDownload,
  Newspaper,
  Megaphone,
  MessageCircle,
  Headphones
} from 'lucide-react';

export default function QuickAccessRow({
  onSelectService,
  onOpenFeedbackModal
}) {
  const { t } = useLanguage();

  const quickItems = [
    {
      id: 'katalog',
      title: t('qa_catalog'),
      icon: BookOpen,
      action: () => {
        const el = document.getElementById('katalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'jurnal',
      title: t('qa_journal'),
      icon: FileText,
      action: () => {
        if (onSelectService) onSelectService('jurnal');
      }
    },
    {
      id: 'repository',
      title: t('qa_repo'),
      icon: CloudDownload,
      action: () => {
        if (onSelectService) onSelectService('repositori');
      }
    },
    {
      id: 'berita',
      title: t('qa_news'),
      icon: Newspaper,
      action: () => {
        if (onSelectService) onSelectService('berita');
      }
    },
    {
      id: 'pengumuman',
      title: t('qa_announcement'),
      icon: Megaphone,
      action: () => {
        if (onSelectService) onSelectService('pengumuman');
      }
    },
    {
      id: 'komentar',
      title: t('qa_feedback'),
      icon: MessageCircle,
      action: () => {
        if (onOpenFeedbackModal) onOpenFeedbackModal();
        else if (onSelectService) onSelectService('komentar');
      }
    },
    {
      id: 'bantuan',
      title: t('qa_help'),
      icon: Headphones,
      action: () => {
        if (onSelectService) onSelectService('bantuan');
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 relative z-20">
      {/* 7 White Pill Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
        {quickItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.action}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 hover:border-emerald-300 p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 group hover:-translate-y-1 select-none"
            >
              {/* Green icon container */}
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center mb-2.5 group-hover:bg-[#047857] group-hover:text-white transition-colors shadow-2xs">
                <IconComp className="w-6 h-6 stroke-[2]" />
              </div>

              {/* Title */}
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#047857] transition-colors line-clamp-2 leading-snug">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
