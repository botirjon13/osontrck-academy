import { useEffect, useRef, useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const faqs: FAQItem[] = [
    {
      question: 'Is OsonTrack really free?',
      answer:
        'Yes! All our core courses are completely free. We believe quality backend education should be accessible to everyone. Pro plans unlock advanced projects and certifications.',
    },
    {
      question: 'Do I need prior coding experience?',
      answer:
        "Not at all. Our REST API Fundamentals course starts from the absolute basics. If you know basic JavaScript, you're ready to begin.",
    },
    {
      question: 'How long does it take to complete a course?',
      answer:
        'Most students complete a course in 2-4 weeks with 5-10 hours per week of study. You can learn at your own pace with lifetime access.',
    },
    {
      question: 'Will I get a certificate?',
      answer:
        'Yes, Pro plan users earn verified certificates upon course completion that can be shared on LinkedIn and resumes.',
    },
    {
      question: 'Can I access the API playground on mobile?',
      answer:
        'The playground works best on desktop, but all video lessons and theory content are fully mobile-responsive.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-[100px] px-6"
      style={{ backgroundColor: '#0F1D2F' }}
    >
      <div className="max-w-[720px] mx-auto">
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
            FAQ
          </span>
          <h2
            className="font-serif text-3xl md:text-[44px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: '#162236',
                  border: '1px solid rgba(138, 154, 176, 0.06)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms`,
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-base font-medium pr-4" style={{ color: '#F0EDE5' }}>
                    {faq.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4A5A70"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                  }}
                >
                  <div className="px-6 pb-5">
                    <p className="text-[15px] leading-relaxed" style={{ color: '#8A9AB0' }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
