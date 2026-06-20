import { useEffect, useState } from 'react';
import type { Geometry } from '@taucad/types';
import type { GalleryProject } from './catalog.js';

export type StaticGeometryState = {
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly geometry: Geometry | undefined;
  readonly error: Error | undefined;
};

export function useStaticGeometry(project: GalleryProject | undefined): StaticGeometryState {
  const [state, setState] = useState<StaticGeometryState>({
    status: 'idle',
    geometry: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (!project) {
      setState({ status: 'idle', geometry: undefined, error: undefined });
      return;
    }

    const modelUrl = project.modelUrl;
    if (!modelUrl) {
      setState({ status: 'idle', geometry: undefined, error: undefined });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading', geometry: undefined, error: undefined });

    void (async () => {
      try {
        const response = await fetch(modelUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load static model: ${response.status}`);
        }

        const content = new Uint8Array(await response.arrayBuffer());
        setState({
          status: 'success',
          geometry: {
            format: 'gltf',
            content,
            hash: `static:${modelUrl}`,
          },
          error: undefined,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          status: 'error',
          geometry: undefined,
          error: error instanceof Error ? error : new Error('Failed to load static model.'),
        });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [project]);

  return state;
}
