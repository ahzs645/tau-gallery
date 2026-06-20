import { useEffect, useState } from 'react';
import { createRuntimeClient } from '@taucad/runtime';
import type { Geometry } from '@taucad/types';
import { galleryRuntimeOptions } from './runtime-client.js';

export type RuntimeGalleryProject = {
  readonly mainFile: string;
  readonly source: string;
};

export type RenderStatus = 'idle' | 'loading' | 'success' | 'error';

export type RenderedGeometryState = {
  readonly status: RenderStatus;
  readonly geometry: Geometry | undefined;
  readonly error: Error | undefined;
};

export function useRenderedGeometry(project: RuntimeGalleryProject | undefined): RenderedGeometryState {
  const [state, setState] = useState<RenderedGeometryState>({
    status: 'idle',
    geometry: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (!project) {
      setState({ status: 'idle', geometry: undefined, error: undefined });
      return;
    }

    const client = createRuntimeClient(galleryRuntimeOptions);
    const unsubscribers = [
      client.on('geometry', (result) => {
        if (result.success) {
          setState({
            status: 'success',
            geometry: result.data.find((geometry) => geometry.format === 'gltf'),
            error: undefined,
          });
          return;
        }

        setState({
          status: 'error',
          geometry: undefined,
          error: new Error(result.issues[0]?.message ?? 'Render failed'),
        });
      }),
      client.on('error', (issues) => {
        setState({
          status: 'error',
          geometry: undefined,
          error: new Error(issues[0]?.message ?? 'Render failed'),
        });
      }),
    ];

    setState({ status: 'loading', geometry: undefined, error: undefined });

    void client.openFile({
      code: { [project.mainFile]: project.source },
      file: project.mainFile,
    });

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      client.terminate();
    };
  }, [project]);

  return state;
}
