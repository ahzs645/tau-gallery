import { useEffect, useState } from 'react';
import type { GalleryPreset, GalleryProject } from './catalog.js';

type ProjectPresetsState = {
  readonly presets: readonly GalleryPreset[];
};

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const useProjectPresets = (project: GalleryProject | undefined): ProjectPresetsState => {
  const [state, setState] = useState<ProjectPresetsState>({ presets: [] });

  useEffect(() => {
    if (!project) {
      setState({ presets: [] });
      return;
    }

    const controller = new AbortController();
    setState({ presets: [] });

    void (async () => {
      try {
        const response = await fetch(assetUrl(`projects/${project.id}/presets.json`), {
          signal: controller.signal,
        });

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load presets: ${response.status}`);
        }

        setState({ presets: (await response.json()) as GalleryPreset[] });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [project]);

  return state;
};
