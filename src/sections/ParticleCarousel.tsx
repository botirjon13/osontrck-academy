import { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";

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
  radius,
  angleStep,
}: {
  index: number;
  texture: THREE.Texture;
  radius: number;
  angleStep: number;
}) {
  const angle = index * angleStep;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <mesh position={[x, 0, z]} rotation={[0, -angle, 0]}>
      <planeGeometry args={[1.2, 1.6]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Carousel() {
  const groupRef = useRef<THREE.Group>(null);
  const wheelDelta = useRef(0);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const dragCurrent = useRef(0);

  const textures = useTexture(IMAGE_LIST);
  const radius = 3.5;
  const angleStep = (2 * Math.PI) / 12;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.y += wheelDelta.current * 0.001;
      wheelDelta.current *= 0.95;

      if (isDragging.current) {
        const deltaX = dragCurrent.current - dragStart.current;
        groupRef.current.rotation.y += deltaX * 0.005;
        dragStart.current = dragCurrent.current;
      }
    }
  });

  const handleWheel = (e: WheelEvent) => {
    wheelDelta.current += e.deltaY * 0.001;
  };

  const handlePointerDown = (e: PointerEvent) => {
    isDragging.current = true;
    dragStart.current = e.clientX;
    dragCurrent.current = e.clientX;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging.current) {
      dragCurrent.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => (
        <CarouselCard
          key={i}
          index={i}
          texture={texture}
          radius={radius}
          angleStep={angleStep}
        />
      ))}
    </group>
  );
}

function ParticleRing() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const PARTICLE_COUNT = 2000;

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 4 + Math.random() * 2,
      speed: 0.05 + Math.random() * 0.15,
      yOffset: (Math.random() - 0.5) * 1.0,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.angle += p.speed * 0.016;
      const x = Math.cos(p.angle) * p.radius;
      const z = Math.sin(p.angle) * p.radius;
      const y = Math.sin(time * p.speed + p.wobble) * p.yOffset;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.5 + Math.sin(time + p.wobble) * 0.3);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshBasicMaterial
        color="#D4A853"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function DirectionalLightPillar() {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 2.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
          float verticalFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
          float pulse = 0.5 + 0.5 * sin(uTime * 0.5);
          float n = noise(vUv * 10.0 + uTime * 0.1) * 0.3 + 0.7;
          float alpha = edgeFade * verticalFade * pulse * n * 0.15 * uIntensity;
          gl_FragColor = vec4(0.83, 0.66, 0.33, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} material={shaderMaterial}>
      <planeGeometry args={[4, 6]} />
    </mesh>
  );
}

export default function ParticleCarousel() {
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
          <div style={{ width: '100%', height: '500px' }}>
            <Canvas
              camera={{ position: [0, 0, 6], fov: 50 }}
              style={{ background: '#0D1B2A' }}
            >
              <Suspense fallback={null}>
                <Carousel />
                <ParticleRing />
                <DirectionalLightPillar />
              </Suspense>
            </Canvas>
          </div>
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
