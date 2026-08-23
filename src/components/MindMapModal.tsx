import { useState, useEffect, useRef } from 'react';
import { X, Plus, Pencil, Trash2, Check, Network, RotateCcw, ChevronDown, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
}

const STORAGE_KEY = 'teacher_mindmap_data';
const STORAGE_VERSION = 6;

const defaultTree: MindNode = {
  "id": "root",
  "text": "高中信息技术全套知识总导图",
  "children": [
    {
      "id": "n0",
      "text": "模块1 认识数据与大数据",
      "children": [
        {
          "id": "n1",
          "text": "1.1 数据、信息与知识",
          "children": [
            {
              "id": "n2",
              "text": "数据",
              "children": [
                {
                  "id": "n3",
                  "text": "定义：描述事物的符号记录，是信息的载体",
                  "children": []
                },
                {
                  "id": "n4",
                  "text": "数据类型：数值、文字、图像、音频、视频",
                  "children": []
                },
                {
                  "id": "n5",
                  "text": "数据特征",
                  "children": [
                    {
                      "id": "n6",
                      "text": "二进制存储：计算机内部0/1存储加工",
                      "children": []
                    },
                    {
                      "id": "n7",
                      "text": "语义性：符号赋予含义才产生价值",
                      "children": []
                    },
                    {
                      "id": "n8",
                      "text": "分散性：分散记录客观事物状态",
                      "children": []
                    },
                    {
                      "id": "n9",
                      "text": "多样性、感知性：图形、音视频等多种形式",
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "n10",
              "text": "信息",
              "children": [
                {
                  "id": "n11",
                  "text": "定义：经过加工处理的数据，消除认知不确定性",
                  "children": []
                },
                {
                  "id": "n12",
                  "text": "信息特征",
                  "children": [
                    {
                      "id": "n13",
                      "text": "依附性：必须依附载体传播存储",
                      "children": []
                    },
                    {
                      "id": "n14",
                      "text": "时效性&价值性：随时间价值改变",
                      "children": []
                    },
                    {
                      "id": "n15",
                      "text": "传递性、共享性：可复制传播分享",
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "n16",
              "text": "知识",
              "children": [
                {
                  "id": "n17",
                  "text": "定义：社会实践得到的认识、经验总和；信息提炼内化得到",
                  "children": []
                }
              ]
            },
            {
              "id": "n18",
              "text": "四层递进关系：数据 →加工赋予含义→ 信息 →提炼归纳内化→ 知识 →实践升华→ 智慧",
              "children": []
            }
          ]
        },
        {
          "id": "n19",
          "text": "1.2 数字化与编码",
          "children": [
            {
              "id": "n20",
              "text": "数制：二进制、十进制、十六进制相互转换",
              "children": []
            },
            {
              "id": "n21",
              "text": "字符编码：ASCII编码、Unicode通用编码",
              "children": []
            },
            {
              "id": "n22",
              "text": "多媒体存储容量计算",
              "children": [
                {
                  "id": "n23",
                  "text": "音频容量 = 采样频率 × 量化位数 × 声道数 × 时长 ÷ 8",
                  "children": []
                },
                {
                  "id": "n24",
                  "text": "图像容量 = 水平像素数 × 垂直像素数 × 颜色深度 ÷ 8",
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "n25",
          "text": "1.3 数据科学与大数据",
          "children": [
            {
              "id": "n26",
              "text": "数据科学兴起条件",
              "children": [
                {
                  "id": "n27",
                  "text": "计算机技术革新，提升数据处理能力",
                  "children": []
                },
                {
                  "id": "n28",
                  "text": "物联网、智能终端产生海量原始数据",
                  "children": []
                }
              ]
            },
            {
              "id": "n29",
              "text": "大数据四大特征",
              "children": [
                {
                  "id": "n30",
                  "text": "巨量性：数据体量规模庞大",
                  "children": []
                },
                {
                  "id": "n31",
                  "text": "多样性：数据格式类型繁多",
                  "children": []
                },
                {
                  "id": "n32",
                  "text": "迅变性：数据生成快，需要快速处理",
                  "children": []
                },
                {
                  "id": "n33",
                  "text": "价值性：海量数据，有效价值占比很小",
                  "children": []
                }
              ]
            },
            {
              "id": "n34",
              "text": "大数据五大核心技术",
              "children": [
                {
                  "id": "n35",
                  "text": "采集技术：传感器、社交网络采集海量多源数据",
                  "children": []
                },
                {
                  "id": "n36",
                  "text": "预处理技术：数据清洗、集成、转换、规约，提升数据质量",
                  "children": []
                },
                {
                  "id": "n37",
                  "text": "存储管理技术：云存储、数据中心完成存储调度",
                  "children": []
                },
                {
                  "id": "n38",
                  "text": "分析挖掘技术：从海量数据挖掘潜在价值信息",
                  "children": []
                },
                {
                  "id": "n39",
                  "text": "可视化应用技术：图形化直观展示分析结果",
                  "children": []
                }
              ]
            },
            {
              "id": "n40",
              "text": "大数据应用场景",
              "children": [
                {
                  "id": "n41",
                  "text": "生活服务｜智慧城市｜医疗健康｜社区管理",
                  "children": []
                }
              ]
            },
            {
              "id": "n42",
              "text": "大数据弊端与对策",
              "children": [
                {
                  "id": "n43",
                  "text": "问题：信息茧房、大数据杀熟、隐私风险",
                  "children": []
                },
                {
                  "id": "n44",
                  "text": "对策：拓展多元信息源、批判性思维、清理算法推荐偏好",
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "n45",
      "text": "模块2 算法与程序设计",
      "children": [
        {
          "id": "n46",
          "text": "2.1 用计算机解决问题",
          "children": [
            {
              "id": "n47",
              "text": "完整流程：分析问题 → 设计算法 → 编写程序 → 调试运行",
              "children": []
            }
          ]
        },
        {
          "id": "n48",
          "text": "2.2 算法的概念及描述",
          "children": [
            {
              "id": "n49",
              "text": "算法定义：解决问题的有限确定步骤",
              "children": []
            },
            {
              "id": "n50",
              "text": "算法五大特征：有穷性｜确定性｜输入｜输出｜可行性",
              "children": []
            },
            {
              "id": "n51",
              "text": "算法描述方式：自然语言、流程图、伪代码",
              "children": []
            }
          ]
        },
        {
          "id": "n52",
          "text": "2.3 程序设计基本知识",
          "children": [
            {
              "id": "n53",
              "text": "基础要素：常量、变量、运算符、表达式",
              "children": []
            },
            {
              "id": "n54",
              "text": "三大程序控制结构",
              "children": [
                {
                  "id": "n55",
                  "text": "顺序结构：语句从上到下依次执行",
                  "children": []
                },
                {
                  "id": "n56",
                  "text": "选择结构：if / if‑else，按条件分支执行",
                  "children": []
                },
                {
                  "id": "n57",
                  "text": "循环结构：for、while，循环重复执行代码块",
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "n58",
          "text": "2.4 基于算法的问题解决",
          "children": [
            {
              "id": "n59",
              "text": "解析算法：利用数学公式直接计算求解",
              "children": []
            },
            {
              "id": "n60",
              "text": "枚举算法：遍历全部候选，筛选符合条件解",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "n61",
      "text": "模块3 数据处理与数据分析",
      "children": [
        {
          "id": "n62",
          "text": "3.1 数据处理一般过程",
          "children": [
            {
              "id": "n63",
              "text": "流程：数据采集 → 数据整理 → 数据分析 → 数据可视化 → 输出报告",
              "children": []
            }
          ]
        },
        {
          "id": "n64",
          "text": "3.2 数据采集与整理",
          "children": [
            {
              "id": "n65",
              "text": "采集渠道：问卷、传感器、网络爬虫、公开数据集",
              "children": []
            },
            {
              "id": "n66",
              "text": "数据整理：去重、填补缺失值、处理异常脏数据",
              "children": []
            }
          ]
        },
        {
          "id": "n67",
          "text": "3.3 数据分析与可视化",
          "children": [
            {
              "id": "n68",
              "text": "数据分析手段：统计、对比、相关性分析",
              "children": []
            },
            {
              "id": "n69",
              "text": "可视化图表：柱状图、折线图、饼图、热力图等",
              "children": []
            }
          ]
        },
        {
          "id": "n70",
          "text": "3.4 数据分析报告与应用",
          "children": [
            {
              "id": "n71",
              "text": "报告组成：背景说明、数据来源、分析过程、结论、优化建议",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "n72",
      "text": "模块4 人工智能",
      "children": [
        {
          "id": "n73",
          "text": "4.1 认识人工智能",
          "children": [
            {
              "id": "n74",
              "text": "AI概念：机器模拟、延伸人类智能",
              "children": []
            },
            {
              "id": "n75",
              "text": "核心基础技术：机器学习、深度学习、自然语言处理NLP",
              "children": []
            }
          ]
        },
        {
          "id": "n76",
          "text": "4.2 利用智能工具解决问题",
          "children": [
            {
              "id": "n77",
              "text": "常见人工智能工具",
              "children": [
                {
                  "id": "n78",
                  "text": "北斗导航系统：无源定位；军事、航海、交通民用",
                  "children": []
                },
                {
                  "id": "n79",
                  "text": "人脸识别技术",
                  "children": [
                    {
                      "id": "n80",
                      "text": "流程：人脸采集 →预处理 →特征提取 →匹配识别",
                      "children": []
                    },
                    {
                      "id": "n81",
                      "text": "场景：手机解锁、门禁、安防身份核验",
                      "children": []
                    }
                  ]
                },
                {
                  "id": "n82",
                  "text": "对话机器人：基于NLP；客服、教育智能问答、智能投顾",
                  "children": []
                },
                {
                  "id": "n83",
                  "text": "其他工具：机器作诗、AI图像生成",
                  "children": []
                }
              ]
            },
            {
              "id": "n84",
              "text": "课堂体验活动：人机创作对比；分享AI类移动App",
              "children": []
            },
            {
              "id": "n85",
              "text": "实践项目：智能班级交互系统开发",
              "children": [
                {
                  "id": "n86",
                  "text": "确定目标内容，选择分享形式",
                  "children": []
                },
                {
                  "id": "n87",
                  "text": "账号管理：账号类型、权限分级、管理制度",
                  "children": []
                },
                {
                  "id": "n88",
                  "text": "对接公众号平台、开发接口、测试迭代优化",
                  "children": []
                }
              ]
            },
            {
              "id": "n89",
              "text": "多元评价体系",
              "children": [
                {
                  "id": "n90",
                  "text": "评价主体：教师评价｜学生自评｜学生互评",
                  "children": []
                },
                {
                  "id": "n91",
                  "text": "评价维度：过程评价｜结果评价｜综合评价",
                  "children": []
                },
                {
                  "id": "n92",
                  "text": "附加评价：课堂参与度、小组项目合作表现",
                  "children": []
                }
              ]
            }
          ]
        },
        {
          "id": "n93",
          "text": "4.3 人工智能的应用与影响",
          "children": [
            {
              "id": "n94",
              "text": "多行业实际应用",
              "children": [
                {
                  "id": "n95",
                  "text": "医疗领域：辅助影像诊断、药物研发、个性化治疗",
                  "children": []
                },
                {
                  "id": "n96",
                  "text": "工业领域：自动化生产、智能制造、供应链优化",
                  "children": []
                },
                {
                  "id": "n97",
                  "text": "金融领域：风险评估、投资策略、智能客服投顾",
                  "children": []
                },
                {
                  "id": "n98",
                  "text": "交通领域：智能交通调度、自动驾驶研发",
                  "children": []
                }
              ]
            },
            {
              "id": "n99",
              "text": "人工智能优势",
              "children": [
                {
                  "id": "n100",
                  "text": "处理海量数据，提取有效信息",
                  "children": []
                },
                {
                  "id": "n101",
                  "text": "自动完成数据分析、预测、决策任务",
                  "children": []
                },
                {
                  "id": "n102",
                  "text": "优化现有系统，提升整体效率性能",
                  "children": []
                }
              ]
            },
            {
              "id": "n103",
              "text": "AI挑战与伦理道德风险",
              "children": [
                {
                  "id": "n104",
                  "text": "个人隐私风险：数据集中，敏感信息泄露滥用",
                  "children": []
                },
                {
                  "id": "n105",
                  "text": "伦理困境：自动驾驶抉择、医疗算法失误责任",
                  "children": []
                },
                {
                  "id": "n106",
                  "text": "数据偏见与算法歧视：训练数据带来不公平输出",
                  "children": []
                }
              ]
            },
            {
              "id": "n107",
              "text": "社会责任以及应对策略",
              "children": [
                {
                  "id": "n108",
                  "text": "提供可持续方案：能源优化、智慧城市资源调配",
                  "children": []
                },
                {
                  "id": "n109",
                  "text": "保障公共利益、社会安全",
                  "children": []
                },
                {
                  "id": "n110",
                  "text": "推动创新，促进教育公平、文化遗产保护传承",
                  "children": []
                }
              ]
            },
            {
              "id": "n111",
              "text": "智能信息处理未来发展趋势",
              "children": [
                {
                  "id": "n112",
                  "text": "机器学习大规模普及落地",
                  "children": []
                },
                {
                  "id": "n113",
                  "text": "自然语言处理技术持续深化",
                  "children": []
                },
                {
                  "id": "n114",
                  "text": "智能制造深度改造生产行业",
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "n115",
      "text": "模块5 信息社会",
      "children": [
        {
          "id": "n116",
          "text": "5.1 信息技术及其应用",
          "children": [
            {
              "id": "n117",
              "text": "信息技术：传感技术、通信技术、计算机技术、控制技术",
              "children": []
            },
            {
              "id": "n118",
              "text": "对学习、生活、生产带来的双面影响",
              "children": []
            }
          ]
        },
        {
          "id": "n119",
          "text": "5.2 认识信息社会",
          "children": [
            {
              "id": "n120",
              "text": "四大特征：数字生活、信息经济、在线政府、数字文化",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "n121",
      "text": "模块6 信息系统",
      "children": [
        {
          "id": "n122",
          "text": "6.1 信息系统的组成与功能",
          "children": [
            {
              "id": "n123",
              "text": "五大组成要素：硬件、软件、数据、通信网络、人",
              "children": []
            }
          ]
        },
        {
          "id": "n124",
          "text": "6.2 信息系统开发过程",
          "children": [
            {
              "id": "n125",
              "text": "需求分析 →系统设计 →开发实现 →测试部署 →维护迭代",
              "children": []
            }
          ]
        },
        {
          "id": "n126",
          "text": "6.3 信息系统优势与局限性",
          "children": [
            {
              "id": "n127",
              "text": "优势：高效便捷、资源共享、协同工作",
              "children": []
            },
            {
              "id": "n128",
              "text": "局限：依赖网络硬件、系统故障风险、数据安全隐患",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "n129",
      "text": "模块7 信息系统软硬件与通信网络",
      "children": [
        {
          "id": "n130",
          "text": "7.1 信息系统中的计算机与移动终端",
          "children": [
            {
              "id": "n131",
              "text": "计算机硬件基础；移动终端设备特点",
              "children": []
            }
          ]
        },
        {
          "id": "n132",
          "text": "7.2 通信网络",
          "children": [
            {
              "id": "n133",
              "text": "带宽与网络接入方式",
              "children": []
            },
            {
              "id": "n134",
              "text": "IP地址、域名基础概念",
              "children": []
            },
            {
              "id": "n135",
              "text": "无线局域网组建原理",
              "children": []
            }
          ]
        },
        {
          "id": "n136",
          "text": "7.3 信息系统中的软件",
          "children": [
            {
              "id": "n137",
              "text": "系统软件；应用软件，二者区分",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "n138",
      "text": "模块8 信息安全与信息社会责任",
      "children": [
        {
          "id": "n139",
          "text": "8.1 信息安全风险与防范",
          "children": [
            {
              "id": "n140",
              "text": "安全风险：病毒木马、网络钓鱼、数据泄露、网络攻击",
              "children": []
            },
            {
              "id": "n141",
              "text": "防范手段：高强度密码、数据备份、辨别诈骗、安全软件",
              "children": []
            }
          ]
        },
        {
          "id": "n142",
          "text": "8.2 信息社会责任",
          "children": [
            {
              "id": "n143",
              "text": "保护个人与他人隐私",
              "children": []
            },
            {
              "id": "n144",
              "text": "尊重知识产权",
              "children": []
            },
            {
              "id": "n145",
              "text": "遵守网络法律法规，网络文明",
              "children": []
            },
            {
              "id": "n146",
              "text": "人工智能时代伦理规范，理性使用AI技术",
              "children": []
            }
          ]
        }
      ]
    }
  ]
};

function loadTree(): MindNode {
  try {
    const version = localStorage.getItem(STORAGE_KEY + '_version');
    const data = localStorage.getItem(STORAGE_KEY);
    if (data && version === String(STORAGE_VERSION)) return JSON.parse(data);
  } catch { /* ignore */ }
  return defaultTree;
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function addNode(tree: MindNode, parentId: string, id: string, text: string): MindNode {
  if (tree.id === parentId) return { ...tree, children: [...tree.children, { id, text, children: [] }] };
  return { ...tree, children: tree.children.map(c => addNode(c, parentId, id, text)) };
}
function updateNode(tree: MindNode, id: string, text: string): MindNode {
  if (tree.id === id) return { ...tree, text };
  return { ...tree, children: tree.children.map(c => updateNode(c, id, text)) };
}
function deleteNode(tree: MindNode, id: string): MindNode {
  return { ...tree, children: tree.children.filter(c => c.id !== id).map(c => deleteNode(c, id)) };
}

// ===== Layer styles: glassmorphism + left accent bar =====
interface LayerStyle {
  cardBase: string;    // base bg/text
  size: string;
  accent: string;      // border-left accent color (Tailwind arbitrary or class)
  accentStyle: string; // inline style for gradient stripe
  glow: string;        // hover glow color
  lineColor: string;   // CSS variable value for lines
  lineGlow: string;    // CSS variable value for line glow
}

function layerStyle(level: number, isDark: boolean): LayerStyle {
  if (level === 0) return {
    cardBase: 'text-white shadow-2xl ring-2 ring-white/40 border-0 backdrop-blur-md',
    size: 'px-6 py-3.5 text-base md:text-lg font-bold min-w-[220px] max-w-[340px] rounded-2xl',
    accent: '',
    accentStyle: 'linear-gradient(135deg,#a855f7 0%,#d946ef 45%,#ec4899 100%)',
    glow: 'rgba(236,72,153,0.45)',
    lineColor: 'rgba(217,70,239,0.8)',
    lineGlow: 'rgba(217,70,239,0.5)',
  };
  if (level === 1) return isDark
    ? {
        cardBase: 'bg-white/10 backdrop-blur-md text-white shadow-xl border border-white/15',
        size: 'px-4 py-2.5 text-sm font-semibold min-w-[160px] max-w-[240px] rounded-xl',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
        glow: 'rgba(99,102,241,0.45)',
        lineColor: 'rgba(139,92,246,0.75)',
        lineGlow: 'rgba(139,92,246,0.45)',
      }
    : {
        cardBase: 'bg-white/80 backdrop-blur-md text-indigo-900 shadow-xl border border-indigo-100',
        size: 'px-4 py-2.5 text-sm font-semibold min-w-[160px] max-w-[240px] rounded-xl',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
        glow: 'rgba(99,102,241,0.35)',
        lineColor: 'rgba(99,102,241,0.75)',
        lineGlow: 'rgba(99,102,241,0.4)',
      };
  if (level === 2) return isDark
    ? {
        cardBase: 'bg-white/8 backdrop-blur text-white shadow-lg border border-white/10',
        size: 'px-3 py-2 text-sm font-medium min-w-[140px] max-w-[210px] rounded-xl',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)',
        glow: 'rgba(14,165,233,0.45)',
        lineColor: 'rgba(6,182,212,0.7)',
        lineGlow: 'rgba(6,182,212,0.4)',
      }
    : {
        cardBase: 'bg-white/85 backdrop-blur text-slate-800 shadow-lg border border-sky-100',
        size: 'px-3 py-2 text-sm font-medium min-w-[140px] max-w-[210px] rounded-xl',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)',
        glow: 'rgba(14,165,233,0.35)',
        lineColor: 'rgba(14,165,233,0.7)',
        lineGlow: 'rgba(14,165,233,0.35)',
      };
  if (level === 3) return isDark
    ? {
        cardBase: 'bg-white/6 backdrop-blur text-white shadow-md border border-white/10',
        size: 'px-3 py-1.5 text-xs font-medium min-w-[125px] max-w-[190px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)',
        glow: 'rgba(20,184,166,0.4)',
        lineColor: 'rgba(20,184,166,0.65)',
        lineGlow: 'rgba(20,184,166,0.35)',
      }
    : {
        cardBase: 'bg-white/90 backdrop-blur text-slate-700 shadow-md border border-emerald-100',
        size: 'px-3 py-1.5 text-xs font-medium min-w-[125px] max-w-[190px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)',
        glow: 'rgba(20,184,166,0.3)',
        lineColor: 'rgba(20,184,166,0.65)',
        lineGlow: 'rgba(20,184,166,0.3)',
      };
  if (level === 4) return isDark
    ? {
        cardBase: 'bg-white/5 backdrop-blur text-gray-100 shadow border border-white/10',
        size: 'px-2.5 py-1.2 text-[11px] font-medium min-w-[115px] max-w-[175px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)',
        glow: 'rgba(249,115,22,0.4)',
        lineColor: 'rgba(245,158,11,0.65)',
        lineGlow: 'rgba(245,158,11,0.3)',
      }
    : {
        cardBase: 'bg-white/95 backdrop-blur text-slate-700 shadow border border-amber-100',
        size: 'px-2.5 py-1.2 text-[11px] font-medium min-w-[115px] max-w-[175px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)',
        glow: 'rgba(249,115,22,0.3)',
        lineColor: 'rgba(245,158,11,0.65)',
        lineGlow: 'rgba(245,158,11,0.3)',
      };
  return isDark
    ? {
        cardBase: 'bg-gray-800/70 backdrop-blur text-gray-200 shadow border border-white/10',
        size: 'px-2.5 py-1 text-[10px] min-w-[105px] max-w-[160px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#9ca3af 0%,#6b7280 100%)',
        glow: 'rgba(156,163,175,0.25)',
        lineColor: 'rgba(156,163,175,0.5)',
        lineGlow: 'rgba(156,163,175,0.2)',
      }
    : {
        cardBase: 'bg-white/95 backdrop-blur text-slate-600 shadow-sm border border-gray-200',
        size: 'px-2.5 py-1 text-[10px] min-w-[105px] max-w-[160px] rounded-lg',
        accent: '',
        accentStyle: 'linear-gradient(135deg,#9ca3af 0%,#6b7280 100%)',
        glow: 'rgba(156,163,175,0.25)',
        lineColor: 'rgba(156,163,175,0.55)',
        lineGlow: 'rgba(156,163,175,0.25)',
      };
}

// Root uses inline gradient instead of Tailwind arbitrary
function rootBgStyle(isDark: boolean) {
  return { background: 'linear-gradient(135deg,#7c3aed 0%,#c026d3 45%,#ec4899 100%)' };
}

interface NodeCardProps {
  node: MindNode;
  level: number;
  editing: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onAdd: (parentId: string) => void;
  onStartEdit: (id: string) => void;
  onCommitEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

function NodeCard({ node, level, editing, hasChildren, collapsed, onToggle, onAdd, onStartEdit, onCommitEdit, onCancelEdit, onDelete }: NodeCardProps) {
  const [text, setText] = useState(node.text);
  const [isDark, setIsDark] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (editing) {
      setText(node.text);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, node.text]);

  const commit = () => {
    const t = text.trim();
    if (t) onCommitEdit(node.id, t);
    else onCancelEdit();
  };

  const ls = layerStyle(level, isDark);
  const isRoot = level === 0;

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1.5 relative z-20">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          onBlur={commit}
          className="px-3.5 py-2 rounded-xl border-2 border-fuchsia-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none w-56 shadow-lg ring-4 ring-fuchsia-200/50 dark:ring-fuchsia-500/30"
        />
        <button onClick={commit} className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform ring-2 ring-white/50">
          <Check size={16} />
        </button>
      </div>
    );
  }

  // Build card wrapper with left accent stripe
  const cardShell = (
    <div
      className={
        'relative overflow-hidden card-shine node-pop ' +
        ls.cardBase + ' ' + ls.size +
        ' break-words text-center cursor-default select-none transition-all duration-300 ease-out ' +
        (level === 0 ? 'animate-pulse-slow ' : '')
      }
      style={
        level === 0
          ? { ...rootBgStyle(isDark), boxShadow: '0 10px 40px -8px ' + ls.glow + ', 0 4px 20px -4px ' + ls.glow }
          : {
              // left accent stripe via inset box-shadow or pseudo
              position: 'relative',
              boxShadow: '0 8px 24px -8px ' + ls.glow + ', inset 3px 0 0 0 transparent',
            }
      }
      title={node.text.length > 20 ? node.text : undefined}
    >
      {/* Left accent gradient stripe */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-1.5 rounded-l-[inherit]"
        style={{ background: ls.accentStyle, filter: 'saturate(1.1)' }}
      />
      {/* Hover outer glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 0 2px ' + (level === 0 ? 'rgba(255,255,255,0.35)' : ls.lineColor) + ', 0 0 30px -6px ' + ls.glow }}
      />
      {/* Content */}
      <span className="line-clamp-2 leading-snug inline-block align-middle relative z-[1]" style={{ paddingLeft: level === 0 ? 0 : 6 }}>
        {node.text}
      </span>
      {/* Collapsed badge */}
      {collapsed && hasChildren && (
        <span className="absolute -top-2.5 -right-2.5 z-[2] min-w-[28px] h-[22px] px-2 py-0.5 text-[10px] font-extrabold tabular-nums rounded-full text-white shadow-lg ring-2 ring-white/60 flex items-center justify-center"
          style={{ background: ls.accentStyle, filter: 'saturate(1.15)' }}>
          +{node.children.length}
        </span>
      )}
    </div>
  );

  return (
    <div className={'group relative inline-flex items-center ' + (level === 0 ? 'mm-root-card' : '')}>
      {/* Collapse/Expand Toggle */}
      {hasChildren && (
        <button
          onClick={onToggle}
          title={collapsed ? '展开子节点' : '折叠子节点'}
          className="absolute z-30 flex items-center justify-center transition-all duration-200"
          style={{
            right: -24, top: '50%', transform: 'translateY(-50%)',
            width: 20, height: 20, borderRadius: 9999,
            background: isDark
              ? 'radial-gradient(circle at 30% 30%, #1f2937, #111827)'
              : 'radial-gradient(circle at 30% 30%, #ffffff, #f3e8ff)',
            border: '2px solid ' + ls.lineColor,
            color: ls.lineColor,
            boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 0 18px -4px ' + ls.lineGlow + ', 0 4px 10px -4px rgba(0,0,0,0.15)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          {collapsed ? <ChevronRight size={11} strokeWidth={3} /> : <ChevronDown size={11} strokeWidth={3} />}
        </button>
      )}
      {cardShell}
      {/* Action buttons floating */}
      <div className="absolute -top-3 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-250 ease-out z-40 scale-90 group-hover:scale-100 translate-y-1 group-hover:translate-y-0">
        <button
          onClick={() => onAdd(node.id)}
          title="添加子节点"
          className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-2 ring-white/60 hover:ring-white/80"
          style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onStartEdit(node.id)}
          title="编辑"
          className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-2 ring-white/60 hover:ring-white/80"
          style={{ background: 'linear-gradient(135deg,#60a5fa,#4f46e5)' }}
        >
          <Pencil size={13} />
        </button>
        {!isRoot && (
          <button
            onClick={() => onDelete(node.id)}
            title="删除"
            className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-2 ring-white/60 hover:ring-white/80"
            style={{ background: 'linear-gradient(135deg,#fb7185,#dc2626)' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  node: MindNode;
  level: number;
  editingId: string | null;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onAdd: (parentId: string) => void;
  onStartEdit: (id: string) => void;
  onCommitEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

function TreeNode(p: TreeNodeProps) {
  const collapsed = p.collapsedIds.has(p.node.id);
  const hasChildren = p.node.children.length > 0;
  const childrenVisible = hasChildren && !collapsed;
  const levelClass = 'mm-lvl-' + p.level;
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const ls = layerStyle(p.level, isDark);
  // level-1 children lines draw from L1 parent so take L1 styling; we pass line style to parent li via --lc based on parent level minus 1
  const lineStyle = ls.lineColor;
  const lineGlow = ls.lineGlow;

  return (
    <li
      className={levelClass}
      style={{
        ['--lc' as any]: lineStyle,
        ['--lc-glow' as any]: lineGlow,
      }}
    >
      <NodeCard
        node={p.node}
        level={p.level}
        editing={p.editingId === p.node.id}
        hasChildren={hasChildren}
        collapsed={collapsed}
        onToggle={() => p.onToggleCollapse(p.node.id)}
        onAdd={p.onAdd}
        onStartEdit={p.onStartEdit}
        onCommitEdit={p.onCommitEdit}
        onCancelEdit={p.onCancelEdit}
        onDelete={p.onDelete}
      />
      {childrenVisible && (
        <ul>
          {p.node.children.map(child => (
            <TreeNode key={child.id} {...p} node={child} level={p.level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function getBgGradient(isDark: boolean): string {
  if (isDark) {
    return 'radial-gradient(ellipse 80% 50% at 10% -10%, #312e81 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 110% 10%, #4c1d95 0%, transparent 55%), radial-gradient(ellipse at 50% 120%, #831843 0%, transparent 55%), #020617';
  }
  return 'radial-gradient(ellipse 80% 50% at 10% -10%, #ede9fe 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 110% 10%, #fce7f3 0%, transparent 55%), radial-gradient(ellipse at 50% 120%, #fff1f2 0%, transparent 60%), #ffffff';
}

const CSS_STYLE = "@keyframes pulse-slow { 0%,100% { filter: drop-shadow(0 0 0 rgba(217,70,239,0)) drop-shadow(0 0 0 rgba(236,72,153,0)); } 50% { filter: drop-shadow(0 0 14px rgba(217,70,239,0.6)) drop-shadow(0 0 22px rgba(236,72,153,0.35)); } }\n.animate-pulse-slow { animation: pulse-slow 3.2s ease-in-out infinite; }\n@keyframes card-shine { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }\n.card-shine::after {\n  content: '';\n  position: absolute; inset: 0; overflow: hidden; pointer-events: none; border-radius: inherit;\n  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);\n  animation: card-shine 7s ease-in-out infinite;\n}\n@keyframes node-pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }\n.node-pop { animation: node-pop 0.25s ease-out both; }\n.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n/* ==== Dot-grid background: center-left fade (root leftmost anchor) ==== */\n.mm-canvas-dots::before {\n  content: '';\n  position: absolute; inset: 0; pointer-events: none;\n  background-image: radial-gradient(circle, rgba(168,85,247,0.14) 1px, transparent 1px);\n  background-size: 20px 20px;\n  mask-image: radial-gradient(ellipse 78% 82% at 4% 50%, #000 40%, transparent 96%);\n  -webkit-mask-image: radial-gradient(ellipse 78% 82% at 4% 50%, #000 40%, transparent 96%);\n  opacity: 0.9;\n}\n.dark .mm-canvas-dots::before {\n  background-image: radial-gradient(circle, rgba(192,132,252,0.18) 1px, transparent 1px);\n}\n/* ====== MARKMAP-STYLE LEFT-TO-RIGHT TREE ARCHITECTURE ======\n   4-piece system:\n   (A) VERTICAL TRUNK       = ul { border-left }       rainbow thick colored line on the LEFT of a sibling group\n   (B) PASS-THROUGH BEAD   = ul::before               colored bead on the trunk at the parent card's mid-height (where parent's horizontal arm enters)\n   (C) PARENT BRIDGE       = li > ul::after           STRAIGHT HORIZONTAL LINE from parent card right-mid into the trunk\n   (D) CHILD C-HOOK        = li::before               from each child's card LEFT-mid: go horizontally LEFT, then sweep UPWARD in a big-radius C-arc to visually 'curl back' to the parent level. Bead at li::after on the trunk.\n*/\n.mindmap-tree, .mindmap-tree ul {\n  list-style: none !important;\n  margin: 0; padding: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  position: relative;\n}\n.mindmap-tree { padding-top: 0; }\n/* --- (A) RAINBOW VERTICAL TRUNK on LEFT padding side of sibling group --- */\n.mindmap-tree ul {\n  /* Lift group so the pass-through bead's vertical position lines up exactly with parent card mid */\n  margin-top: -32px;\n  padding-left: 44px;\n  margin-left: 18px;\n  padding-top: 22px;\n  padding-bottom: 22px;\n  border-left: 2.5px solid var(--lc);\n  border-radius: 999px 0 0 999px / 40px 0 0 40px;\n  box-shadow: -2px 0 14px -4px var(--lc-glow, transparent), inset 1px 0 0 0 rgba(255,255,255,0.18);\n  isolation: isolate;\n}\n.mindmap-tree > li > ul {\n  border-left-width: 3px;\n  padding-left: 50px;\n  margin-left: 22px;\n  padding-top: 24px;\n  padding-bottom: 24px;\n  border-radius: 999px 0 0 999px / 44px 0 0 44px;\n  box-shadow: -3px 0 22px -4px var(--lc-glow, transparent), inset 1px 0 0 0 rgba(255,255,255,0.22);\n  margin-top: -36px;\n}\n/* --- (B) PASS-THROUGH BEAD + HORIZONTAL ARM crossing the trunk at parent-mid y ---\n     ul::before sits exactly on the trunk at the y the parent bridge connects. The bead\n     is the 'junction node' where parent's horizontal arm enters the vertical trunk.   */\n.mindmap-tree li > ul::before {\n  content: '';\n  position: absolute;\n  z-index: 5;\n  /* left: trunk center line (inside our border-left at ul.left edge itself, offset - thickness/2) */\n  left: -1.5px;\n  /* top: parent-mid relative to pulled-up ul = tuned to match L0/L1 card heights */\n  top: 28px;\n  width: 12px; height: 12px; border-radius: 9999px;\n  background: #fff;\n  border: 2.5px solid var(--lc);\n  box-shadow: 0 0 0 3px rgba(255,255,255,0.65), 0 0 16px var(--lc-glow, transparent);\n  transform: translate(-50%, -50%);\n}\n.dark .mindmap-tree li > ul::before { background: #0f172a; box-shadow: 0 0 0 3px rgba(15,23,42,0.7), 0 0 16px var(--lc-glow, transparent); }\n.mindmap-tree > li > ul::before {\n  width: 14px; height: 14px;\n  left: -1.5px;\n  top: 30px;\n  border-width: 3px;\n  box-shadow: 0 0 0 3.5px rgba(255,255,255,0.7), 0 0 22px var(--lc-glow, transparent);\n}\n.dark .mindmap-tree > li > ul::before { box-shadow: 0 0 0 3.5px rgba(15,23,42,0.75), 0 0 22px var(--lc-glow, transparent); }\n/* --- (C) PARENT BRIDGE: STRAIGHT HORIZONTAL LINE from parent card RIGHT-MID -> pass-through bead on the trunk --- */\n.mindmap-tree li > ul::after {\n  content: '';\n  position: absolute;\n  z-index: 2;\n  /* LEFT edge of this box = parent card RIGHT edge */\n  left: -62px;\n  /* TOP of border-top line = parent card VERTICAL MID (matches bead top above + 1px line center) */\n  top: 27px;\n  width: 62px;\n  height: 0;\n  border-top: 2.5px solid var(--lc);\n  border-radius: 0;\n  filter: drop-shadow(0 0 4px var(--lc-glow, transparent));\n}\n.mindmap-tree > li > ul::after {\n  left: -72px;\n  width: 72px;\n  top: 29px;\n  border-top-width: 3px;\n  filter: drop-shadow(0 0 6px var(--lc-glow, transparent));\n}\n/* --- Sibling li stacked vertically --- */\n.mindmap-tree li {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 0;\n  margin: 0 0 10px 0;\n  max-width: 100%;\n}\n.mindmap-tree li:last-child { margin-bottom: 0; }\n/* --- (D) CHILD C-HOOK: card LEFT-MID → sweep left → curl UP in a big-radius C-arc ---\n     Geometry: draw a box that shares its RIGHT edge with child card LEFT edge (so child-left mid point\n     is the right-mid of this box). Put border-top on the box (horizontal line LEFTWARD) and\n     border-left (vertical line UPWARD). Join them at the top-left corner with a gigantic\n     border-top-left-radius -> perfect C shape opening to the bottom-right, exactly the 'curl back up'\n     to parent' markmap silhouette.                                                */\n.mindmap-tree li::before {\n  content: '' !important;\n  display: block !important;\n  position: absolute;\n  z-index: 2;\n  /* RIGHT edge of this box = child card LEFT edge */\n  right: calc(100% + 0px);\n  /* Place the horizontal segment (border-top) at the vertical mid of this child card */\n  top: calc(50% - 1px);\n  width: 44px;\n  /* Height of the box = the vertical 'stub' length curling up (C-arc radius) */\n  height: 36px;\n  /* Move the box's y so the border-top line sits exactly at top:calc(50% - 1px) */\n  /* i.e. box's BOTTOM is at card mid line, box grows UPWARD. Equivalent: use `bottom` instead. But\n     we use top trick and set transform-origin: bottom right */\n  transform: translateY(-100%);\n  border-top: 2px solid var(--lc);\n  border-left: 2px solid var(--lc);\n  border-top-left-radius: 36px;\n  filter: drop-shadow(0 0 3px var(--lc-glow, transparent));\n}\n.mindmap-tree > li > ul > li::before {\n  width: 50px;\n  height: 40px;\n  right: calc(100%);\n  border-top-width: 2.5px;\n  border-left-width: 2.5px;\n  border-top-left-radius: 40px;\n  filter: drop-shadow(0 0 5px var(--lc-glow, transparent));\n}\n/* --- (E) Bead: sits at child LEFT side (where C-hook starts, on the card edge). Same markmap look. --- */\n.mindmap-tree li::after {\n  content: '' !important;\n  display: block !important;\n  position: absolute;\n  z-index: 6;\n  right: calc(100% - 0px); top: 50%; transform: translate(50%, -50%);\n  width: 9px; height: 9px; border-radius: 9999px;\n  background: #fff;\n  border: 2px solid var(--lc);\n  box-shadow: 0 0 0 2px rgba(255,255,255,0.6), 0 0 10px var(--lc-glow, transparent);\n}\n.dark .mindmap-tree li::after {\n  background: #0f172a;\n  box-shadow: 0 0 0 2px rgba(15,23,42,0.65), 0 0 10px var(--lc-glow, transparent);\n}\n.mindmap-tree > li > ul > li::after {\n  width: 11px; height: 11px; border-width: 2.5px;\n}\n/* Root has no parent connector / hook / bead */\n.mindmap-tree > li::before { display: none !important; }\n.mindmap-tree > li::after { display: none !important; }\n/* Root-card itself: also add a bead to its RIGHT side (like markmap root has colored exit dot on right)\n   We add via .node-card wrapper's right side using mm-root-exit pseudo on the outer group div    */\n/* --- (F) SINGLE-CHILD: straight horizontal line between parent-right and only child-left, no trunk --- */\n.mindmap-tree ul:has(> li:only-child) {\n  border-left: 0 !important;\n  box-shadow: none !important;\n  padding-left: 18px !important;\n  margin-left: 18px !important;\n  padding-top: 12px !important;\n  padding-bottom: 12px !important;\n  margin-top: -28px !important;\n}\n.mindmap-tree > li > ul:has(> li:only-child) {\n  padding-left: 20px !important;\n  margin-left: 22px !important;\n  margin-top: -34px !important;\n}\n.mindmap-tree ul:has(> li:only-child)::before {\n  /* Hide the pass-through bead (no trunk to attach to) */\n  display: none !important;\n}\n.mindmap-tree ul:has(> li:only-child)::after {\n  /* Replace bridge curve with a long STRAIGHT horizontal line */\n  top: 50% !important;\n  transform: translateY(-50%);\n  left: -80px !important;\n  width: 80px !important;\n  height: 0 !important;\n  border-left: 0 !important;\n  border-radius: 0 !important;\n  border-top: 2.5px solid var(--lc) !important;\n  filter: drop-shadow(0 0 4px var(--lc-glow, transparent)) !important;\n}\n.mindmap-tree > li > ul:has(> li:only-child)::after {\n  left: -92px !important;\n  width: 92px !important;\n  border-top-width: 3px !important;\n  filter: drop-shadow(0 0 6px var(--lc-glow, transparent)) !important;\n}\n.mindmap-tree ul:has(> li:only-child) > li::before {\n  /* No C-hook needed — straight horizontal bridge already covers the gap */\n  display: none !important;\n}\n.mindmap-tree ul:has(> li:only-child) > li::after {\n  /* Bead for single child stays visible on card left edge (connecting point) */\n  display: block !important;\n}\n.mm-root-card{position:relative;z-index:5}.mm-root-card::after{content:'';position:absolute;z-index:20;left:100%;top:50%;transform:translate(-50%,-50%);width:15px;height:15px;border-radius:9999px;background:#fff;border:3px solid var(--lc,#6366f1);box-shadow:0 0 0 4px rgba(255,255,255,0.72),0 0 26px var(--lc-glow,#818cf8)}.dark .mm-root-card::after{background:#0f172a;box-shadow:0 0 0 4px rgba(15,23,42,0.78),0 0 26px var(--lc-glow,#818cf8)}";

interface MindMapCoreProps {
  showClose?: boolean;
  onClose?: () => void;
  extraHeaderRight?: React.ReactNode;
}

function MindMapCore({ showClose, onClose, extraHeaderRight }: MindMapCoreProps) {
  const [tree, setTree] = useState<MindNode>(loadTree);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bgKey, setBgKey] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const walk = (n: MindNode, lvl: number) => {
      if (lvl >= 4 && n.children.length >= 2) initial.add(n.id);
      n.children.forEach(c => walk(c, lvl + 1));
    };
    walk(tree, 0);
    return initial;
  });
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.classList.contains('dark'));
    check();
    const obs = new MutationObserver(() => { check(); setBgKey(k => k + 1); });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
    localStorage.setItem(STORAGE_KEY + '_version', String(STORAGE_VERSION));
  }, [tree]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setZoom(z => Math.max(0.4, Math.min(2.2, z + delta)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleAdd = (parentId: string) => {
    const id = genId();
    setTree(t => addNode(t, parentId, id, '新节点'));
    setEditingId(id);
    setCollapsedIds(s => { const n = new Set(s); n.delete(parentId); return n; });
  };
  const handleCommitEdit = (id: string, text: string) => { setTree(t => updateNode(t, id, text)); setEditingId(null); };
  const handleDelete = (id: string) => { setTree(t => deleteNode(t, id)); if (editingId === id) setEditingId(null); };
  const handleReset = () => {
    if (confirm('确定要重置思维导图吗？将恢复到初始示例数据。')) {
      setTree(JSON.parse(JSON.stringify(defaultTree)));
      setEditingId(null);
      setCollapsedIds(new Set());
    }
  };
  const onToggleCollapse = (id: string) => setCollapsedIds(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const s = new Set<string>();
    const walk = (n: MindNode) => { if (n.children.length) s.add(n.id); n.children.forEach(walk); };
    walk(tree);
    s.delete('root');
    setCollapsedIds(s);
  };
  function countNodes(n: MindNode) { return 1 + n.children.reduce((s, c) => s + countNodes(c), 0); }
  function countVisible(n: MindNode, collapsed: Set<string>): number {
    if (collapsed.has(n.id)) return 1;
    return 1 + n.children.reduce((s, c) => s + countVisible(c, collapsed), 0);
  }
  const totalNodes = countNodes(tree);
  const visibleNodes = countVisible(tree, collapsedIds);

  const headerBg = isDark
    ? 'linear-gradient(110deg,#4c1d95 0%,#7e22ce 40%,#be185d 75%,#db2777 100%)'
    : 'linear-gradient(110deg,#6d28d9 0%,#a855f7 40%,#ec4899 75%,#f472b6 100%)';

  return (
    <div className={isDark ? 'dark' : ''} style={{ display: 'contents' }}>
      {/* Header */}
      <div
        className="px-5 md:px-6 py-3 md:py-4 text-white relative overflow-hidden flex-shrink-0"
        style={{ background: headerBg }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.18)' }}></div>
          <div className="absolute -bottom-28 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(244,114,182,0.25)' }}></div>
          <div className="absolute top-6 left-1/3 w-2 h-2 rounded-full bg-white/50 blur-[1px]"></div>
          <div className="absolute top-12 right-1/3 w-1.5 h-1.5 rounded-full bg-white/60 blur-[1px]"></div>
          <div className="absolute bottom-6 left-1/4 w-1 h-1 rounded-full bg-white/40"></div>
        </div>
        <div className="flex items-center justify-between relative z-10 gap-2">
          <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3 min-w-0">
            <div
              className="w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-2xl flex items-center justify-center ring-1 ring-white/40 shadow-inner"
              style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0.08))', backdropFilter: 'blur(8px)' }}
            >
              <Network size={isDark ? 20 : 21} />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="truncate drop-shadow-sm">知识思维导图</span>
              <span className="text-[10px] md:text-[11px] font-normal opacity-90 mt-0.5 whitespace-nowrap">
                共 <b className="tabular-nums opacity-100">{totalNodes}</b> 节点 · 显示 <b className="tabular-nums opacity-100">{visibleNodes}</b>
              </span>
            </div>
          </h2>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0 overflow-x-auto max-w-full py-0.5">
            {/* Zoom */}
            <div className="flex items-center rounded-2xl p-1 shrink-0 ring-1 ring-white/25 shadow-inner"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}>
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} title="缩小" className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors">
                <ZoomOut size={16} />
              </button>
              <span className="px-2 text-xs font-bold tabular-nums min-w-[46px] text-center tracking-tight">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2.2, z + 0.1))} title="放大" className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors">
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-white/25 mx-1"></div>
              <button onClick={() => setZoom(1)} title="重置缩放（Ctrl+滚轮 缩放）" className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors">
                <Maximize2 size={15} />
              </button>
            </div>
            {/* Expand / Collapse all */}
            <button onClick={expandAll} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-2xl ring-1 ring-white/20 hover:ring-white/40 transition-all shrink-0"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}>
              <ChevronDown size={15} />全部展开
            </button>
            <button onClick={collapseAll} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-2xl ring-1 ring-white/20 hover:ring-white/40 transition-all shrink-0"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}>
              <ChevronRight size={15} />全部折叠
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-2xl ring-1 ring-white/20 hover:ring-white/40 transition-all shrink-0"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}>
              <RotateCcw size={15} />重置
            </button>
            {extraHeaderRight}
            {showClose && onClose && (
              <button onClick={onClose} className="p-2 rounded-2xl hover:bg-white/20 transition-colors ring-1 ring-transparent hover:ring-white/40 shrink-0" title="关闭">
                <X size={22} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tip bar */}
      <div
        className="px-4 md:px-5 py-2 md:py-2.5 border-b flex flex-wrap items-center gap-x-4 md:gap-x-5 gap-y-1.5 text-[11px] md:text-sm flex-shrink-0"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(124,58,237,0.25) 0%, rgba(217,70,239,0.18) 50%, rgba(236,72,153,0.22) 100%)'
            : 'linear-gradient(90deg, rgba(237,233,254,0.9) 0%, rgba(250,232,255,0.85) 50%, rgba(255,231,243,0.9) 100%)',
          borderColor: isDark ? 'rgba(168,85,247,0.3)' : 'rgba(216,180,254,0.45)',
          color: isDark ? '#e9d5ff' : '#6b21a8',
        }}
      >
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(168,85,247,0.18)' }}>
            <Network size={12} />
          </span>
          节点右侧按钮 · 折叠/展开
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(236,72,153,0.18)' }}>
            <Plus size={12} />
          </span>
          悬停节点 · 添加 / 编辑 / 删除
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(59,130,246,0.18)' }}>
            <ZoomIn size={12} />
          </span>
          Ctrl + 滚轮 · 缩放画布
        </span>
      </div>

      {/* Canvas */}
      <div
        className={'flex-1 overflow-auto'}
      >
        <div
          ref={canvasRef}
          key={bgKey}
          className="min-h-full p-4 md:p-6 flex items-center justify-start relative mm-canvas-dots"
          style={{ background: getBgGradient(isDark) }}
        >
          <div
            style={{
              transform: 'scale(' + zoom + ')',
              transformOrigin: 'center left',
              transition: 'transform 0.2s cubic-bezier(.22,1,.36,1)',
            }}
            className="min-w-max"
          >
            <ul className="mindmap-tree">
              <TreeNode
                node={tree}
                level={0}
                editingId={editingId}
                collapsedIds={collapsedIds}
                onToggleCollapse={onToggleCollapse}
                onAdd={handleAdd}
                onStartEdit={setEditingId}
                onCommitEdit={handleCommitEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={handleDelete}
              />
            </ul>
          </div>
        </div>
      </div>
      <style>{CSS_STYLE}</style>
    </div>
  );
}

export function MindMapModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px) saturate(1.1)' }}
      onClick={onClose}>
      <div
        className="relative w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col rounded-[28px] overflow-hidden border shadow-2xl"
        style={{
          borderColor: 'rgba(255,255,255,0.22)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5), 0 10px 40px -10px rgba(168,85,247,0.25)',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px) saturate(1.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <MindMapCore showClose onClose={onClose} />
      </div>
    </div>
  );
}

export function MindMapStandalone() {
  return (
    <div className="h-[calc(100vh-57px)] w-full flex flex-col bg-white dark:bg-gray-900">
      <MindMapCore />
    </div>
  );
}
