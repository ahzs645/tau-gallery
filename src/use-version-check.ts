import { useEffect, useState } from 'react';

type AppVersion = {
  readonly commit?: string;
  readonly buildTime?: string;
};

const checkIntervalMs = 60_000;

const getVersionUrl = (): string => `${import.meta.env.BASE_URL}version.json`;

export const useVersionCheck = (): AppVersion | undefined => {
  const [latestVersion, setLatestVersion] = useState<AppVersion | undefined>();

  useEffect(() => {
    const currentCommit = import.meta.env.VITE_COMMIT_SHA;

    if (!currentCommit || currentCommit === 'dev') {
      return;
    }

    let cancelled = false;

    const checkVersion = async (): Promise<void> => {
      try {
        const response = await fetch(`${getVersionUrl()}?ts=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const version = (await response.json()) as AppVersion;

        if (!cancelled && version.commit && version.commit !== currentCommit) {
          setLatestVersion(version);
        }
      } catch {
        // A version check should never interrupt the gallery.
      }
    };

    void checkVersion();
    const timer = globalThis.setInterval(() => {
      void checkVersion();
    }, checkIntervalMs);

    return () => {
      cancelled = true;
      globalThis.clearInterval(timer);
    };
  }, []);

  return latestVersion;
};
