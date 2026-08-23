import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Upload, Trash2, Users, Play, Pause, RotateCcw, X, FileSpreadsheet, ChevronDown, ChevronRight, UserCheck, Sparkles, Network, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { MindMapModal } from '@/components/MindMapModal';

const ACCESS_PASSWORD = '112200';

interface ClassData {
  id: string;
  name: string;
  students: string[];
  createdAt: string;
}

const STORAGE_KEY = 'teacher_classes_data';

function loadClasses(): ClassData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveClasses(classes: ClassData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

export function Teacher() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // 班级数据
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewStudents, setPreviewStudents] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [detectedInfo, setDetectedInfo] = useState('');
  const [fileSaving, setFileSaving] = useState(false);
  const [, setFileSavedName] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [showMindMap, setShowMindMap] = useState(false);

  // 随机点名
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [pickedName, setPickedName] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [excludePicked, setExcludePicked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setClasses(loadClasses());
  }, []);

  const updateClasses = useCallback((newClasses: ClassData[]) => {
    setClasses(newClasses);
    saveClasses(newClasses);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadError('');
    setDetectedInfo('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // 姓名列可能的表头名称（按优先级排序）
        const nameHeaderPatterns = [
          '姓名', '学生姓名', '名字', '学生', '同学',
          'name', 'student name', 'student', 'full name', 'studentname',
        ];

        const isNameHeader = (text: string): boolean => {
          const t = text.trim().toLowerCase();
          return nameHeaderPatterns.some(p => t === p || t.includes(p));
        };

        // 判断单元格是否像姓名（非空、非纯数字、非日期）
        const looksLikeName = (val: unknown): boolean => {
          if (val === null || val === undefined) return false;
          const s = String(val).trim();
          if (!s) return false;
          // 排除纯数字（学号、分数等）
          if (/^\d+(\.\d+)?$/.test(s)) return false;
          // 排除日期
          if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s)) return false;
          // 排除过长内容（备注、地址等）
          if (s.length > 20) return false;
          return true;
        };

        let extractedNames: string[] = [];
        let detectedColumn = '';
        let detectedSheet = '';

        // 遍历所有 sheet 查找姓名列
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          if (rows.length === 0) continue;

          const headerRow = rows[0].map(cell => String(cell || '').trim());
          let nameColIdx = headerRow.findIndex(h => isNameHeader(h));

          // 策略 2：表头未找到，自动检测「最像姓名」的列
          if (nameColIdx === -1) {
            const maxCol = Math.max(...rows.map(r => r.length), 0);
            let bestCol = -1;
            let bestScore = 0;
            for (let c = 0; c < maxCol; c++) {
              let score = 0;
              for (let r = 1; r < rows.length; r++) {
                if (looksLikeName(rows[r]?.[c])) score++;
              }
              if (score > bestScore) {
                bestScore = score;
                bestCol = c;
              }
            }
            // 至少 1/3 的数据行看起来像姓名才采用
            if (bestCol >= 0 && bestScore >= Math.max(1, Math.ceil((rows.length - 1) / 3))) {
              nameColIdx = bestCol;
            }
          }

          if (nameColIdx >= 0) {
            const names: string[] = [];
            // 从第 2 行开始读取（跳过表头）
            const startRow = isNameHeader(headerRow[nameColIdx]) ? 1 : 0;
            for (let r = startRow; r < rows.length; r++) {
              const val = rows[r]?.[nameColIdx];
              if (looksLikeName(val)) {
                names.push(String(val).trim());
              }
            }
            if (names.length > extractedNames.length) {
              extractedNames = names;
              detectedColumn = headerRow[nameColIdx] || `第 ${nameColIdx + 1} 列`;
              detectedSheet = sheetName;
            }
          }
        }

        if (extractedNames.length === 0) {
          setUploadError('未能自动识别到姓名列，请确保表格包含"姓名"列或表头中有姓名相关字段');
          return;
        }

        // 去重并保留顺序
        const uniqueNames = Array.from(new Set(extractedNames));

        setPreviewStudents(uniqueNames);
        setDetectedInfo(
          `✓ 已识别「${detectedColumn}」为姓名列` +
          (workbook.SheetNames.length > 1 ? ` · 工作表: ${detectedSheet}` : '') +
          ` · 共 ${uniqueNames.length} 人`
        );
      } catch {
        setUploadError('解析文件失败，请确保上传的是有效的 Excel 或 CSV 文件');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = async () => {
    if (!newClassName.trim()) {
      setUploadError('请输入班级名称');
      return;
    }
    if (previewStudents.length === 0) {
      setUploadError('没有可导入的姓名');
      return;
    }

    // 先保存文件到 data/Random Roll Call List
    if (uploadedFile) {
      setFileSaving(true);
      setUploadError('');
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const response = await fetch('/api/save-class-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Filename': encodeURIComponent(uploadedFile.name),
            'X-Class-Name': encodeURIComponent(newClassName.trim()),
          },
          body: arrayBuffer,
        });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || '保存失败');
        }
        setFileSavedName(result.filename);
      } catch (err) {
        // 文件保存失败不阻塞流程，仅提示
        console.warn('文件保存到本地失败:', err instanceof Error ? err.message : String(err));
        setFileSavedName('');
      } finally {
        setFileSaving(false);
      }
    }

    const newClass: ClassData = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      students: previewStudents,
      createdAt: new Date().toISOString(),
    };

    updateClasses([...classes, newClass]);
    setShowUpload(false);
    setNewClassName('');
    setUploadedFile(null);
    setPreviewStudents([]);
    setUploadError('');
    setDetectedInfo('');
    setFileSavedName('');
    setFileSaving(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('确定要删除这个班级吗？')) {
      updateClasses(classes.filter(c => c.id !== id));
      if (selectedClassId === id) {
        setSelectedClassId('');
        setPickedName('');
        setCurrentName('');
        setHistory([]);
        setShowResult(false);
      }
    }
  };

  // 随机点名
  const startRolling = () => {
    const cls = classes.find(c => c.id === selectedClassId);
    if (!cls || cls.students.length === 0) return;

    let availableNames = cls.students;
    if (excludePicked) {
      availableNames = cls.students.filter(name => !history.includes(name));
    }

    if (availableNames.length === 0) {
      alert('所有学生都已被点到！请清空记录或取消排除已点名学生。');
      return;
    }

    setIsRolling(true);
    setPickedName('');
    setShowResult(false);

    let speed = 60;
    let count = 0;

    const roll = () => {
      const randomIdx = Math.floor(Math.random() * availableNames.length);
      setCurrentName(availableNames[randomIdx]);
      count++;

      // 逐渐减速
      if (count > 15) speed = 100;
      if (count > 25) speed = 150;
      if (count > 35) speed = 250;
      if (count > 42) {
        stopRolling();
        return;
      }

      rollIntervalRef.current = setTimeout(roll, speed);
    };

    roll();
  };

  const stopRolling = () => {
    if (rollIntervalRef.current) {
      clearTimeout(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    setIsRolling(false);

    const cls = classes.find(c => c.id === selectedClassId);
    if (!cls) return;

    let availableNames = cls.students;
    if (excludePicked) {
      availableNames = cls.students.filter(name => !history.includes(name));
    }

    if (availableNames.length > 0) {
      const finalName = currentName || availableNames[Math.floor(Math.random() * availableNames.length)];
      setPickedName(finalName);
      setShowResult(true);
      setHistory(prev => [finalName, ...prev]);
    }
  };

  const resetHistory = () => {
    setHistory([]);
    setPickedName('');
    setShowResult(false);
    setCurrentName('');
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearTimeout(rollIntervalRef.current);
      }
    };
  }, []);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const availableCount = selectedClass
    ? excludePicked
      ? selectedClass.students.filter(n => !history.includes(n)).length
      : selectedClass.students.length
    : 0;

  // 密码验证页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-colors duration-300 flex items-center justify-center pt-20 px-6 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg shadow-slate-500/30">
                🔒
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                教师模块
              </h1>
              <p className="text-white/60 text-sm">
                请输入访问密码
              </p>
            </div>
            <div className="p-8 pt-0">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    访问密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="请输入密码"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-400">
                      {passwordError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-500 hover:to-slate-600 transition-all shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 transform hover:-translate-y-0.5"
                >
                  🔓 验证访问
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-white/40 hover:text-white/70 text-sm transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-100 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900 transition-colors duration-300 pt-20 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-slate-400/20 dark:bg-slate-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-400/20 dark:bg-slate-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12 relative z-10">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回首页</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mindmap')}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-600/30 group"
            >
              <Network size={16} />
              <span>知识思维导图</span>
              <span className="w-px h-4 bg-white/30 mx-0.5"></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('/mindmap', '_blank', 'noopener,noreferrer,width=1400,height=900');
                }}
                title="弹出独立窗口"
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
              >
                <ExternalLink size={13} />
              </button>
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors border border-white/40 dark:border-gray-700"
            >
              <Lock size={16} />
              锁定
            </button>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-200 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            智能课堂管理
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-red-500 bg-clip-text text-transparent mb-3">
            班级管理与随机点名
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            上传班级名单表格，一键随机点名，让课堂互动更有趣
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 左侧：班级管理 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 上传按钮 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-600 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                班级列表
              </h2>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl font-medium hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-600/30 hover:shadow-slate-600/50 hover:-translate-y-0.5"
              >
                <Upload size={18} />
                上传班级表格
              </button>
            </div>

            {/* 班级列表 */}
            {classes.length === 0 ? (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg p-16 text-center border border-white/60 dark:border-gray-700/60">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">还没有班级数据</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">点击右上角"上传班级表格"开始</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border transition-all ${
                      selectedClassId === cls.id
                        ? 'border-slate-500 dark:border-slate-600 shadow-slate-300 dark:shadow-slate-800/30'
                        : 'border-white/60 dark:border-gray-700/60 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between p-5">
                      <button
                        onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {expandedClass === cls.id ? (
                          <ChevronDown size={20} className="text-slate-500" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-600 flex items-center justify-center text-white font-bold shadow-md">
                          {cls.students.length}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{cls.name}</h3>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {cls.students.length} 名学生 · {new Date(cls.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setPickedName('');
                            setHistory([]);
                            setShowResult(false);
                            setExpandedClass(null);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedClassId === cls.id
                              ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <UserCheck size={16} className="inline mr-1" />
                          点名
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* 展开学生列表 */}
                    {expandedClass === cls.id && (
                      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {cls.students.map((name, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg text-sm border border-gray-100 dark:border-gray-700"
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-gray-700 dark:text-gray-200 truncate">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：随机点名 */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/60 dark:border-gray-700/60 sticky top-24">
              <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-red-500 p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <h2 className="text-lg font-bold flex items-center gap-2 relative">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Play size={16} />
                  </div>
                  随机点名
                </h2>
              </div>

              <div className="p-6">
                {/* 未选择班级 */}
                {!selectedClassId && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-200 dark:from-slate-800/30 dark:to-slate-800/30 flex items-center justify-center text-4xl">
                      👆
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      请从左侧选择一个班级
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      开始随机点名
                    </p>
                  </div>
                )}

                {selectedClassId && selectedClass && (
                  <>
                    {/* 班级信息 */}
                    <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">当前班级</div>
                        <div className="font-bold text-gray-900 dark:text-white">{selectedClass.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">可选 / 总数</div>
                        <div className="font-bold text-slate-700 dark:text-slate-500">
                          {availableCount} <span className="text-gray-400 font-normal">/ {selectedClass.students.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* 排除已点名 */}
                    <label className="flex items-center gap-2 mb-5 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={excludePicked}
                          onChange={(e) => setExcludePicked(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-slate-600 peer-checked:to-slate-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">排除已点名学生</span>
                    </label>

                    {/* 点名显示区 */}
                    <div className={`relative rounded-2xl mb-5 overflow-hidden transition-all duration-500 ${
                      isRolling
                        ? 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-100 dark:from-slate-800/40 dark:via-slate-800/30 dark:to-slate-800/20'
                        : showResult
                        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/10'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50'
                    }`}>
                      {/* 滚动时的动态光效 */}
                      {isRolling && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s linear infinite' }}></div>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 via-slate-600 to-slate-600" style={{ animation: 'borderGlow 1s ease-in-out infinite' }}></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 via-slate-600 to-slate-600" style={{ animation: 'borderGlow 1s ease-in-out infinite' }}></div>
                          {/* 旋转粒子 */}
                          <div className="absolute top-4 left-4 w-2 h-2 bg-slate-500 rounded-full" style={{ animation: 'floatParticle 2s ease-in-out infinite' }}></div>
                          <div className="absolute top-6 right-6 w-2 h-2 bg-slate-500 rounded-full" style={{ animation: 'floatParticle 2.5s ease-in-out infinite 0.5s' }}></div>
                          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-slate-500 rounded-full" style={{ animation: 'floatParticle 2.2s ease-in-out infinite 0.3s' }}></div>
                          <div className="absolute bottom-4 right-4 w-2 h-2 bg-rose-400 rounded-full" style={{ animation: 'floatParticle 2.8s ease-in-out infinite 0.8s' }}></div>
                        </>
                      )}

                      {/* 结果庆祝光效 */}
                      {showResult && !isRolling && (
                        <>
                          <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-300/40 rounded-full blur-2xl" style={{ animation: 'glowPulse 2s ease-in-out infinite' }}></div>
                          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-300/40 rounded-full blur-2xl" style={{ animation: 'glowPulse 2s ease-in-out infinite 0.5s' }}></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl" style={{ animation: 'glowPulse 1.5s ease-in-out infinite' }}></div>
                          {/* 庆祝彩带 */}
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1.5 h-4 rounded-full"
                              style={{
                                left: `${8 + i * 9}%`,
                                top: '40%',
                                backgroundColor: ['#fbbf24', '#ec4899', '#a855f7', '#6366f1', '#f43f5e', '#eab308', '#f97316', '#d946ef', '#10b981', '#06b6d4'][i],
                                animation: `confettiFall 1.4s ease-out ${i * 0.07}s forwards`,
                              }}
                            />
                          ))}
                        </>
                      )}

                      <div className="relative p-8 text-center min-h-[260px] flex flex-col items-center justify-center">
                        {isRolling ? (
                          <>
                            <div className="text-xs text-slate-700 dark:text-slate-400 font-bold mb-4 tracking-[0.3em] uppercase" style={{ animation: 'pulse 1s ease-in-out infinite' }}>
                              ◆ 正在抽取中 ◆
                            </div>
                            {/* 大号姓名显示 */}
                            <div className="relative">
                              <div
                                key={currentName}
                                className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-700 to-slate-600 tracking-wide"
                                style={{
                                  animation: 'nameFlash 0.15s ease-out',
                                  filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.4))',
                                }}
                              >
                                {currentName || '...'}
                              </div>
                            </div>
                            {/* 滚动姓名条 */}
                            <div className="mt-6 flex gap-1.5 justify-center flex-wrap max-w-xs">
                              {selectedClass.students.slice(0, 10).map((s, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded-md transition-all duration-150 ${
                                    s === currentName
                                      ? 'bg-gradient-to-r from-slate-600 to-slate-600 text-white scale-125 shadow-md shadow-slate-600/50 font-bold'
                                      : 'bg-gray-200/50 dark:bg-gray-600/50 text-gray-400'
                                  }`}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : showResult && pickedName ? (
                          <>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-3 tracking-[0.3em] uppercase">
                              ✦ 恭喜被点到 ✦
                            </div>
                            <div
                              className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 tracking-wide"
                              style={{
                                animation: 'resultPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                filter: 'drop-shadow(0 6px 30px rgba(251, 146, 60, 0.5))',
                              }}
                            >
                              {pickedName}
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full backdrop-blur-sm">
                              <Sparkles size={14} className="text-slate-500" />
                              <span>第 <span className="font-bold text-slate-700 dark:text-slate-500">{history.length}</span> 位被点到的同学</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-200 dark:from-slate-800/30 dark:to-slate-800/30 flex items-center justify-center text-4xl" style={{ animation: 'floatSlow 3s ease-in-out infinite' }}>
                              🎯
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-base font-bold mb-1">
                              准备开始点名
                            </div>
                            <div className="text-gray-400 dark:text-gray-500 text-xs">
                              点击下方按钮抽取幸运同学
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex gap-3 mb-5">
                      {!isRolling ? (
                        <button
                          onClick={startRolling}
                          disabled={availableCount === 0}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-600/30 hover:shadow-slate-600/50 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          <Play size={20} />
                          {showResult ? '再抽一次' : '开始点名'}
                        </button>
                      ) : (
                        <button
                          onClick={stopRolling}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30"
                        >
                          <Pause size={20} />
                          停止
                        </button>
                      )}
                      <button
                        onClick={resetHistory}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="清空点名记录"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>

                    {/* 点名记录 */}
                    {history.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            点名记录
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 rounded-full font-medium">
                            {history.length} 人
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {history.map((name, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                                idx === 0
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/30'
                                  : 'bg-gray-50 dark:bg-gray-700/50'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                idx === 0
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md'
                                  : 'bg-slate-200 dark:bg-slate-800/30 text-slate-700 dark:text-slate-500'
                              }`}>
                                {idx === 0 ? '★' : idx + 1}
                              </span>
                              <span className={`font-medium ${idx === 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                {name}
                              </span>
                              {idx === 0 && (
                                <span className="ml-auto text-xs text-green-500 dark:text-green-400 font-medium">最新</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 上传弹窗 */}
      {showUpload && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowUpload(false);
            setNewClassName('');
            setUploadedFile(null);
            setPreviewStudents([]);
            setUploadError('');
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-red-500 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center justify-between relative">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  上传班级表格
                </h2>
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setNewClassName('');
                    setUploadedFile(null);
                    setPreviewStudents([]);
                    setUploadError('');
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* 班级名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  班级名称
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="例如：高一(3)班"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择表格文件
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/10 transition-all cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <FileSpreadsheet size={28} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">点击重新选择</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-200 to-slate-200 dark:from-slate-800/30 dark:to-slate-800/30 flex items-center justify-center">
                        <Upload size={28} className="text-slate-600" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">点击选择文件</p>
                      <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls, .csv 格式</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                  💡 表格中需包含"姓名"列，或第一列为学生姓名
                </p>
              </div>

              {/* 错误提示 */}
              {uploadError && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  {uploadError}
                </div>
              )}

              {/* 预览 */}
              {previewStudents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      预览 ({previewStudents.length} 名学生)
                    </label>
                  </div>
                  {detectedInfo && (
                    <div className="mb-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs flex items-center gap-1.5 border border-green-100 dark:border-green-900/30">
                      <Sparkles size={12} />
                      {detectedInfo}
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {previewStudents.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm shadow-sm flex items-center gap-1.5"
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 确认按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setNewClassName('');
                    setUploadedFile(null);
                    setPreviewStudents([]);
                    setUploadError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={!newClassName.trim() || previewStudents.length === 0 || fileSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fileSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      保存中...
                    </>
                  ) : (
                    <>确认上传</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识思维导图弹窗 */}
      {showMindMap && <MindMapModal onClose={() => setShowMindMap(false)} />}

      {/* 动画样式 */}
      <style>{`
        @keyframes nameFlash {
          0% { opacity: 0.3; transform: translateY(8px) scale(0.92); }
          50% { opacity: 1; transform: translateY(0) scale(1.06); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes resultPop {
          0% { opacity: 0; transform: scale(0.2) rotate(-8deg); }
          30% { opacity: 1; transform: scale(1.2) rotate(4deg); }
          60% { transform: scale(0.95) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.6; transform: scaleX(0.8); }
          50% { opacity: 1; transform: scaleX(1); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-12px) scale(1.3); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(120px) rotate(540deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
