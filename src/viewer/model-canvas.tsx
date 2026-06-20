import { useEffect, useRef, useState } from 'react';
import type { Geometry } from '@taucad/types';
import { AmbientLight, Box3, Color, DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import type { Material, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type ModelCanvasProps = {
  readonly geometry: Geometry;
};

export function ModelCanvas({ geometry }: ModelCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (geometry.format !== 'gltf' || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    const scene = new Scene();
    scene.background = new Color('#f7f7f2');

    const camera = new PerspectiveCamera(42, 1, 0.1, 10_000);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const key = new DirectionalLight('#ffffff', 3);
    key.position.set(2, 3, 4);
    scene.add(new AmbientLight('#ffffff', 1.8), key);

    let model: Object3D | undefined;
    let animationFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
    });

    const render = (): void => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    const loader = new GLTFLoader();
    const buffer = geometry.content.buffer.slice(
      geometry.content.byteOffset,
      geometry.content.byteOffset + geometry.content.byteLength,
    );

    loader.parse(
      buffer,
      '',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        fitCameraToObject(camera, controls, model);
        setError(undefined);
      },
      (parseError) => {
        setError(parseError instanceof Error ? parseError : new Error('Failed to parse GLB geometry.'));
      },
    );

    resizeObserver.observe(canvas);
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      if (model) {
        scene.remove(model);
        disposeObject(model);
      }
      renderer.dispose();
    };
  }, [geometry]);

  return (
    <>
      <canvas ref={canvasRef} className="model-canvas" aria-label="3D CAD model preview" />
      {error ? <div className="message error">{error.message}</div> : null}
    </>
  );
}

function fitCameraToObject(camera: PerspectiveCamera, controls: OrbitControls, object: Object3D): void {
  const bounds = new Box3().setFromObject(object);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  const distance = maxDimension * 2.2;

  camera.position.set(center.x + distance, center.y - distance, center.z + distance * 0.75);
  camera.near = Math.max(distance / 100, 0.1);
  camera.far = distance * 100;
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

function disposeObject(object: Object3D): void {
  object.traverse((child) => {
    const maybeMesh = child as Object3D & {
      geometry?: { dispose: () => void };
      material?: Material | Material[];
    };

    maybeMesh.geometry?.dispose();

    const materials = Array.isArray(maybeMesh.material) ? maybeMesh.material : [maybeMesh.material];
    for (const material of materials) {
      material?.dispose();
    }
  });
}
