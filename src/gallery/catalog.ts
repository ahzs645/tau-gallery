export type GalleryProject = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kernel: 'Static GLTF';
  readonly modelUrl: string;
};

export const galleryProjects: readonly GalleryProject[] = [
  {
    id: 'rounded-tray',
    name: 'Reference triangle',
    description: 'A static glTF asset loaded through the gallery viewer shell.',
    kernel: 'Static GLTF',
    modelUrl: '/models/simple-tray/model.gltf',
  },
];
