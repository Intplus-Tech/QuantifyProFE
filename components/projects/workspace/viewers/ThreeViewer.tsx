"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { ViewerLoadingOverlay, ViewerErrorOverlay } from "./shared";

interface ThreeViewerProps {
  url: string;
  extension: string;
  onLoaded?: () => void;
}

export function ThreeViewer({ url, extension, onLoaded }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;
    let animFrameId = 0;
    let rendererDomElement: HTMLCanvasElement | null = null;

    async function init() {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");

        if (disposed) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        rendererDomElement = renderer.domElement;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe8edf2);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100000);
        camera.position.set(0, 10, 30);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        scene.add(dirLight);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.5));

        const ext = extension.toLowerCase();
        let object: THREE.Object3D | null = null;

        if (ext === ".fbx") {
          const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");
          object = await new FBXLoader().loadAsync(url);
        } else if (ext === ".obj") {
          const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
          object = await new OBJLoader().loadAsync(url);
        } else if (ext === ".stl") {
          const { STLLoader } = await import("three/addons/loaders/STLLoader.js");
          const geometry = await new STLLoader().loadAsync(url);
          const material = new THREE.MeshPhongMaterial({ color: 0x8899aa, specular: 0x111111 });
          object = new THREE.Mesh(geometry, material);
        } else if (ext === ".ply") {
          const { PLYLoader } = await import("three/addons/loaders/PLYLoader.js");
          const geometry = await new PLYLoader().loadAsync(url);
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0x8899aa,
            vertexColors: geometry.hasAttribute("color"),
          });
          object = new THREE.Mesh(geometry, material);
        } else if (ext === ".dae") {
          const { ColladaLoader } = await import("three/addons/loaders/ColladaLoader.js");
          const collada = await new ColladaLoader().loadAsync(url);
          object = collada?.scene ?? null;
        } else {
          throw new Error(`Unsupported extension: ${extension}`);
        }

        if (disposed || !object) return;

        scene.add(object);

        // Frame the object in view
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = Math.max(Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5, 1);

        camera.position.set(center.x, center.y + maxDim * 0.5, center.z + cameraDistance);
        camera.near = cameraDistance / 1000;
        camera.far = cameraDistance * 100;
        camera.updateProjectionMatrix();
        controls.target.copy(center);
        controls.update();

        const resizeObserver = new ResizeObserver(() => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        resizeObserver.observe(container);

        function animate() {
          animFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        if (!disposed) {
          setLoading(false);
          onLoaded?.();
        }

        return () => {
          resizeObserver.disconnect();
          renderer.dispose();
        };
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Failed to load 3D model");
          setLoading(false);
        }
      }
    }

    const cleanup = init();

    return () => {
      disposed = true;
      cancelAnimationFrame(animFrameId);
      cleanup.then((fn) => fn?.());
      if (rendererDomElement && container.contains(rendererDomElement)) {
        container.removeChild(rendererDomElement);
      }
    };
  }, [url, extension, onLoaded]);

  return (
    <div className="relative w-full h-full">
      {loading && <ViewerLoadingOverlay label="Loading 3D model…" />}
      {error && <ViewerErrorOverlay message={error} />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
