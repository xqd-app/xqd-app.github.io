import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eraser,
  ImageOff,
  ListChecks,
  RotateCcw,
  Shuffle,
  Trophy,
  XCircle,
} from 'lucide-react';

/* ----------------------------- 数据类型 ----------------------------- */

type SubjectId = 'general' | 'it';
type Screen = 'home' | 'practice' | 'result';

interface QuizOption {
  key: string;
  text: string;
}

interface QuizPart {
  prompt: string;
  answer: string;
  explanation: string;
}

interface QuizQuestion {
  id: string;
  subject: SubjectId;
  chapter: string;
  subsection: string;
  section: string;
  type: 'choice' | 'judge' | 'fill' | 'answer' | 'code';
  number: number;
  stem: string;
  options: QuizOption[];
  images: string[];
  answer: string;
  answerRaw: string;
  explanation: string;
  parts: QuizPart[];
  gradable: boolean;
}

interface QuizChapter {
  title: string;
  questions: QuizQuestion[];
}

interface QuizBank {
  subject: SubjectId;
  name: string;
  chapters: QuizChapter[];
  stats: {
    total: number;
    gradable: number;
    byType: Record<string, number>;
  };
}

interface AnswerRecord {
  picked: string;
  correct: boolean;
}

type WrongBook = Record<SubjectId, string[]>;

/* ----------------------------- 常量与工具 ----------------------------- */

const SUBJECTS: { id: SubjectId; name: string; desc: string }[] = [
  { id: 'general', name: '通用技术', desc: '技术与设计 · 结构/流程/系统/控制/电子' },
  { id: 'it', name: '信息技术', desc: '数据与算法 · Python/数据处理/人工智能' },
];

const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  choice: '单项选择',
  judge: '判断题',
  fill: '填空题',
  answer: '主观题',
  code: '编程填空',
};

const WRONG_KEY = 'quiz_wrong_book_v1';
const BANK_CACHE = new Map<SubjectId, QuizBank>();

function emptyWrongBook(): WrongBook {
  return { general: [], it: [] };
}

function loadWrongBook(): WrongBook {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    if (!raw) return emptyWrongBook();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyWrongBook();
    const obj = parsed as Partial<WrongBook>;
    const pick = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    return { general: pick(obj.general), it: pick(obj.it) };
  } catch {
    return emptyWrongBook();
  }
}

function saveWrongBook(book: WrongBook) {
  try {
    localStorage.setItem(WRONG_KEY, JSON.stringify(book));
  } catch {
    /* 隐私模式下忽略 */
  }
}

function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, '')
    .replace(/[，,。.；;：:、]/g, '')
    .replace(/[（(]/g, '(')
    .replace(/[）)]/g, ')')
    .toLowerCase();
}

function isTextCorrect(input: string, answer: string): boolean {
  if (!input.trim() || !answer) return false;
  const user = normalizeText(input);
  const candidates = answer
    .split(/[/|｜]/)
    .map((s) => normalizeText(s))
    .filter(Boolean);
  if (candidates.includes(user)) return true;
  // 多空答案：用分号切开后逐空比对
  const blanks = answer.split(/[；;]/).map(normalizeText).filter(Boolean);
  if (blanks.length > 1) {
    const userParts = input.split(/[；;，,、\s]+/).map(normalizeText).filter(Boolean);
    if (userParts.length === blanks.length) {
      return userParts.every((p, i) => p === blanks[i]);
    }
  }
  return false;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

function mentionImage(stem: string): boolean {
  return /如图|图所示|下图|下图|图示|图中/.test(stem);
}

async function fetchBank(subject: SubjectId): Promise<QuizBank> {
  const cached = BANK_CACHE.get(subject);
  if (cached) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}data/quiz/${subject}.json`);
  if (!res.ok) throw new Error(`题库加载失败（${res.status}）`);
  const data = (await res.json()) as QuizBank;
  BANK_CACHE.set(subject, data);
  return data;
}

/* ----------------------------- 页面 ----------------------------- */

export function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSubject: SubjectId = searchParams.get('subject') === 'it' ? 'it' : 'general';

  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [banks, setBanks] = useState<Partial<Record<SubjectId, QuizBank>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [screen, setScreen] = useState<Screen>('home');

  const [chapter, setChapter] = useState('');
  const [randomMode, setRandomMode] = useState(false);
  const [gradedOnly, setGradedOnly] = useState(true);

  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [wrongBook, setWrongBook] = useState<WrongBook>(() => loadWrongBook());
  const [fillInput, setFillInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [resultOnlyWrong, setResultOnlyWrong] = useState(false);

  const timerRef = useRef<number | null>(null);

  const bank = banks[subject] ?? null;

  /* ---------- 加载题库 ---------- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchBank(subject)
      .then((data) => {
        if (!cancelled) {
          setBanks((prev) => ({ ...prev, [subject]: data }));
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '题库加载失败');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [subject]);

  /* ---------- 预加载另一科目，保证两张卡片的题量都准确 ---------- */
  useEffect(() => {
    const other: SubjectId = subject === 'general' ? 'it' : 'general';
    if (banks[other]) return;
    let cancelled = false;
    fetchBank(other)
      .then((data) => {
        if (!cancelled) setBanks((prev) => (prev[other] ? prev : { ...prev, [other]: data }));
      })
      .catch(() => {
        /* 预加载失败不影响当前科目 */
      });
    return () => {
      cancelled = true;
    };
  }, [subject, banks]);

  /* ---------- 计时 ---------- */
  useEffect(() => {
    if (screen !== 'practice') {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, startedAt]);

  /* ---------- 当前题 ---------- */
  const current = queue[index] as QuizQuestion | undefined;
  const isAnswered = current ? Boolean(answers[current.id]) : false;
  const currentRecord = current ? answers[current.id] : undefined;
  const isSelfQuestion = current ? !current.gradable : false;

  const recordAnswer = useCallback(
    (question: QuizQuestion, picked: string, correct: boolean) => {
      setAnswers((prev) => (prev[question.id] ? prev : { ...prev, [question.id]: { picked, correct } }));
      if (!correct) {
        setWrongBook((prev) => {
          const list = prev[question.subject];
          if (list.includes(question.id)) return prev;
          const next: WrongBook = { ...prev, [question.subject]: [...list, question.id] };
          saveWrongBook(next);
          return next;
        });
      }
    },
    [],
  );

  const startPractice = useCallback(
    (options: { onlyWrong?: boolean; chapterTitle?: string; random?: boolean } = {}) => {
      if (!bank) return;
      const targetChapter = options.chapterTitle ?? chapter;
      let pool: QuizQuestion[] = bank.chapters
        .filter((ch) => !targetChapter || ch.title === targetChapter)
        .flatMap((ch) => ch.questions);

      if (options.onlyWrong) {
        const ids = new Set(wrongBook[subject]);
        pool = pool.filter((q) => ids.has(q.id));
      } else if (gradedOnly) {
        pool = pool.filter((q) => q.gradable);
      }
      if (pool.length === 0) return;

      const useRandom = options.random ?? randomMode;
      setQueue(useRandom ? shuffleArray(pool) : pool);
      setIndex(0);
      setAnswers({});
      setFillInput('');
      setRevealed(false);
      setResultOnlyWrong(Boolean(options.onlyWrong));
      setStartedAt(Date.now());
      setElapsed(0);
      setScreen('practice');
    },
    [bank, chapter, randomMode, gradedOnly, wrongBook, subject],
  );

  const goNext = useCallback(() => {
    setFillInput('');
    setRevealed(false);
    if (index >= queue.length - 1) {
      setScreen('result');
      return;
    }
    setIndex((i) => i + 1);
  }, [index, queue.length]);

  const goPrev = useCallback(() => {
    setFillInput('');
    setRevealed(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const submitChoice = useCallback(
    (key: string) => {
      if (!current || isAnswered) return;
      const correct =
        current.type === 'judge'
          ? key === current.answer
          : current.answer.length > 1
            ? key === current.answer || current.answer.includes(key)
            : key === current.answer;
      recordAnswer(current, key, correct);
    },
    [current, isAnswered, recordAnswer],
  );

  const submitFill = useCallback(() => {
    if (!current || isAnswered) return;
    if (!fillInput.trim()) return;
    recordAnswer(current, fillInput, isTextCorrect(fillInput, current.answer));
    setRevealed(true);
  }, [current, isAnswered, fillInput, recordAnswer]);

  const judgeSelf = useCallback(
    (correct: boolean) => {
      if (!current) return;
      recordAnswer(current, '自评', correct);
    },
    [current, recordAnswer],
  );

  /* ---------- 键盘操作 ---------- */
  useEffect(() => {
    if (screen !== 'practice' || !current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'Enter') {
        if (isAnswered || (isSelfQuestion && revealed)) goNext();
        return;
      }
      if (isAnswered) return;
      if (current.type === 'choice') {
        const idx = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
        const letterIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(e.key.toLowerCase());
        const i = idx >= 0 ? idx : letterIdx;
        if (i >= 0 && current.options[i]) {
          e.preventDefault();
          submitChoice(current.options[i].key);
        }
      } else if (current.type === 'judge') {
        if (e.key === '1') submitChoice('√');
        if (e.key === '2') submitChoice('×');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, current, isAnswered, isSelfQuestion, revealed, goNext, submitChoice]);

  const clearWrongBook = () => {
    const next: WrongBook = { ...wrongBook, [subject]: [] };
    setWrongBook(next);
    saveWrongBook(next);
  };

  /* ---------- 渲染 ---------- */
  const wrongCountForSubject = wrongBook[subject].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-100 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-6 lg:px-12">
        {screen === 'home' && (
          <HomeView
            banks={banks}
            loading={loading}
            error={error}
            subject={subject}
            chapter={chapter}
            randomMode={randomMode}
            gradedOnly={gradedOnly}
            wrongCount={wrongCountForSubject}
            onSubjectChange={(id) => {
              setSubject(id);
              setChapter('');
            }}
            onChapterChange={setChapter}
            onRandomChange={setRandomMode}
            onGradedOnlyChange={setGradedOnly}
            onStart={() => startPractice()}
            onStartWrong={() => startPractice({ onlyWrong: true })}
            onClearWrong={clearWrongBook}
            onBack={() => navigate('/teacher')}
          />
        )}

        {screen === 'practice' && current && (
          <PracticeView
            current={current}
            index={index}
            total={queue.length}
            answers={answers}
            isAnswered={isAnswered}
            record={currentRecord}
            isSelfQuestion={isSelfQuestion}
            fillInput={fillInput}
            revealed={revealed}
            elapsed={elapsed}
            onFillChange={setFillInput}
            onSubmitFill={submitFill}
            onPick={submitChoice}
            onReveal={() => setRevealed(true)}
            onJudgeSelf={judgeSelf}
            onPrev={goPrev}
            onNext={goNext}
            onExit={() => {
              setScreen('home');
              setIndex(0);
              setAnswers({});
            }}
          />
        )}

        {screen === 'result' && (
          <ResultView
            queue={queue}
            answers={answers}
            elapsed={elapsed}
            onlyWrong={resultOnlyWrong}
            onRestart={() => startPractice({ onlyWrong: resultOnlyWrong })}
            onBackHome={() => setScreen('home')}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- 首页 ----------------------------- */

interface HomeViewProps {
  banks: Partial<Record<SubjectId, QuizBank>>;
  loading: boolean;
  error: string;
  subject: SubjectId;
  chapter: string;
  randomMode: boolean;
  gradedOnly: boolean;
  wrongCount: number;
  onSubjectChange: (id: SubjectId) => void;
  onChapterChange: (title: string) => void;
  onRandomChange: (value: boolean) => void;
  onGradedOnlyChange: (value: boolean) => void;
  onStart: () => void;
  onStartWrong: () => void;
  onClearWrong: () => void;
  onBack: () => void;
}

function HomeView(props: HomeViewProps) {
  const {
    banks,
    loading,
    error,
    subject,
    chapter,
    randomMode,
    gradedOnly,
    wrongCount,
    onSubjectChange,
    onChapterChange,
    onRandomChange,
    onGradedOnlyChange,
    onStart,
    onStartWrong,
    onClearWrong,
    onBack,
  } = props;

  const bank = banks[subject] ?? null;

  const chapterQuestions = useMemo(() => {
    if (!bank) return [] as QuizQuestion[];
    return bank.chapters
      .filter((ch) => !chapter || ch.title === chapter)
      .flatMap((ch) => ch.questions);
  }, [bank, chapter]);

  const available = gradedOnly
    ? chapterQuestions.filter((q) => q.gradable).length
    : chapterQuestions.length;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>返回教师工作台</span>
        </button>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm">
          <BookOpen size={15} />
          刷题训练
        </span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-red-500 bg-clip-text text-transparent mb-3">
          课堂刷题
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          通用技术 / 信息技术 题库练习，自动判分、错题沉淀
        </p>
      </div>

      {/* 科目选择 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {SUBJECTS.map((item) => {
          const active = item.id === subject;
          return (
            <button
              key={item.id}
              onClick={() => onSubjectChange(item.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all ${
                active
                  ? 'border-slate-600 bg-white dark:bg-gray-800 shadow-lg shadow-slate-500/10'
                  : 'border-transparent bg-white/70 dark:bg-gray-800/60 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</span>
                {active && <CheckCircle2 size={20} className="text-slate-600 dark:text-slate-300" />}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {error && active
                  ? error
                  : banks[item.id]
                    ? `${banks[item.id]!.stats.total} 题 · 可判分 ${banks[item.id]!.stats.gradable}`
                    : '加载中…'}
              </p>
            </button>
          );
        })}
      </div>

      {/* 练习设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-white/60 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ListChecks size={16} />
              章节
            </span>
            <div className="relative">
              <select
                value={chapter}
                onChange={(e) => onChapterChange(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-slate-500"
              >
                <option value="">全部章节</option>
                {bank?.chapters.map((ch) => (
                  <option key={ch.title} value={ch.title}>
                    {ch.title}（{ch.questions.length}）
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </label>

          <div className="flex flex-col justify-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={randomMode}
                onChange={(e) => onRandomChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
              />
              <Shuffle size={15} />
              随机顺序
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gradedOnly}
                onChange={(e) => onGradedOnlyChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
              />
              <CheckCircle2 size={15} />
              只练可自动判分的题（选择题 / 判断题 / 填空题）
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onStart}
            disabled={loading || Boolean(error) || available === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 text-white font-medium shadow-lg shadow-slate-600/30 hover:from-slate-800 hover:to-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始练习
            <ArrowRight size={17} />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">本次可练 {available} 题</span>
        </div>
      </div>

      {/* 错题本 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-white/60 dark:border-gray-700 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Eraser size={18} />
            错题本
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subject === 'it' ? '信息技术' : '通用技术'} 已记录 {wrongCount} 道错题
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onStartWrong}
            disabled={wrongCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            错题重练
          </button>
          <button
            onClick={onClearWrong}
            disabled={wrongCount === 0}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            清空
          </button>
        </div>
      </div>
    </>
  );
}

/* ----------------------------- 练习页 ----------------------------- */

interface PracticeViewProps {
  current: QuizQuestion;
  index: number;
  total: number;
  answers: Record<string, AnswerRecord>;
  isAnswered: boolean;
  record: AnswerRecord | undefined;
  isSelfQuestion: boolean;
  fillInput: string;
  revealed: boolean;
  elapsed: number;
  onFillChange: (value: string) => void;
  onSubmitFill: () => void;
  onPick: (key: string) => void;
  onReveal: () => void;
  onJudgeSelf: (correct: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

function PracticeView(props: PracticeViewProps) {
  const {
    current,
    index,
    total,
    answers,
    isAnswered,
    record,
    isSelfQuestion,
    fillInput,
    revealed,
    elapsed,
    onFillChange,
    onSubmitFill,
    onPick,
    onReveal,
    onJudgeSelf,
    onPrev,
    onNext,
    onExit,
  } = props;

  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const wrongCount = Object.keys(answers).length - correctCount;
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  const correctKey = current.type === 'judge' ? current.answer : current.answer;

  return (
    <>
      {/* 顶部栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>退出练习</span>
        </button>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {index + 1} / {total}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} /> {correctCount}
          </span>
          <span className="inline-flex items-center gap-1 text-red-500">
            <XCircle size={15} /> {wrongCount}
          </span>
          <span className="text-gray-400 tabular-nums">{formatDuration(elapsed)}</span>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-slate-600 to-slate-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 题目卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-white/60 dark:border-gray-700 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 font-medium">
            {TYPE_LABEL[current.type]}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
            {current.chapter}
          </span>
          {current.subsection && (
            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
              {current.subsection}
            </span>
          )}
        </div>

        <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {current.stem}
        </p>

        {current.images.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-3">
            {current.images.map((src, i) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noreferrer"
                title="点击查看大图"
                className="block"
              >
                <img
                  src={src}
                  alt={`题目配图 ${i + 1}`}
                  loading="lazy"
                  className="max-h-72 w-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white cursor-zoom-in"
                />
              </a>
            ))}
          </div>
        )}
        {current.images.length === 0 && mentionImage(current.stem) && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <ImageOff size={15} />
            原题配图未收录，本题可先看解析理解
          </p>
        )}

        {/* 作答区 */}
        <div className="mt-6">
          {current.type === 'choice' && (
            <div className="grid grid-cols-1 gap-2.5">
              {current.options.map((opt) => {
                const isCorrectOption = isAnswered && opt.key === correctKey;
                const isPickedWrong = isAnswered && record?.picked === opt.key && !record.correct;
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (!isSelfQuestion) onPick(opt.key);
                    }}
                    disabled={isAnswered || isSelfQuestion}
                    className={`flex items-start gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                      isCorrectOption
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : isPickedWrong
                          ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                          : isAnswered
                            ? 'border-gray-200 dark:border-gray-700 opacity-60'
                            : 'border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        isCorrectOption
                          ? 'bg-emerald-500 text-white'
                          : isPickedWrong
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm md:text-base text-gray-800 dark:text-gray-200">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'judge' && (
            <div className="grid grid-cols-2 gap-3">
              {['√', '×'].map((value) => {
                const isCorrectOption = isAnswered && value === correctKey;
                const isPickedWrong = isAnswered && record?.picked === value && !record.correct;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      if (!isSelfQuestion) onPick(value);
                    }}
                    disabled={isAnswered || isSelfQuestion}
                    className={`px-4 py-4 rounded-xl border text-lg font-semibold transition-all ${
                      isCorrectOption
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : isPickedWrong
                          ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-slate-400'
                    }`}
                  >
                    {value === '√' ? '正确 √' : '错误 ×'}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'fill' && !isSelfQuestion && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitFill();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                value={fillInput}
                onChange={(e) => onFillChange(e.target.value)}
                disabled={isAnswered}
                placeholder="输入答案后回车提交"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none focus:border-slate-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isAnswered || !fillInput.trim()}
                className="px-6 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                提交答案
              </button>
            </form>
          )}

          {isSelfQuestion && (
            <div className="space-y-4">
              {current.parts.length > 0 && (
                <ol className="space-y-2">
                  {current.parts.map((part, i) => (
                    <li key={i} className="text-sm md:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {part.prompt}
                      {revealed && part.answer && (
                        <span className="mt-1 block text-emerald-700 dark:text-emerald-400">
                          参考答案：{part.answer}
                        </span>
                      )}
                      {revealed && part.explanation && (
                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          解析：{part.explanation}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {!revealed ? (
                <button
                  onClick={onReveal}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-slate-400 transition-colors"
                >
                  显示参考答案
                </button>
              ) : (
                !isAnswered && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">对照答案自评：</span>
                    <button
                      onClick={() => onJudgeSelf(true)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors"
                    >
                      我答对了
                    </button>
                    <button
                      onClick={() => onJudgeSelf(false)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                    >
                      我答错了
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 反馈 */}
        {isAnswered && (
          <div
            className={`mt-6 rounded-xl border p-4 ${
              record?.correct
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20'
                : 'border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/20'
            }`}
          >
            <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              {record?.correct ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" /> 回答正确
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-500" /> 回答错误
                </>
              )}
            </p>
            {current.answerRaw && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                正确答案：<span className="font-semibold">{current.answerRaw}</span>
                {record?.picked && record.picked !== '自评' && !record.correct && (
                  <span className="ml-3 text-gray-500 dark:text-gray-400">你的答案：{record.picked}</span>
                )}
              </p>
            )}
            {current.explanation && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                解析：{current.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:border-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          上一题
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 text-white text-sm font-medium shadow-lg shadow-slate-600/20 hover:from-slate-800 hover:to-slate-700 transition-all"
        >
          {index >= total - 1 ? '查看结果' : '下一题'}
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

/* ----------------------------- 结果页 ----------------------------- */

interface ResultViewProps {
  queue: QuizQuestion[];
  answers: Record<string, AnswerRecord>;
  elapsed: number;
  onlyWrong: boolean;
  onRestart: () => void;
  onBackHome: () => void;
}

function ResultView(props: ResultViewProps) {
  const { queue, answers, elapsed, onlyWrong, onRestart, onBackHome } = props;
  const answeredCount = queue.filter((q) => answers[q.id]).length;
  const correct = Object.values(answers).filter((a) => a.correct).length;
  const wrong = answeredCount - correct;
  const rate = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;

  const wrongList = queue.filter((q) => answers[q.id] && !answers[q.id].correct);
  const skipped = queue.length - answeredCount;

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/60 mb-4">
          <Trophy size={30} className="text-slate-600 dark:text-slate-300" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {onlyWrong ? '错题重练完成' : '练习完成'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          共 {queue.length} 题 · 作答 {answeredCount} 题 · 用时 {formatDuration(elapsed)}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '正确率', value: `${rate}%`, color: 'text-slate-700 dark:text-slate-200' },
          { label: '答对', value: `${correct}`, color: 'text-emerald-600' },
          { label: '答错', value: `${wrong}`, color: 'text-red-500' },
          { label: '未作答', value: `${skipped}`, color: 'text-gray-400' },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-white/60 dark:border-gray-700 p-5 text-center shadow-sm">
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>

      {wrongList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-white/60 dark:border-gray-700 p-6 mb-8">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">错题回顾（{wrongList.length}）</h2>
          <div className="space-y-4">
            {wrongList.map((q) => (
              <details key={q.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                  {q.stem.slice(0, 80)}
                  {q.stem.length > 80 ? '…' : ''}
                </summary>
                <div className="mt-3 text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <p>
                    你的答案：{answers[q.id]?.picked || '未作答'}
                    {' · '}正确答案：
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{q.answerRaw || '见解析'}</span>
                  </p>
                  {q.explanation && <p className="whitespace-pre-wrap">解析：{q.explanation}</p>}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:border-slate-400 transition-colors"
        >
          <ArrowLeft size={17} />
          返回刷题首页
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 text-white font-medium shadow-lg shadow-slate-600/30 hover:from-slate-800 hover:to-slate-700 transition-all"
        >
          <RotateCcw size={17} />
          {onlyWrong ? '再练一次错题' : '再练一轮'}
        </button>
      </div>
    </>
  );
}

export default Quiz;
