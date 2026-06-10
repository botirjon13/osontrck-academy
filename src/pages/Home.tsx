import Navigation from '../sections/Navigation';
import Hero from '../sections/Hero';
import TrustedBy from '../sections/TrustedBy';
import WhyChoose from '../sections/WhyChoose';
import CourseShowcase from '../sections/CourseShowcase';
import HowItWorks from '../sections/HowItWorks';
import ParticleCarousel from '../sections/ParticleCarousel';
import Pricing from '../sections/Pricing';
import FAQ from '../sections/FAQ';
import CTA from '../sections/CTA';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      <Navigation />
      <Hero />
      <TrustedBy />
      <WhyChoose />
      <CourseShowcase />
      <HowItWorks />
      <ParticleCarousel />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
