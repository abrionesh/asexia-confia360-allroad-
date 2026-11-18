import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export const ThreeHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const themeRef = useRef(isDark);

  useEffect(() => {
    themeRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic Colored Point Lights in Sapphire Blue and Emerald Green
    const sapphireLight = new THREE.PointLight(0x0284c7, 4.2, 50);
    sapphireLight.position.set(-10, 8, 12);
    scene.add(sapphireLight);

    const emeraldLight = new THREE.PointLight(0x22c55e, 4.6, 50);
    emeraldLight.position.set(10, -6, 14);
    scene.add(emeraldLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(0, 12, -8);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(isDark ? 0x0a192f : 0xe2e8f0, isDark ? 1.6 : 2.4);
    scene.add(ambientLight);

    // 1. Central 3D Digital Globe / Tech Icosahedron + Faceted Core
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const icosaGeom = new THREE.IcosahedronGeometry(6.6, 2);
    const icosaMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0284c7 : 0x0369a1,
      wireframe: true,
      roughness: 0.35,
      metalness: 0.65,
      transparent: true,
      opacity: isDark ? 0.2 : 0.1,
    });
    const icosaMesh = new THREE.Mesh(icosaGeom, icosaMat);
    globeGroup.add(icosaMesh);

    // Inner glowing wireframe sphere
    const innerGeom = new THREE.SphereGeometry(4.2, 18, 18);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.11 : 0.06,
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    globeGroup.add(innerMesh);

    // Inner faceted crystal core catching specular sapphire/emerald lights
    const coreGeom = new THREE.OctahedronGeometry(2.3, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f3b6e : 0x38bdf8,
      emissive: 0x064e3b,
      emissiveIntensity: isDark ? 0.35 : 0.15,
      roughness: 0.2,
      metalness: 0.85,
      flatShading: true,
      transparent: true,
      opacity: isDark ? 0.32 : 0.16,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    globeGroup.add(coreMesh);

    // 2. Ambient constellation points + connecting network segments
    const pointsCount = 68;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);
    const nodeVectors: THREE.Vector3[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const radius = 6.3 + Math.random() * 6.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.sin(phi) * Math.sin(theta);
      const pz = radius * Math.cos(phi);

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      nodeVectors.push(new THREE.Vector3(px, py, pz));

      const ratio = i / pointsCount;
      colors[i * 3] = 0.01 * (1 - ratio) + 0.13 * ratio;
      colors[i * 3 + 1] = 0.52 * (1 - ratio) + 0.85 * ratio;
      colors[i * 3 + 2] = 0.85 * (1 - ratio) + 0.35 * ratio;
    }

    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.45 : 0.25,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const pointCloud = new THREE.Points(pointsGeom, pointsMat);
    globeGroup.add(pointCloud);

    // Connect nearby constellation nodes with delicate 3D network lines
    const linePositions: number[] = [];
    const maxLinkDistance = 4.6;
    for (let i = 0; i < nodeVectors.length; i++) {
      for (let j = i + 1; j < nodeVectors.length; j++) {
        if (nodeVectors[i].distanceTo(nodeVectors[j]) < maxLinkDistance) {
          linePositions.push(
            nodeVectors[i].x,
            nodeVectors[i].y,
            nodeVectors[i].z,
            nodeVectors[j].x,
            nodeVectors[j].y,
            nodeVectors[j].z
          );
        }
      }
    }
    const linksGeom = new THREE.BufferGeometry();
    linksGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linksMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: isDark ? 0.14 : 0.07,
    });
    const linksMesh = new THREE.LineSegments(linksGeom, linksMat);
    globeGroup.add(linksMesh);

    // 3. 3D Orbit Rings in Sapphire Blue & Emerald
    const ring1Geom = new THREE.TorusGeometry(9.8, 0.035, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.22 : 0.1,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    globeGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(12.2, 0.03, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: isDark ? 0.18 : 0.09,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    globeGroup.add(ring2);

    const ring3Geom = new THREE.TorusGeometry(8.1, 0.02, 12, 96);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: isDark ? 0.14 : 0.07,
    });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    ring3.rotation.y = -Math.PI / 3;
    ring3.rotation.x = Math.PI / 5;
    globeGroup.add(ring3);

    // Dual satellite orbital orbs (Emerald + Sapphire)
    const orbGeom = new THREE.SphereGeometry(0.36, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    scene.add(orb);

    const orb2Geom = new THREE.SphereGeometry(0.28, 16, 16);
    const orb2Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const orb2 = new THREE.Mesh(orb2Geom, orb2Mat);
    scene.add(orb2);

    globeGroup.position.set(4, 0, 0);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollFactor = 0;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      targetX = (x / rect.width) * 2;
      targetY = -(y / rect.height) * 2;
    };

    const handleScroll = () => {
      scrollFactor = Math.min(1.5, window.scrollY / 600);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);

      if (container.clientWidth < 1024) {
        globeGroup.position.set(0, 2, -4);
      } else {
        globeGroup.position.set(4.5, 0.5, 0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = prefersReducedMotion ? 0 : clock.getElapsedTime();

      const currentDark = themeRef.current;
      ambientLight.color.setHex(currentDark ? 0x0a192f : 0xe2e8f0);
      ambientLight.intensity = currentDark ? 1.6 : 2.4;
      icosaMat.color.setHex(currentDark ? 0x0284c7 : 0x0369a1);
      coreMat.color.setHex(currentDark ? 0x0f3b6e : 0x38bdf8);
      coreMat.opacity = currentDark ? 0.32 : 0.16;
      linksMat.opacity = currentDark ? 0.14 : 0.07;

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      globeGroup.rotation.y = elapsed * 0.12 + mouseX * 0.45;
      globeGroup.rotation.x = mouseY * 0.35 + Math.sin(elapsed * 0.3) * 0.06 + scrollFactor * 0.18;
      globeGroup.position.z = -scrollFactor * 2.5;

      icosaMesh.rotation.y = elapsed * 0.15;
      innerMesh.rotation.x = -elapsed * 0.2;
      coreMesh.rotation.y = -elapsed * 0.32;
      coreMesh.rotation.z = elapsed * 0.24;

      ring1.rotation.z = elapsed * 0.08;
      ring2.rotation.z = -elapsed * 0.06;
      ring3.rotation.z = elapsed * 0.11;

      const orbAngle = elapsed * 0.78;
      orb.position.x = globeGroup.position.x + Math.cos(orbAngle) * 9.8;
      orb.position.y = globeGroup.position.y + Math.sin(orbAngle) * Math.sin(Math.PI / 3) * 9.8;
      orb.position.z = globeGroup.position.z + Math.sin(orbAngle) * Math.cos(Math.PI / 3) * 9.8;

      const orb2Angle = -elapsed * 0.55 + Math.PI;
      orb2.position.x = globeGroup.position.x + Math.cos(orb2Angle) * 12.2;
      orb2.position.y = globeGroup.position.y + Math.sin(orb2Angle) * Math.sin(-Math.PI / 6) * 12.2;
      orb2.position.z = globeGroup.position.z + Math.sin(orb2Angle) * Math.cos(-Math.PI / 6) * 12.2;

      sapphireLight.position.x = -10 + mouseX * 9;
      sapphireLight.position.y = 8 + mouseY * 7;
      emeraldLight.position.x = 10 - mouseX * 6;
      emeraldLight.position.y = -6 - mouseY * 5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      icosaGeom.dispose();
      icosaMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      pointsGeom.dispose();
      pointsMat.dispose();
      linksGeom.dispose();
      linksMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      ring3Geom.dispose();
      ring3Mat.dispose();
      orbGeom.dispose();
      orbMat.dispose();
      orb2Geom.dispose();
      orb2Mat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-500 ${
        isDark ? 'opacity-85' : 'opacity-65'
      }`}
      aria-hidden="true"
    />
  );
};
