import { useEffect, useMemo, useState } from 'react';
import type { FileExtension } from '@taucad/types';
import type { GalleryProject } from './gallery/catalog.js';
import { galleryProjects } from './gallery/catalog.js';
import { downloadExport, downloadUrl, exportFilename } from './gallery/download.js';
import { mergeParameters, ParameterEditor } from './gallery/parameters.js';
import { useProjectPresets } from './gallery/use-project-presets.js';
import { useProjectSource } from './gallery/use-project-source.js';
import { useStaticGeometry } from './gallery/use-static-geometry.js';
import { useRenderedGeometry } from './tau/use-rendered-geometry.js';
import { useVersionCheck } from './use-version-check.js';
import { ModelCanvas } from './viewer/model-canvas.js';

export function App(): React.JSX.Element {
  const visibleProjects = galleryProjects.filter((project) => !project.hidden);
  const initialProject = getInitialProject(visibleProjects);
  const [activeProjectId, setActiveProjectId] = useState(initialProject?.id ?? '');
  const firstProject = initialProject ?? visibleProjects[0];
  const [parameters, setParameters] = useState<Record<string, unknown>>(firstProject?.initialParameters ?? {});
  const [exportingFormat, setExportingFormat] = useState<FileExtension | undefined>();
  const [actionError, setActionError] = useState<Error | undefined>();
  const [renderRequested, setRenderRequested] = useState(false);
  const activeProject = visibleProjects.find((project) => project.id === activeProjectId) ?? visibleProjects[0];
  const sourceState = useProjectSource(activeProject);
  const presetState = useProjectPresets(activeProject);
  const runtimeProject = useMemo(
    () =>
      activeProject?.runtime && sourceState.source && renderRequested
        ? {
            mainFile: activeProject.entry,
            source: sourceState.source,
            parameters,
          }
        : undefined,
    [activeProject, sourceState.source, parameters, renderRequested],
  );
  const runtimeState = useRenderedGeometry(runtimeProject);
  const staticState = useStaticGeometry(activeProject?.runtime ? undefined : activeProject);
  const renderState = activeProject?.runtime ? runtimeState : staticState;
  const staticProjectCount = visibleProjects.filter((project) => project.modelUrl).length;
  const latestVersion = useVersionCheck();
  const parameterValues = mergeParameters(runtimeState.defaultParameters, parameters);
  const exportFormats = activeProject?.exportFormats ?? [];
  const canRuntimeExport = Boolean(activeProject?.runtime && runtimeState.status === 'success' && runtimeState.geometry);
  const presets = activeProject?.presets ?? presetState.presets;
  const inspectorParameterValues =
    Object.keys(parameterValues).length > 0 ? parameterValues : (presets[0]?.parameters ?? {});

  useEffect(() => {
    setParameters(activeProject?.initialParameters ?? {});
    setRenderRequested(false);
    setActionError(undefined);
  }, [activeProject]);

  return (
    <main className="app-shell">
      {latestVersion ? (
        <div className="update-banner" role="status">
          <span>New gallery version available.</span>
          <button
            type="button"
            onClick={() => {
              globalThis.location.reload();
            }}
          >
            Refresh
          </button>
        </div>
      ) : null}

      <aside className="sidebar" aria-label="Gallery models">
        <div>
          <p className="eyebrow">Tau Gallery</p>
          <h1>Static CAD collection</h1>
          <p className="sidebar-note">
            {visibleProjects.length} playground projects imported. {staticProjectCount} has a committed GLB preview.
          </p>
        </div>
        <div className="project-list">
          {visibleProjects.map((project) => (
            <button
              key={project.id}
              className={project.id === activeProject?.id ? 'project-card active' : 'project-card'}
              type="button"
              onClick={() => {
                setActiveProjectId(project.id);
                writeProjectToUrl(project.id);
              }}
            >
              <span>{project.name}</span>
              <small>{project.modelUrl ? project.kernel : 'Source only'}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="viewer-panel">
        <header className="viewer-header">
          <div>
            <p className="eyebrow">{activeProject?.kernel ?? 'Tau'}</p>
            <h2>{activeProject?.name ?? 'No model selected'}</h2>
            <p>{activeProject?.description}</p>
            {activeProject ? (
              <a className="source-link" href={activeProject.sourceUrl}>
                {activeProject.entry}
              </a>
            ) : null}
          </div>
          <span className={`status ${activeProject?.runtime || activeProject?.modelUrl ? renderState.status : 'idle'}`}>
            {activeProject?.runtime
              ? renderRequested
                ? runtimeState.status
                : 'ready'
              : activeProject?.modelUrl
                ? renderState.status
                : 'preview pending'}
          </span>
        </header>

        <div className="canvas-frame">
          {sourceState.error ? <div className="message error">{sourceState.error.message}</div> : null}
          {!sourceState.error && renderState.error ? <div className="message error">{renderState.error.message}</div> : null}
          {!renderState.error && renderState.geometry ? <ModelCanvas geometry={renderState.geometry} /> : null}
          {!sourceState.error && !renderState.error && !renderState.geometry && activeProject?.runtime && renderRequested ? (
            <div className="message">Rendering from Tau runtime...</div>
          ) : null}
          {!sourceState.error && !renderState.error && !renderState.geometry && activeProject?.runtime && !renderRequested ? (
            <div className="message">
              <div>
                <strong>Runtime preview is ready</strong>
                <p>Use the render action to generate a live preview and enable runtime exports.</p>
              </div>
            </div>
          ) : null}
          {!sourceState.error && !renderState.error && !renderState.geometry && activeProject?.modelUrl ? (
            <div className="message">Loading static model...</div>
          ) : null}
          {!sourceState.error && !renderState.error && !renderState.geometry && !activeProject?.modelUrl && !activeProject?.runtime ? (
            <div className="message">
              <div>
                <strong>Preview not generated yet</strong>
                <p>This project has been imported from Tau playground source, but no static GLB is committed yet.</p>
                {activeProject ? <a href={activeProject.sourceUrl}>Open source file</a> : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="inspector" aria-label="Model controls">
        <section className="inspector-section">
          <div>
            <p className="eyebrow">Export</p>
            <h3>Files</h3>
          </div>
          <div className="action-list">
            {activeProject?.runtime ? (
              <button
                type="button"
                disabled={!sourceState.source || runtimeState.status === 'loading'}
                onClick={() => {
                  setRenderRequested(true);
                }}
              >
                {runtimeState.status === 'loading' ? 'Rendering...' : 'Render preview'}
              </button>
            ) : null}
            {exportFormats.map((format) => (
              <button
                key={format}
                type="button"
                disabled={!canRuntimeExport || exportingFormat !== undefined}
                onClick={() => {
                  setExportingFormat(format);
                  setActionError(undefined);
                  void runtimeState
                    .exportGeometry(format)
                    .then((result) => {
                      downloadExport(result, exportFilename(activeProject?.id ?? 'model', format));
                    })
                    .catch((error) => {
                      setActionError(error instanceof Error ? error : new Error('Export failed.'));
                    })
                    .finally(() => {
                      setExportingFormat(undefined);
                    });
                }}
              >
                {exportingFormat === format ? 'Exporting...' : `Export ${format.toUpperCase()}`}
              </button>
            ))}
            {activeProject?.modelUrl ? (
              <button
                type="button"
                onClick={() => {
                  setActionError(undefined);
                  const modelUrl = activeProject.modelUrl;
                  if (!modelUrl) {
                    return;
                  }

                  void downloadUrl(modelUrl, `${activeProject.id}.glb`).catch((error) => {
                    setActionError(error instanceof Error ? error : new Error('Download failed.'));
                  });
                }}
              >
                Download GLB
              </button>
            ) : null}
            {activeProject ? (
              <a className="control-link" href={activeProject.sourceUrl}>
                Open source
              </a>
            ) : null}
          </div>
          {actionError ? <p className="inspector-error">{actionError.message}</p> : null}
        </section>

        <section className="inspector-section parameters-section">
          <div>
            <p className="eyebrow">Parameters</p>
            <h3>Model settings</h3>
          </div>
          {activeProject?.runtime ? (
            <ParameterEditor
              schema={runtimeState.jsonSchema}
              values={inspectorParameterValues}
              presets={presets}
              onChange={setParameters}
            />
          ) : (
            <>
              {presets.length ? (
                <ParameterEditor
                  schema={undefined}
                  values={inspectorParameterValues}
                  presets={presets}
                  onChange={setParameters}
                />
              ) : null}
              <p className="inspector-note">
                This project is source-only in the gallery. Live parameter editing needs the matching Tau kernel bundled
                into this app.
              </p>
            </>
          )}
        </section>
      </aside>
    </main>
  );
}

function getInitialProject(projects: readonly GalleryProject[]): GalleryProject | undefined {
  const params = new URLSearchParams(globalThis.location.search);
  const candidate = params.get('model');
  return projects.find((project) => project.id === candidate) ?? projects[0];
}

function writeProjectToUrl(projectId: string): void {
  const url = new URL(globalThis.location.href);
  url.searchParams.set('model', projectId);
  globalThis.history.replaceState(null, '', url);
}
