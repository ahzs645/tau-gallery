import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExportResult } from '@taucad/runtime';
import type { FileExtension, Geometry } from '@taucad/types';

export type RuntimeGalleryProject = {
  readonly mainFile: string;
  readonly files: Record<string, string | Uint8Array>;
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
const renderTimeoutMs = 45_000;

const exportUnavailable = async (): Promise<ExportResult> => ({
  success: false,
  issues: [{ message: 'Runtime client not initialized', code: 'RUNTIME', severity: 'error' }],
});

function normalizeRuntimeError(error: Error): Error {
  if (error.message.includes('SharedArrayBuffer')) {
    return new Error(
      'Live runtime rendering requires cross-origin isolation, but SharedArrayBuffer is unavailable on this static host.',
    );
  }

  return error;
}

type RuntimeExportClient = {
  readonly export: (format: FileExtension) => Promise<ExportResult>;
};

type RuntimeClientLike = RuntimeExportClient & {
  readonly openFile: (input: {
    readonly code: Record<string, string>;
    readonly file: string;
    readonly parameters?: Record<string, unknown>;
  }) => Promise<{ readonly superseded: boolean }>;
  readonly on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  readonly terminate: () => void;
};

export function useRenderedGeometry(project: RuntimeGalleryProject | undefined): RenderedGeometryState {
  const clientRef = useRef<RuntimeExportClient | undefined>(undefined);
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

    let active = true;
    let client: RuntimeClientLike | undefined;
    const unsubscribers: Array<() => void> = [];
    let renderTimeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    const clearRenderTimeout = (): void => {
      if (renderTimeoutId !== undefined) {
        globalThis.clearTimeout(renderTimeoutId);
        renderTimeoutId = undefined;
      }
    };
    const failRender = (error: Error): void => {
      if (!active) {
        return;
      }

      clearRenderTimeout();
      active = false;
      client?.terminate();
      if (clientRef.current === client) {
        clientRef.current = undefined;
      }
      setState((current) => ({
        ...current,
        status: 'error',
        geometry: undefined,
        error,
      }));
    };

    const onParametersResolved = (result: {
      readonly success: boolean;
      readonly data?: {
        readonly defaultParameters: Record<string, unknown>;
        readonly jsonSchema: unknown;
      };
    }): void => {
        if (!active) {
          return;
        }

        if (!result.success || !result.data) {
          return;
        }

        const data = result.data;
        if (!data) {
          return;
        }

        setState((current) => ({
          ...current,
          defaultParameters: data.defaultParameters,
          jsonSchema: data.jsonSchema as JsonSchema,
        }));
      };

    const onGeometry = (result: {
      readonly success: boolean;
      readonly data?: readonly Geometry[];
      readonly issues?: readonly { readonly message?: string }[];
    }): void => {
        if (!active) {
          return;
        }

        if (result.success) {
          clearRenderTimeout();
          setState((current) => ({
            ...current,
            status: 'success',
            geometry: result.data?.find((geometry) => geometry.format === 'gltf'),
            error: undefined,
          }));
          return;
        }

        clearRenderTimeout();
        setState((current) => ({
          ...current,
          status: 'error',
          geometry: undefined,
          error: new Error(result.issues?.[0]?.message ?? 'Render failed'),
        }));
      };

    const onError = (issues: readonly { readonly message?: string }[]): void => {
        if (!active) {
          return;
        }

        clearRenderTimeout();
        setState((current) => ({
          ...current,
          status: 'error',
          geometry: undefined,
          error: new Error(issues[0]?.message ?? 'Render failed'),
        }));
      };

    setState({
      status: 'loading',
      geometry: undefined,
      error: undefined,
      defaultParameters: emptyParameters,
      jsonSchema: undefined,
      exportGeometry,
    });

    renderTimeoutId = globalThis.setTimeout(() => {
      failRender(new Error(`Render timed out after ${Math.round(renderTimeoutMs / 1000)} seconds.`));
    }, renderTimeoutMs);

    void (async () => {
      try {
        const [{ createRuntimeClient }, { galleryRuntimeOptions }] = await Promise.all([
          import('@taucad/runtime'),
          import('./runtime-client.js'),
        ]);
        if (!active) {
          return;
        }

        const runtimeClient = createRuntimeClient(galleryRuntimeOptions) as unknown as RuntimeClientLike;
        client = runtimeClient;
        clientRef.current = runtimeClient;
        unsubscribers.push(
          runtimeClient.on('parametersResolved', onParametersResolved as (...args: unknown[]) => void),
          runtimeClient.on('geometry', onGeometry as (...args: unknown[]) => void),
          runtimeClient.on('error', onError as (...args: unknown[]) => void),
        );

        const outcome = await runtimeClient.openFile({
          code: project.files as Record<string, string>,
          file: project.mainFile,
          parameters: project.parameters,
        });

        if (!active || !outcome.superseded) {
          return;
        }

        setState((current) => ({
          ...current,
          status: 'idle',
          geometry: undefined,
        }));
      } catch (error) {
        failRender(normalizeRuntimeError(error instanceof Error ? error : new Error('Render failed.')));
      }
    })();

    return () => {
      active = false;
      clearRenderTimeout();
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      client?.terminate();
      if (clientRef.current === client) {
        clientRef.current = undefined;
      }
    };
  }, [project, exportGeometry]);

  return { ...state, exportGeometry };
}
