import { experiences, skills, patents, awards, bio } from '@/data/projects';

export function Resume() {
  return (
    <div className="min-h-screen pt-24">
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <span className="text-xs uppercase tracking-widest text-gray-400 mb-4 block">简历 / Resume</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{bio.name}</h1>
            <p className="text-gray-600 text-lg mb-2">{bio.title}</p>
            <p className="text-gray-500 text-sm mb-8">{bio.location} | {bio.email}</p>
            <p className="text-gray-600 text-lg mb-12">
              {bio.summary}
            </p>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">教育背景 / Education</h2>
              <div className="space-y-6">
                {bio.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{edu.degree} - {edu.major}</h3>
                        <p className="text-gray-600">{edu.school}</p>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 md:mt-0">{edu.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">工作经验 / Professional Experience</h2>
              <div className="space-y-8">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-gray-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{exp.role}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 md:mt-0">{exp.period}</span>
                    </div>
                    <ul className="space-y-2 mt-4">
                      {exp.highlights.map((highlight, index) => (
                        <li key={index} className="text-gray-600 text-sm flex items-start">
                          <span className="text-purple-600 mr-2 mt-1">✷</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">Patents</h2>
              <div className="space-y-6">
                {patents.map((patent) => (
                  <div key={patent.id} className="border-l-2 border-purple-200 pl-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                      <div>
                        {patent.link ? (
                          <a 
                            href={patent.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold hover:text-purple-600 transition-colors"
                          >
                            {patent.title}
                          </a>
                        ) : (
                          <h3 className="text-lg font-semibold">{patent.title}</h3>
                        )}
                        <p className="text-gray-500 text-sm">
                          {patent.type} | {patent.number}
                          {patent.status && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              {patent.status}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 md:mt-0">{patent.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{patent.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">获奖证书 / Awards & Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards.map((award) => (
                  <div key={award.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      {award.link ? (
                        <a
                          href={award.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm hover:text-purple-600 transition-colors"
                        >
                          {award.title}
                        </a>
                      ) : (
                        <h3 className="font-semibold text-sm">{award.title}</h3>
                      )}
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        {award.level}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{award.issuer}</p>
                    <p className="text-gray-500 text-xs mt-1">{award.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">技术专长 / Technical Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {skills.technical.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">核心专长 / Core Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {skills.core.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider">技能证书 / Certifications</h2>
              <a
                href="/certificates"
                className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl">📜</span>
                <div className="text-left">
                  <div className="font-semibold">查看技能证书</div>
                  <div className="text-sm opacity-80">View Certifications</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">期待与您合作 / Interested in working together?</h2>
            <p className="text-gray-600 mb-8">
              我始终对新的机会和令人兴奋的项目持开放态度。让我们一起创造精彩的作品。 / I'm always open to new opportunities and exciting projects. Let's create something amazing together.
            </p>
            <a
              href={`mailto:${bio.email}`}
              className="inline-flex items-center px-8 py-4 bg-black text-white hover:bg-purple-900 transition-colors text-sm uppercase tracking-widest"
            >
              联系我 / Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}