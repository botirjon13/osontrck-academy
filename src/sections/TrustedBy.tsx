import { useEffect, useRef, useState } from 'react';

export default function TrustedBy() {
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

  const companies = ['TechCorp', 'DevStudio', 'CloudBase', 'APIForge', 'DataStack'];

  return (
    <section
      ref={sectionRef}
      className="py-10 transition-all duration-700"
      style={{
        backgroundColor: '#0A1628',
        borderTop: '1px solid rgba(138, 154, 176, 0.06)',
        borderBottom: '1px solid rgba(138, 154, 176, 0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      <p
        className="text-center text-[13px] uppercase tracking-[1.5px] mb-5"
        style={{ color: '#4A5A70' }}
      >
        Trusted by developers at
      </p>
      <div className="max-w-[900px] mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-16 px-6">
        {companies.map((name) => (
          <span
            key={name}
            className="text-lg font-medium"
            style={{ color: '#4A5A70', opacity: 0.4 }}
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
