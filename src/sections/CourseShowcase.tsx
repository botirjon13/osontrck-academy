import { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";

interface Course {
  image: string;
  tag: string;
  title: string;
  desc: string;
  lessons: string;
  rating: string;
  level: string;
  price: string;
}

export default function CourseShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
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

  const courses: Course[] = [
    {
    image: "/images/img-rest-api.jpg",
    tag: t("courses.rest.tag"),
    title: t("courses.rest.title"),
    desc: t("courses.rest.desc"),
    lessons: t("courses.rest.lessons"),
    rating: t("courses.rest.rating"),
    level: t("courses.rest.level"),
    price: t("courses.rest.price"),
    },
    {
    image: "/images/img-postgresql.jpg",
    tag: t("courses.pg.tag"),
    title: t("courses.pg.title"),
    desc: t("courses.pg.desc"),
    lessons: t("courses.pg.lessons"),
    rating: t("courses.pg.rating"),
    level: t("courses.pg.level"),
    price: t("courses.pg.price"),
    },
    {
    image: "/images/img-nestjs.jpg",
    tag: t("courses.nest.tag"),
    title: t("courses.nest.title"),
    desc: t("courses.nest.desc"),
    lessons: t("courses.nest.lessons"),
    rating: t("courses.nest.rating"),
    level: t("courses.nest.level"),
    price: t("courses.nest.price"),
    },
    {
    image: "/images/img-jwt.jpg",
    tag: t("courses.jwt.tag"),
    title: t("courses.jwt.title"),
    desc: t("courses.jwt.desc"),
    lessons: t("courses.jwt.lessons"),
    rating: t("courses.jwt.rating"),
    level: t("courses.jwt.level"),
    price: t("courses.jwt.price"),
    },
  ];

  return (
    <section
      id="courses"
      ref={sectionRef}
      className="py-24 md:py-[100px] px-6"
      style={{ backgroundColor: '#0A1628' }}
    >
      <div className="max-w-[1100px] mx-auto">
        <div
          className="transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <span
            className="text-xs font-medium uppercase tracking-[2px]"
            style={{ color: '#D4A853' }}
          >
            {t("courses.badge")}
          </span>
          <h2
            className="font-serif text-3xl md:text-[48px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            {t("courses.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-14">
          {courses.map((course, i) => (
            <div
              key={i}
              className="rounded-[20px] overflow-hidden group transition-all duration-400"
              style={{
                backgroundColor: '#162236',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${100 + i * 100}ms, box-shadow 300ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="overflow-hidden h-[220px]">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
              </div>
              <div className="p-7 pb-8">
                <span
                  className="inline-block text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                    color: '#D4A853',
                  }}
                >
                  {course.tag}
                </span>
                <h3 className="text-[22px] font-semibold mt-3" style={{ color: '#F0EDE5', letterSpacing: '-0.3px' }}>
                  {course.title}
                </h3>
                <p className="text-[15px] mt-2 line-clamp-2" style={{ color: '#8A9AB0' }}>
                  {course.desc}
                </p>
                <div className="flex items-center gap-6 mt-5">
                  <span className="text-sm flex items-center gap-1.5" style={{ color: '#4A5A70' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {course.lessons}
                  </span>
                  <span className="text-sm flex items-center gap-1.5" style={{ color: '#4A5A70' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {course.rating}
                  </span>
                  <span className="text-sm flex items-center gap-1.5" style={{ color: '#4A5A70' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    {course.level}
                  </span>
                </div>
                <div className="flex justify-end mt-4">
                  <span className="text-lg font-bold" style={{ color: '#D4A853' }}>
                    {course.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
