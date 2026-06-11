import { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const { t } = useTranslation();

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

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      yearlyPrice: 'Free',
      features: [
        'Access to all core courses',
        'Interactive API playground',
        'Community Discord access',
        'Basic progress tracking',
      ],
      featured: false,
    },
    {
      name: 'Pro',
      price: '$19/mo',
      yearlyPrice: '$15/mo',
      features: [
        'Everything in Starter',
        'Verified certificates',
        'Advanced projects',
        'Priority support',
        'Downloadable resources',
        'Exclusive workshops',
      ],
      featured: true,
    },
    {
      name: 'Team',
      price: '$49/mo',
      yearlyPrice: '$39/mo',
      features: [
        'Everything in Pro',
        'Team management dashboard',
        'Custom learning paths',
        'SSO integration',
        'Analytics & reporting',
        'Dedicated account manager',
      ],
      featured: false,
    },
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 md:py-[100px] px-6"
      style={{ backgroundColor: '#0A1628' }}
    >
      <div className="max-w-[1000px] mx-auto">
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
            {t("pricing.badge")}
          </span>
          <h2
            className="font-serif text-3xl md:text-[44px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            {t("pricing.title")}
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <span
              className="text-sm font-medium"
              style={{ color: isYearly ? '#4A5A70' : '#F0EDE5' }}
            >
              {t("pricing.monthly")}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-24 h-12 rounded-full transition-colors duration-200"
              style={{ backgroundColor: '#162236' }}
            >
              <div
                className="absolute top-1.5 w-9 h-9 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: '#D4A853',
                  left: isYearly ? 'calc(100% - 42px)' : '6px',
                }}
              />
            </button>
            <span
              className="text-sm font-medium"
              style={{ color: isYearly ? '#F0EDE5' : '#4A5A70' }}
            >
              {t("pricing.yearly")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="relative rounded-[20px] p-8 md:p-10 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: '#162236',
                border: plan.featured ? '2px solid #D4A853' : '1px solid rgba(138, 154, 176, 0.08)',
                boxShadow: plan.featured ? '0 0 40px rgba(212, 168, 83, 0.1)' : 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms`,
              }}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: '#D4A853',
                    color: '#0A1628',
                  }}
                >
                  {t("pricing.popular")}
                </div>
              )}

              <h3 className="text-[22px] font-semibold" style={{ color: '#F0EDE5' }}>
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="font-serif text-5xl font-medium" style={{ color: '#F0EDE5' }}>
                  {isYearly ? plan.yearlyPrice : plan.price}
                </span>
                {plan.price !== 'Free' && (
                  <span className="text-sm ml-1" style={{ color: '#4A5A70' }}>
                    /mo
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D4A853"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[15px]" style={{ color: '#8A9AB0' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full mt-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: plan.featured ? '#D4A853' : 'transparent',
                  color: plan.featured ? '#0A1628' : '#F0EDE5',
                  border: plan.featured ? 'none' : '1px solid #4A5A70',
                }}
              >
                {plan.name === 'Starter'
                  ? 'Get Started'
                  : plan.name === 'Pro'
                    ? 'Start Pro Trial'
                    : 'Contact Sales'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
