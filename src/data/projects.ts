export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  link: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "滇同学智慧系统 / Dian Tongxue Smart System",
    category: "多平台电商账号整合系统 / Multi-platform E-commerce Account Integration",
    description: "智慧中台数据展示和操作，数据中台是数据抓取和接受智慧中台操作的一个中转平台。Smart central platform for data display and operations. Data middle platform serves as a transit hub for data collection and receiving smart central platform operations.",
    image: "/images/projects/mars.svg",
    link: "https://github.com/xqd-app/DianTongXue-Smart-System"
  },
  {
    id: "2",
    title: "登录认证与API爬虫 / Login Auth & API Crawler",
    category: "认证管理与数据爬取 / Authentication & Data Crawling",
    description: "🔐 认证管理 - 支持多种登录方式和会话管理 / Auth Management - Supports multiple login methods and session management\n🌐 API爬虫 - 智能爬取各类API数据 / API Crawler - Smart crawling of various API data\n📊 数据处理 - 支持数据清洗、转换和存储 / Data Processing - Supports data cleaning, transformation and storage\n⚙️ 灵活配置 - 高度可配置的爬虫参数 / Flexible Configuration - Highly configurable crawler parameters\n🔄 并发处理 - 支持并发请求优化性能 / Concurrent Processing - Supports concurrent requests for performance optimization\n❌ 错误重试 - 智能重试机制确保数据完整性 / Error Retry - Intelligent retry mechanism ensures data integrity",
    image: "/images/projects/cyberpunk.svg",
    link: "https://github.com/xqd-app/repo-overview-pachong-xing"
  },
  {
    id: "3",
    title: "Younger Than Neil",
    category: "Album Art",
    description: "Hand-drawn album art for queer ska punk band",
    image: "/images/projects/portal.svg",
    link: "/showcase/younger-than-neil"
  },
  {
    id: "4",
    title: "Elixir Aesthetics",
    category: "Brand Design",
    description: "Bewitching brand identity for alternative skincare",
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=skincare%20brand%20logo%20elegant%20minimalist%20black%20white%20with%20subtle%20accents&image_size=square",
    link: "/showcase/elixir"
  },
  {
    id: "5",
    title: "dbt Web",
    category: "Design Systems",
    description: "Comprehensive web design system for b2b SaaS marketing website",
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=saaS%20design%20system%20mockup%20clean%20professional%20black%20white&image_size=square",
    link: "/showcase/dbt-web"
  },
  {
    id: "6",
    title: "Wiith",
    category: "Mobile Product Design",
    description: "End-to-end product design for social app",
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mobile%20app%20ui%20design%20minimal%20interface%20black%20white&image_size=square",
    link: "/showcase/wiith"
  },
  {
    id: "7",
    title: "Hair by Love",
    category: "Brand Design",
    description: "Bold, punk-inspired logo for alternative hair salon",
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=hair%20salon%20logo%20punk%20style%20bold%20typography%20black%20white&image_size=square",
    link: "/showcase/hair-by-love"
  },
  {
    id: "8",
    title: "Create Remote",
    category: "Brand Design",
    description: "Inclusive space for creative tech professionals",
    image: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=creative%20community%20logo%20modern%20minimal%20black%20white&image_size=square",
    link: "/showcase/create-remote"
  }
];

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

export const experiences: Experience[] = [
  {
    id: "1",
    role: "独立开发 / Independent Developer",
    company: "学生成绩数据分析管理系统 / Student Grade Analysis & Management System",
    period: "2024.08 - 2024.10",
    highlights: [
      "承接校内教务需求，面向多班级多课程的成绩统计与可视化 / Built for on-campus academic affairs, covering multi-class and multi-course grade statistics and visualization",
      "设计可扩展的成绩统计模块，用 Python 自动计算平均分、排名、挂科率并可视化，替代人工 Excel 汇总 / Designed an extensible statistics module in Python for averages, rankings and failure rates, replacing manual Excel summaries",
      "覆盖 3 个班级 150+ 名学生，成绩分析耗时缩短 60%，成果在班级与任课教师中实际使用 / Covered 3 classes and 150+ students, cut grade analysis time by 60%, adopted by classes and instructors"
    ]
  },
  {
    id: "2",
    role: "项目成员 / Project Member",
    company: "旭腾 · 某医院安防预设项目 / Xuteng · Hospital Security System Project",
    period: "2025.06 - 2025.07",
    highlights: [
      "为监控、门禁、机器人子系统搭建数据安全底座，可拆成「信息安全」单元教学案例 / Built the data security foundation for surveillance, access-control and robotics subsystems, usable as an Information Security teaching case",
      "完成安防系统数据安全建设落地：为各子系统划分独立 VLAN，阻断跨子系统横向访问 / Delivered the security build-out: segmented independent VLANs per subsystem to block lateral access",
      "部署核心层 NGFW 并开启入侵检测与病毒防护，落实 SSL/TLS 传输加密与 AES-256 存储加密 / Deployed core-layer NGFW with intrusion detection and antivirus, enforcing SSL/TLS in transit and AES-256 at rest"
    ]
  },
  {
    id: "3",
    role: "前端开发 / Frontend Developer",
    company: "滇同学智慧系统 / Dian Tongxue Smart System",
    period: "2025.01 - 2025.06",
    highlights: [
      "为昆明百味珍食品有限公司开发多前台电商管理系统，覆盖 Web 与桌面双端 / Built a multi-storefront e-commerce management system for Kunming Baiweizhen Food Co., covering both web and desktop",
      "基于 React + TypeScript + Vite 搭建多前台页面，用 Electron 打包桌面端，一套代码双端交付 / Built multi-storefront pages with React + TypeScript + Vite and packaged the desktop app with Electron, delivering both from one codebase",
      "以 Ant Design 统一交互规范，将重复表单与列表抽象为可复用组件，保持多端体验一致 / Standardized interactions with Ant Design and extracted reusable form and list components for a consistent multi-end experience"
    ]
  },
  {
    id: "4",
    role: "数据分析 / Data Analyst",
    company: "贝壳租房 APP（昆明区域）数据分析 / Beike Rental App (Kunming) Data Analysis",
    period: "2024.12 - 2025.01",
    highlights: [
      "分析昆明租房市场供需关系与用户行为特征，输出可落地的业务建议 / Analyzed supply-demand dynamics and user behavior in Kunming's rental market, delivering actionable business recommendations",
      "用 Python 自定义函数统一格式并填充缺失值，清洗 5 万条数据、剔除无效 1200+ 条，准确性提升 15% / Cleaned 50,000 records with custom Python functions for formatting and missing values, removed 1,200+ invalid entries and improved accuracy by 15%",
      "用 matplotlib 绘制区域租金热力图与户型偏好分布，识别 3 个高需求缺口区域，输出选址与定价建议 / Visualized rent heatmaps and unit-type preferences with matplotlib, identified 3 high-demand gap areas and produced site-selection and pricing advice"
    ]
  }
];

export const skills = {
  technical: [
    "Figma", 
    "Webflow", 
    "Adobe Suite / Adobe全家桶", 
    "Shopify", 
    "WordPress", 
    "Google Analytics / 谷歌分析"
  ],
  core: [
    "品牌设计 / Brand Design", 
    "网站设计 / Website Design", 
    "用户体验设计 / UX/UI Design", 
    "产品设计 / Product Design", 
    "插画 / Illustration", 
    "艺术指导 / Art Direction"
  ]
};

export interface Patent {
  id: string;
  title: string;
  type: string;
  number: string;
  date: string;
  status?: string;
  description: string;
  link?: string;
}

export const patents: Patent[] = [
  {
    id: "1",
    title: "一种用于动力电池极片生产的涂布装置 / Coating Device for Power Battery Electrode Production",
    type: "发明专利 / Invention Patent",
    number: "2025041101707520",
    date: "2025年",
    status: "受理中 / Under Review",
    description: "用于动力电池极片生产的涂布装置，提高生产效率和产品质量。 / Coating device for power battery electrode production, improving production efficiency and product quality.",
    link: "/data/patent certificate/重提一种用于动力电池极片生产的涂布装置-受理.pdf"
  }
];

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  level: string;
  link?: string;
}

export const awards: Award[] = [
  {
    id: "1",
    title: "\"经开杯\"全国大学生创新创业大赛 金奖 / \"Jingkai Cup\" National College Student Innovation and Entrepreneurship Competition - Gold Award",
    issuer: "昆明文理学院 / Kunming College of Arts and Sciences",
    date: "2025年 / 2025",
    level: "国家级 / National",
    link: "/data/patent certificate/1C50AC551AF70224CCAE4AE2A4A2F3D4.jpg"
  },
  {
    id: "3",
    title: "云南省第十三届\"挑战杯\"大学生课外学术科技作品竞赛 三等奖 / 13th Yunnan \"Challenge Cup\" College Students' Extracurricular Academic and Technological Works Competition - Third Prize",
    issuer: "共青团云南省委 / Communist Youth League Yunnan Provincial Committee",
    date: "2025年7月 / July 2025",
    level: "省级 / Provincial",
    link: "/data/patent certificate/微信图片_2026-05-25_211414_299.jpg"
  },
  {
    id: "4",
    title: "第二届全国大学生职业规划大赛院级赛 优秀奖 / 2nd National College Student Career Planning Competition (College Level) - Excellence Award",
    issuer: "共青团昆明文理学院信息工程学院委员会 / Communist Youth League Kunming College of Arts and Sciences Information Engineering College Committee",
    date: "2024年12月 / December 2024",
    level: "校级 / University Level",
    link: "/data/patent certificate/微信图片_20260525213405_112_244.jpg"
  },
  {
    id: "5",
    title: "昆明文理学院\"挑战杯\"大学生课外学术科技作品竞赛校级选拔赛 优秀奖 / Kunming College of Arts and Sciences \"Challenge Cup\" College Students' Extracurricular Academic and Technological Works Competition - Excellence Award",
    issuer: "昆明文理学院 / Kunming College of Arts and Sciences",
    date: "2025年5月 / May 2025",
    level: "校级 / University Level",
    link: "/data/patent certificate/微信图片_20260525211349_15.jpg"
  }
];

export const bio = {
  name: "邢启德 / Xing Qide",
  title: "数据分析师 / 程序员 / Data Analyst & Programmer",
  location: "昆明, 云南 / Kunming, Yunnan",
  email: "3034571929@qq.com",
  summary: "拥有3年数据分析和软件开发经验，专注于大数据处理、机器学习、Web开发和微信小程序开发。曾主导多个数据平台建设项目，具备扎实的技术功底和丰富的项目管理经验。 / With 3 years of experience in data analysis and software development, focusing on big data processing, machine learning, web development and WeChat Mini Program development. Has led multiple data platform construction projects with solid technical skills and rich project management experience.",
  education: [
    {
      degree: "工学学士 / Bachelor of Engineering",
      major: "智能科学与技术 / Intelligent Science and Technology",
      school: "云南师范大学昆明文理学院 / Kunming College of Arts and Sciences",
      period: "2024 - 2026"
    }
  ]
};
