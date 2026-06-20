import { useEffect, useState } from 'react';
import type { GalleryProject } from './catalog.js';

type ProjectSourceState = {
  readonly files: Record<string, string | Uint8Array> | undefined;
  readonly error: Error | undefined;
};

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const useProjectSource = (project: GalleryProject | undefined): ProjectSourceState => {
  const [state, setState] = useState<ProjectSourceState>({ files: undefined, error: undefined });

  useEffect(() => {
    if (!project?.runtime) {
      setState({ files: undefined, error: undefined });
      return;
    }

    const controller = new AbortController();
    setState({ files: undefined, error: undefined });

    void (async () => {
      try {
        const entries = await Promise.all(
          project.projectFiles.map(async (file) => {
            const response = await fetch(assetUrl(`projects/${project.id}/${file}`), {
              signal: controller.signal,
            });
            if (!response.ok) {
              throw new Error(`Failed to load ${file}: ${response.status}`);
            }

            const contentType = response.headers.get('content-type') ?? '';
            const isText =
              contentType.startsWith('text/') ||
              contentType.includes('json') ||
              file.endsWith('.scad') ||
              file.endsWith('.ts') ||
              file.endsWith('.svg') ||
              file.endsWith('.txt');
            const content = isText ? await response.text() : new Uint8Array(await response.arrayBuffer());
            return [file, content] as const;
          }),
        );

        setState({ files: Object.fromEntries(entries), error: undefined });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          files: undefined,
          error: error instanceof Error ? error : new Error('Failed to load source.'),
        });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [project]);

  return state;
};
