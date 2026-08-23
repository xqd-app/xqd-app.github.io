import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const CHAPTERS = [
  { id: '1', label: '第1章' },
  { id: '2', label: '第2章' },
  { id: '3', label: '第3章' },
  { id: '4', label: '第4章' },
  { id: '5', label: '第5章' },
  { id: '6', label: '第6章' },
  { id: '7', label: '第7章' },
  { id: '8', label: '第8章' },
  { id: '9', label: '总复习' },
];

export function MindMapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chapter = searchParams.get('chapter') || '9';

  const setChapter = (id: string) => {
    setSearchParams({ chapter: id });
  };

  const openNewWindow = () => {
    window.open(`/mindmap?chapter=${chapter}`, '_blank', 'noopener,noreferrer,width=1400,height=900');
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-5 md:px-8 py-3">
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-gray-800/60"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">返回教师工作台</span>
          </button>
          <button
            onClick={openNewWindow}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
            title="弹出独立窗口"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">新窗口打开</span>
            <span className="sm:hidden">弹出</span>
          </button>
        </div>
        <div className="flex items-center gap-2 px-5 md:px-8 pb-3 overflow-x-auto">
          {CHAPTERS.map((c) => {
            const active = c.id === chapter;
            return (
              <button
                key={c.id}
                onClick={() => setChapter(c.id)}
                className={
                  'px-4 py-1.5 text-sm rounded-lg whitespace-nowrap transition-all ' +
                  (active
                    ? 'bg-slate-700 text-white font-semibold shadow-md'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white')
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <iframe
        key={chapter}
        src={`/markmap-chapters/${chapter}.html`}
        title="高中信息技术知识思维导图"
        className="flex-1 w-full border-0"
      />
    </div>
  );
}

export default MindMapPage;
