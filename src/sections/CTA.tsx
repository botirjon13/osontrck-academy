import { useEffect, useRef, useState } from 'react';

export default function CTA() {
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

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-[120px] px-6"
      style={{
        backgroundColor: '#0A1628',
        borderTop: '1px solid rgba(138, 154, 176, 0.06)',
      }}
    >
      <div
        className="max-w-[640px] mx-auto text-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <h2
          className="font-serif text-3xl md:text-[48px] font-semibold leading-[1.12]"
          style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
        >
          Ready to build real backend skills?
        </h2>
        <p
          className="text-lg mt-4"
          style={{ color: '#8A9AB0' }}
        >
          Join 12,000+ developers learning APIs, PostgreSQL, and NestJS.
        </p>

        <a
          href="#courses"
          className="inline-block mt-8 px-11 py-[18px] rounded-full font-semibold text-[17px] transition-all duration-200 hover:scale-[1.03]"
          style={{
            backgroundColor: '#D4A853',
            color: '#0A1628',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E8C876';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(212, 168, 83, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#D4A853';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Start Learning for Free
        </a>

        <p className="text-[13px] mt-4" style={{ color: '#4A5A70' }}>
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
