import { useEffect, useRef, useState } from 'react';

export default function HowItWorks() {
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

  const steps = [
    { title: 'Sign Up', desc: 'Create your free account and set your learning goals.' },
    { title: 'Watch & Learn', desc: 'Follow structured video lessons with hands-on examples.' },
    { title: 'Code Along', desc: 'Practice in our interactive API playground with real endpoints.' },
    { title: 'Build Projects', desc: 'Apply your skills with guided real-world projects.' },
    { title: 'Get Certified', desc: 'Earn certificates and showcase your backend skills.' },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-[100px] px-6"
      style={{ backgroundColor: '#0F1D2F' }}
    >
      <div className="max-w-[800px] mx-auto">
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
            HOW IT WORKS
          </span>
          <h2
            className="font-serif text-3xl md:text-[44px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            Your path to backend mastery
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Vertical line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden md:block"
            style={{ backgroundColor: 'rgba(212, 168, 83, 0.2)' }}
          />

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={i}
                className={`relative flex items-center mb-12 last:mb-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms`,
                }}
              >
                {/* Card */}
                <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                  <div
                    className="p-7 rounded-xl"
                    style={{
                      backgroundColor: '#162236',
                      maxWidth: '360px',
                      marginLeft: isLeft ? 'auto' : '0',
                      marginRight: isLeft ? '0' : 'auto',
                    }}
                  >
                    <h3 className="text-lg font-semibold" style={{ color: '#F0EDE5' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#8A9AB0' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Step number circle - centered on timeline */}
                <div
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full items-center justify-center z-10"
                  style={{
                    border: '2px solid #D4A853',
                    backgroundColor: '#0F1D2F',
                  }}
                >
                  <span className="text-lg font-bold" style={{ color: '#D4A853' }}>
                    {i + 1}
                  </span>
                </div>

                {/* Mobile step number */}
                <div
                  className="md:hidden flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4"
                  style={{
                    border: '2px solid #D4A853',
                    backgroundColor: '#0F1D2F',
                  }}
                >
                  <span className="text-lg font-bold" style={{ color: '#D4A853' }}>
                    {i + 1}
                  </span>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
