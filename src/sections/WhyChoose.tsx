import { useEffect, useRef, useState } from 'react';

function FeatureIcon({ type }: { type: string }) {
  const size = 20;
  const color = '#D4A853';

  switch (type) {
    case 'interactive':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'curriculum':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'projects':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'community':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'database':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'security':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WhyChoose() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: 'interactive',
      title: 'Interactive Lessons',
      desc: 'Practice with real API endpoints in our built-in playground. No setup needed.',
    },
    {
      icon: 'curriculum',
      title: 'Step-by-Step Curriculum',
      desc: 'Structured learning path from HTTP basics to production-ready NestJS applications.',
    },
    {
      icon: 'projects',
      title: 'Real-World Projects',
      desc: 'Build portfolio-worthy projects: Task Manager API, Auth System, E-commerce Backend.',
    },
    {
      icon: 'community',
      title: 'Community Support',
      desc: 'Join 12,000+ developers in our Discord. Get help, share progress, find accountability partners.',
    },
    {
      icon: 'database',
      title: 'PostgreSQL Mastery',
      desc: 'Go from SQL fundamentals to advanced querying, migrations, and database design.',
    },
    {
      icon: 'security',
      title: 'JWT & Security',
      desc: 'Learn authentication, authorization, and security best practices the right way.',
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-[100px] px-6"
      style={{ backgroundColor: '#0F1D2F' }}
    >
      <div className="max-w-[1100px] mx-auto">
        <div
          className="text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <span
            className="text-xs font-medium uppercase tracking-[2px]"
            style={{ color: '#D4A853' }}
          >
            WHY OSONTRACK
          </span>
          <h2
            className="font-serif text-3xl md:text-[44px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            Everything you need to master backend
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 md:p-9 rounded-[20px] border transition-all duration-300 hover:-translate-y-1 group"
              style={{
                backgroundColor: '#162236',
                borderColor: 'rgba(138, 154, 176, 0.08)',
                boxShadow: 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, border-color 300ms, box-shadow 300ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 83, 0.2)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(138, 154, 176, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(212, 168, 83, 0.1)' }}
              >
                <FeatureIcon type={feature.icon} />
              </div>
              <h3 className="text-xl font-semibold mt-5" style={{ color: '#F0EDE5', letterSpacing: '-0.3px' }}>
                {feature.title}
              </h3>
              <p className="text-[15px] mt-2.5 leading-relaxed" style={{ color: '#8A9AB0' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
