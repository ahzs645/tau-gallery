import { useState } from 'react';
import { galleryProjects } from './gallery/catalog.js';
import { useStaticGeometry } from './gallery/use-static-geometry.js';
import { ModelCanvas } from './viewer/model-canvas.js';

export function App(): React.JSX.Element {
  const [activeProjectId, setActiveProjectId] = useState(galleryProjects[0]?.id ?? '');
  const activeProject = galleryProjects.find((project) => project.id === activeProjectId) ?? galleryProjects[0];
  const renderState = useStaticGeometry(activeProject);

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Gallery models">
        <div>
          <p className="eyebrow">Tau Gallery</p>
          <h1>Static CAD collection</h1>
        </div>
        <div className="project-list">
          {galleryProjects.map((project) => (
            <button
              key={project.id}
              className={project.id === activeProject?.id ? 'project-card active' : 'project-card'}
              type="button"
              onClick={() => {
                setActiveProjectId(project.id);
              }}
            >
              <span>{project.name}</span>
              <small>{project.kernel}</small>
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
          </div>
          <span className={`status ${renderState.status}`}>{renderState.status}</span>
        </header>

        <div className="canvas-frame">
          {renderState.error ? <div className="message error">{renderState.error.message}</div> : null}
          {!renderState.error && renderState.geometry ? <ModelCanvas geometry={renderState.geometry} /> : null}
          {!renderState.error && !renderState.geometry ? <div className="message">Loading static model...</div> : null}
        </div>
      </section>
    </main>
  );
}
