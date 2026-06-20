import { useState } from 'react';
import { galleryProjects } from './gallery/catalog.js';
import { useStaticGeometry } from './gallery/use-static-geometry.js';
import { useVersionCheck } from './use-version-check.js';
import { ModelCanvas } from './viewer/model-canvas.js';

export function App(): React.JSX.Element {
  const visibleProjects = galleryProjects.filter((project) => !project.hidden);
  const [activeProjectId, setActiveProjectId] = useState(visibleProjects[0]?.id ?? '');
  const activeProject = visibleProjects.find((project) => project.id === activeProjectId) ?? visibleProjects[0];
  const renderState = useStaticGeometry(activeProject);
  const staticProjectCount = visibleProjects.filter((project) => project.modelUrl).length;
  const latestVersion = useVersionCheck();

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
          <span className={`status ${activeProject?.modelUrl ? renderState.status : 'idle'}`}>
            {activeProject?.modelUrl ? renderState.status : 'preview pending'}
          </span>
        </header>

        <div className="canvas-frame">
          {renderState.error ? <div className="message error">{renderState.error.message}</div> : null}
          {!renderState.error && renderState.geometry ? <ModelCanvas geometry={renderState.geometry} /> : null}
          {!renderState.error && !renderState.geometry && activeProject?.modelUrl ? (
            <div className="message">Loading static model...</div>
          ) : null}
          {!renderState.error && !renderState.geometry && !activeProject?.modelUrl ? (
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
    </main>
  );
}
