import { forwardRef, Suspense, useCallback, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IMAGE_LIST = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
];

function CarouselCard({
  index,
  texture,
  width,
  height,
  radius,
  angleStep,
  onDragStart,
  onFocus,
}: {
  index: number;
  texture: THREE.Texture;
  width: number;
  height: number;
  radius: number;
  angleStep: number;
  onDragStart: (event: PointerEvent) => void;
  onFocus: (index: number) => void;
}) {
  const angle = index * angleStep;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <mesh
      position={[x, 0, z]}
      rotation={[0, angle, 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onDragStart(event.nativeEvent);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onFocus(index);
      }}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

export type CarouselHandle = {
  moveBy: (offset: number) => void;
};

type CarouselProps = {
  onSelectedIndexChange: (index: number) => void;
  onItemCountChange: (count: number) => void;
};

const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { onSelectedIndexChange, onItemCountChange },
  ref,
) {
  const targetRotation = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const hasInteracted = useRef(false);
  const lastPointerX = useRef(0);
  const lastPointerTime = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const viewportWidth = useThree((state) => state.size.width);
  const isCompact = viewportWidth < 640;
  const itemCount = isCompact ? 8 : IMAGE_LIST.length;
  const textures = useTexture(IMAGE_LIST.slice(0, itemCount));
  const radius = isCompact ? 1.25 : 3.5;
  const cardWidth = isCompact ? 0.85 : 1.2;
  const cardHeight = cardWidth * (4 / 3);
  const angleStep = (2 * Math.PI) / textures.length;
  const selectedIndexRef = useRef(0);

  const focusCard = useCallback(
    (index: number) => {
      hasInteracted.current = true;
      velocity.current = 0;
      const desiredRotation = -index * angleStep;
      targetRotation.current += Math.atan2(
        Math.sin(desiredRotation - targetRotation.current),
        Math.cos(desiredRotation - targetRotation.current),
      );
      selectedIndexRef.current = index;
      onSelectedIndexChange(index);
    },
    [angleStep, onSelectedIndexChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      moveBy(offset) {
        const nextIndex =
          (selectedIndexRef.current + offset + textures.length) %
          textures.length;
        focusCard(nextIndex);
      },
    }),
    [focusCard, textures.length],
  );

  useEffect(() => {
    selectedIndexRef.current = 0;
    targetRotation.current = 0;
    velocity.current = 0;
    hasInteracted.current = false;
    onSelectedIndexChange(0);
    onItemCountChange(itemCount);
  }, [itemCount, onItemCountChange, onSelectedIndexChange]);

  const startDrag = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    activePointerId.current = event.pointerId;
    lastPointerX.current = event.clientX;
    lastPointerTime.current = performance.now();
    isDragging.current = true;
    hasInteracted.current = true;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current) return;
      const now = performance.now();
      const deltaX = event.clientX - lastPointerX.current;
      const elapsed = Math.max((now - lastPointerTime.current) / 1000, 0.001);
      targetRotation.current += deltaX * 0.008;
      velocity.current = THREE.MathUtils.clamp(
        (deltaX * 0.008) / elapsed,
        -2.5,
        2.5,
      );
      lastPointerX.current = event.clientX;
      lastPointerTime.current = now;
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId.current) return;
      activePointerId.current = null;
      isDragging.current = false;
      setDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [dragging]);

  useFrame((_, delta) => {
    if (!groupRef.current || isDragging.current) return;

    if (!hasInteracted.current) {
      targetRotation.current += delta * 0.06;
    } else {
      targetRotation.current += velocity.current * delta;
      velocity.current *= Math.exp(-4 * delta);

      if (Math.abs(velocity.current) < 0.03) {
        velocity.current = 0;
        const nearestIndex =
          ((Math.round(-targetRotation.current / angleStep) % textures.length) +
            textures.length) %
          textures.length;
        const desiredRotation = -nearestIndex * angleStep;
        targetRotation.current += Math.atan2(
          Math.sin(desiredRotation - targetRotation.current),
          Math.cos(desiredRotation - targetRotation.current),
        );

        if (selectedIndexRef.current !== nearestIndex) {
          selectedIndexRef.current = nearestIndex;
          onSelectedIndexChange(nearestIndex);
        }
      }
    }

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotation.current,
      7,
      delta,
    );

    const frontIndex =
      ((Math.round(-groupRef.current.rotation.y / angleStep) %
        textures.length) +
        textures.length) %
      textures.length;
    if (selectedIndexRef.current !== frontIndex) {
      selectedIndexRef.current = frontIndex;
      onSelectedIndexChange(frontIndex);
    }
  });

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => (
        <CarouselCard
          key={i}
          index={i}
          texture={texture}
          width={cardWidth}
          height={cardHeight}
          radius={radius}
          angleStep={angleStep}
          onDragStart={startDrag}
          onFocus={focusCard}
        />
      ))}
    </group>
  );
});

export default function ParticleCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [carouselCount, setCarouselCount] = useState(IMAGE_LIST.length);
  const carouselRef = useRef<CarouselHandle>(null);
  const { t } = useTranslation();
  const handleItemCountChange = useCallback((count: number) => {
    setCarouselCount(count);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-[120px] px-6"
      style={{ backgroundColor: '#0D1B2A' }}
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
            {t("success.badge")}
          </span>
          <h2
            className="font-serif text-3xl md:text-[44px] font-semibold mt-4 leading-[1.12]"
            style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
          >
            {t("success.title")}
          </h2>
        </div>

        <div
          className="mt-12 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transitionDelay: '200ms',
          }}
        >
          <div
            className="relative w-full touch-pan-y select-none cursor-grab active:cursor-grabbing"
            style={{ height: '500px' }}
            role="region"
            aria-label={t('success.carouselLabel')}
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 50 }}
              dpr={[1, 1.5]}
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(212, 168, 83, 0.12), transparent 55%), #0D1B2A',
              }}
            >
              <Suspense fallback={null}>
                <Carousel
                  ref={carouselRef}
                  onSelectedIndexChange={setSelectedIndex}
                  onItemCountChange={handleItemCountChange}
                />
              </Suspense>
            </Canvas>
          </div>
          <div className="mt-5 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label={t('success.carouselPrevious')}
              onClick={() => carouselRef.current?.moveBy(-1)}
              className="grid size-11 place-items-center rounded-full border border-white/15 text-[#F0EDE5] transition hover:border-[#D4A853] hover:text-[#D4A853] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A853]"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <span
              className="min-w-16 text-center text-sm tabular-nums text-[#8A9AB0]"
              aria-live="polite"
              aria-atomic="true"
            >
              {selectedIndex + 1} / {carouselCount}
            </span>
            <button
              type="button"
              aria-label={t('success.carouselNext')}
              onClick={() => carouselRef.current?.moveBy(1)}
              className="grid size-11 place-items-center rounded-full border border-white/15 text-[#F0EDE5] transition hover:border-[#D4A853] hover:text-[#D4A853] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A853]"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-[#8A9AB0]">
            {t('success.carouselHint')}
          </p>
        </div>

        <div
          className="text-center mt-12 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transitionDelay: '400ms',
          }}
        >
          <blockquote
            className="font-serif text-xl md:text-[28px] italic mx-auto max-w-[600px] leading-relaxed"
            style={{ color: '#8A9AB0' }}
          >
            {t("success.quote")}
          </blockquote>
          <p className="text-sm mt-4" style={{ color: '#4A5A70' }}>
            {t("success.author")}
          </p>
        </div>
      </div>
    </section>
  );
}
