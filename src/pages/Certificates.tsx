import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const certificates = [
  {
    id: 1,
    title: '阿里云ApsaraClouder专项技能认证',
    titleEn: 'Alibaba Cloud ApsaraClouder Specialized Skill Certification',
    issuer: '阿里云 / Alibaba Cloud',
    date: '2026年3月1日',
    dateEn: 'March 1, 2026',
    description: '大模型Clouder认证：基于通义灵码实现高效AI编码实践',
    descriptionEn: 'Large Model Clouder Certification: Achieve Efficient AI Coding Practice Based on Tongyi Lingma',
    file: '/certificates/2026.3.1阿里云ApsaraClouder专项技能认证.png',
    type: 'png'
  },
  {
    id: 2,
    title: '华为人工智能技术链与实践微认证',
    titleEn: 'Huawei AI Technology Chain and Practice Micro Certification',
    issuer: '华为 / Huawei',
    date: '2025年11月13日',
    dateEn: 'November 13, 2025',
    description: '掌握人工智能技术链全流程实践',
    descriptionEn: 'Master the Full-Process Practice of AI Technology Chain',
    file: '/certificates/2025.11.13华为人工智能技术链与实践微认证.pdf',
    type: 'pdf'
  },
  {
    id: 3,
    title: 'AI Agent技术与应用微认证',
    titleEn: 'AI Agent Technology and Application Micro Certification',
    issuer: '华为 / Huawei',
    date: '2025年11月13日',
    dateEn: 'November 13, 2025',
    description: '深入理解AI Agent技术原理与实际应用',
    descriptionEn: 'Deep Understanding of AI Agent Technology Principles and Practical Applications',
    file: '/certificates/2025.11.13AI Agent技术与应用微认证.pdf',
    type: 'pdf'
  },
  {
    id: 4,
    title: 'AI for Coding微认证',
    titleEn: 'AI for Coding Micro Certification',
    issuer: '华为 / Huawei',
    date: '2025年11月13日',
    dateEn: 'November 13, 2025',
    description: '利用AI提升代码开发效率与质量',
    descriptionEn: 'Leverage AI to Improve Code Development Efficiency and Quality',
    file: '/certificates/2025.11.13AI for Coding微认证.pdf',
    type: 'pdf'
  }
];

export function Certificates() {
  const [selectedCertificate, setSelectedCertificate] = useState<typeof certificates[0] | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate('/resume')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回简历 / Back to Resume</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            技能证书 / Certifications
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            以下是我获得的专业技能证书，点击可查看详情。
            <br />
            Here are my professional skill certificates. Click to view details.
          </p>
        </div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCertificate(cert)}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">📜</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{cert.issuer}</div>
                  <div className="text-sm text-gray-400">{cert.date}</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{cert.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{cert.titleEn}</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                  cert.type === 'png' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {cert.type === 'png' ? '图片证书' : 'PDF证书'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCertificate.title}</h2>
                <p className="text-sm text-gray-500">{selectedCertificate.titleEn}</p>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">{selectedCertificate.issuer}</span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm">{selectedCertificate.date}</span>
              </div>
              <p className="text-gray-600 mb-2">{selectedCertificate.description}</p>
              <p className="text-gray-400 text-sm mb-6">{selectedCertificate.descriptionEn}</p>
              
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {selectedCertificate.type === 'png' ? (
                  <img
                    src={selectedCertificate.file}
                    alt={selectedCertificate.title}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-600 mb-4">这是一个PDF证书文件</p>
                    <a
                      href={selectedCertificate.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      下载证书 / Download Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}