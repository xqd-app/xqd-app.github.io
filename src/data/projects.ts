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
    role: "高级产品设计师 / Senior Product Designer",
    company: "谷歌（通过代理）/ Google (via agencies)",
    period: "2024 - 2025",
    highlights: [
      "设计员工支持AI聊天界面 / Designed AI chat interface for employee support",
      "基于Material 3构建设计系统 / Built design system based on Material 3",
      "创建带动画logo的内部品牌标识 / Created internal brand identity with animated logo"
    ]
  },
  {
    id: "2",
    role: "高级网页设计师 / Senior Web Designer",
    company: "dbt Labs",
    period: "2023 - 2024",
    highlights: [
      "42亿美元初创公司的唯一网页设计师 / Sole web designer for $4.2B startup",
      "开发和维护网页设计系统 / Developed and maintained Web Design System",
      "设计网站品牌更新 / Designed website brand update"
    ]
  },
  {
    id: "3",
    role: "高级设计师 / Senior Designer",
    company: "Nymbus",
    period: "2020 - 2022",
    highlights: [
      "设计完整品牌包括logo和UI/UX / Designed full brands including logos and UI/UX",
      "带来超过75万美元的新业务 / Brought over $750,000 in new business",
      "作为DEIB董事会成员领导骄傲计划 / Led Pride initiatives as DEIB board member"
    ]
  },
  {
    id: "4",
    role: "平面设计师 / Graphic Designer",
    company: "Armature Works",
    period: "2019 - 2020",
    highlights: [
      "为20个餐厅概念创建印刷和数字材料 / Created print and digital materials for 20 restaurant concepts",
      "设计收集5000封邮件的WiFi落地页 / Designed WiFi landing page collecting 5,000 emails"
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
      school: "昆明文理学院 / Kunming College of Arts and Sciences",
      period: "2024 - 2026"
    }
  ]
};
