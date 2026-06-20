import { useEffect, useState } from 'react';
import type { GalleryProject } from './catalog.js';

type ProjectSourceState = {
  readonly source: string | undefined;
  readonly error: Error | undefined;
};

export const useProjectSource = (project: GalleryProject | undefined): ProjectSourceState => {
  const [state, setState] = useState<ProjectSourceState>({ source: undefined, error: undefined });

  useEffect(() => {
    if (!project?.runtime) {
      setState({ source: undefined, error: undefined });
      return;
    }

    const controller = new AbortController();
    setState({ source: undefined, error: undefined });

    void (async () => {
      try {
        const response = await fetch(project.sourceUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load source: ${response.status}`);
        }

        setState({ source: await response.text(), error: undefined });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          source: undefined,
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
