import { useCallback, useEffect, useRef, useState } from 'react';
import { createRuntimeClient } from '@taucad/runtime';
import type { ExportResult, RuntimeClient } from '@taucad/runtime';
import type { FileExtension, Geometry } from '@taucad/types';
import { galleryRuntimeOptions } from './runtime-client.js';

export type RuntimeGalleryProject = {
  readonly mainFile: string;
  readonly source: string;
  readonly parameters?: Record<string, unknown>;
};

export type RenderStatus = 'idle' | 'loading' | 'success' | 'error';

export type JsonSchema = {
  readonly type?: string;
  readonly title?: string;
  readonly properties?: Record<string, JsonSchema>;
  readonly enum?: readonly unknown[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly multipleOf?: number;
  readonly default?: unknown;
};

export type RenderedGeometryState = {
  readonly status: RenderStatus;
  readonly geometry: Geometry | undefined;
  readonly error: Error | undefined;
  readonly defaultParameters: Record<string, unknown>;
  readonly jsonSchema: JsonSchema | undefined;
  readonly exportGeometry: (format: FileExtension) => Promise<ExportResult>;
};

const emptyParameters: Record<string, unknown> = {};

const exportUnavailable = async (): Promise<ExportResult> => ({
  success: false,
  issues: [{ message: 'Runtime client not initialized', code: 'RUNTIME', severity: 'error' }],
});

export function useRenderedGeometry(project: RuntimeGalleryProject | undefined): RenderedGeometryState {
  const clientRef = useRef<RuntimeClient | undefined>(undefined);
  const [state, setState] = useState<RenderedGeometryState>({
    status: 'idle',
    geometry: undefined,
    error: undefined,
    defaultParameters: emptyParameters,
    jsonSchema: undefined,
    exportGeometry: exportUnavailable,
  });

  const exportGeometry = useCallback(async (format: FileExtension): Promise<ExportResult> => {
    const client = clientRef.current;
    if (!client) {
      return exportUnavailable();
    }

    return client.export(format);
  }, []);

  useEffect(() => {
    if (!project) {
      setState({
        status: 'idle',
        geometry: undefined,
        error: undefined,
        defaultParameters: emptyParameters,
        jsonSchema: undefined,
        exportGeometry,
      });
      return;
    }

    const client = createRuntimeClient(galleryRuntimeOptions);
    clientRef.current = client;
    const unsubscribers = [
      client.on('parametersResolved', (result) => {
        if (!result.success) {
          return;
        }

        setState((current) => ({
          ...current,
          defaultParameters: result.data.defaultParameters,
          jsonSchema: result.data.jsonSchema as JsonSchema,
        }));
      }),
      client.on('geometry', (result) => {
        if (result.success) {
          setState((current) => ({
            ...current,
            status: 'success',
            geometry: result.data.find((geometry) => geometry.format === 'gltf'),
            error: undefined,
          }));
          return;
        }

        setState((current) => ({
          ...current,
          status: 'error',
          geometry: undefined,
          error: new Error(result.issues[0]?.message ?? 'Render failed'),
        }));
      }),
      client.on('error', (issues) => {
        setState((current) => ({
          ...current,
          status: 'error',
          geometry: undefined,
          error: new Error(issues[0]?.message ?? 'Render failed'),
        }));
      }),
    ];

    setState({
      status: 'loading',
      geometry: undefined,
      error: undefined,
      defaultParameters: emptyParameters,
      jsonSchema: undefined,
      exportGeometry,
    });

    void client.openFile({
      code: { [project.mainFile]: project.source },
      file: project.mainFile,
      parameters: project.parameters,
    });

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      client.terminate();
      if (clientRef.current === client) {
        clientRef.current = undefined;
      }
    };
  }, [project, exportGeometry]);

  return { ...state, exportGeometry };
}
