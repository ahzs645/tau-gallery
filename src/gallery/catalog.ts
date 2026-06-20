import type { FileExtension } from '@taucad/types';

export type GalleryProject = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kernel: string;
  readonly entry: string;
  readonly sourceUrl: string;
  readonly projectFiles: readonly string[];
  readonly modelUrl?: string;
  readonly runtime?: 'replicad' | 'openscad';
  readonly exportFormats?: readonly FileExtension[];
  readonly presets?: readonly GalleryPreset[];
  readonly initialParameters?: Record<string, unknown>;
  readonly unsupportedReason?: string;
  readonly hidden: boolean;
};

export type GalleryPreset = {
  readonly name: string;
  readonly parameters: Record<string, unknown>;
};

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const galleryProjects: readonly GalleryProject[] = [
  {
    id: '3d-rack-scad',
    name: '3D Rack System',
    description: 'Customizable modular rack system for organizing components and tools',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/3d-rack-scad/main.scad'),
    projectFiles: ['main.scad', 'presets.json', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'atmospheric-sampler',
    name: 'Atmospheric Sampler',
    description: 'Static 3D model of an atmospheric sampler device.',
    kernel: 'Static',
    entry: 'atmospheric-sampler.glb',
    sourceUrl: assetUrl('projects/atmospheric-sampler/atmospheric-sampler.glb'),
    projectFiles: ['atmospheric-sampler.glb', 'project.json'],
    modelUrl: assetUrl('projects/atmospheric-sampler/atmospheric-sampler.glb'),
    hidden: false,
  },
  {
    id: 'keyguard-with-raised-tabs',
    name: 'Customizable Keyguard',
    description: '3D printable keyguard for tablets and AAC devices with customizable raised tabs',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/keyguard-with-raised-tabs/main.scad'),
    projectFiles: ['main.scad', 'openings_and_additions.txt', 'presets.json', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'networking',
    name: 'Network Equipment Rack',
    description: 'Custom rack system for network equipment including POE switches and patch panels',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/networking/main.scad'),
    projectFiles: ['main.scad', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'parametric-gel-comb',
    name: 'Parametric Gel Comb',
    description:
      'Customizable gel comb with adjustable tooth count, tooth and bar thickness, ridges, slots, and side hooks',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/parametric-gel-comb/main.scad'),
    projectFiles: ['main.scad', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'pendant-lamp',
    name: 'Pleated Pendant Lamp',
    description: 'Elegant pleated pendant lamp shade with customizable dimensions and pleating patterns',
    kernel: 'OpenSCAD',
    entry: 'Main.scad',
    sourceUrl: assetUrl('projects/pendant-lamp/Main.scad'),
    projectFiles: ['Main.scad', 'presets.json', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'periodic-table',
    name: 'Interlocking Boxes System',
    description: 'Modular interlocking box system perfect for organizing small parts and components',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/periodic-table/main.scad'),
    projectFiles: ['main.scad', 'presets.json', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'pet-bottle-opener',
    name: 'Modular PET Bottle Opener (OpenCascade)',
    description:
      "Parametric PET bottle / cap opener with a chamfered, faceted rim and a recessed band of angled contact + support fins, matching the 'New Standard' STEP reference. One cap-diameter knob sizes the head; an optional lower module adds a finger hole or a same/smaller second opener. Exportable to solid STEP as well as mesh formats.",
    kernel: 'Replicad',
    entry: 'main.ts',
    sourceUrl: assetUrl('projects/pet-bottle-opener/main.ts'),
    projectFiles: ['main.ts', 'presets.json', 'project.json'],
    runtime: 'replicad',
    exportFormats: ['glb', 'stl', '3mf', 'step'],
    initialParameters: {
      lower: { module: 'none' },
    },
    presets: [
      { name: 'Thick release (22 mm)', parameters: { body: { thickness: 22 }, lower: { module: 'none' } } },
      { name: 'Thin release (14 mm)', parameters: { body: { thickness: 14 }, lower: { module: 'none' } } },
      { name: 'Extra-thin release (10 mm)', parameters: { body: { thickness: 10 }, lower: { module: 'none' } } },
      {
        name: 'Thin handle',
        parameters: {
          body: { thickness: 14 },
          lower: { module: 'handle', handleHoleDiameter: 25, handleOuterRadius: 17.5 },
        },
      },
      {
        name: 'Dual opener (smaller)',
        parameters: {
          body: { thickness: 14 },
          lower: { module: 'opener', openerSize: 'smaller', secondCapDiameter: 19, centerDistance: 63 },
        },
      },
      {
        name: 'Dual opener (same)',
        parameters: {
          body: { thickness: 14 },
          lower: { module: 'opener', openerSize: 'same', centerDistance: 68 },
        },
      },
      { name: 'Round rim', parameters: { body: { outerSides: 64 } } },
    ],
    hidden: false,
  },
  {
    id: 'pre-chamber-nozzle-insert',
    name: 'Pre-Chamber Nozzle Insert',
    description:
      'Custom M14x1.25-to-M10x1.0 spark-plug pre-chamber / jet-ignition nozzle insert. Reverse-engineered starter CAD with BOSL2 helical threads, selectable original/corrected hex and collar dimensions, conical nozzle tip, 2.5 mm axial orifice, and angled 2.5/1.0 mm side jet holes. SCAD source included alongside the pre-rendered metal GLB.',
    kernel: 'OpenSCAD',
    entry: 'prechamber_nozzle_insert_BOSL2_threads.scad',
    sourceUrl: assetUrl('projects/pre-chamber-nozzle-insert/prechamber_nozzle_insert_BOSL2_threads.scad'),
    projectFiles: ['prechamber_nozzle_insert_BOSL2_threads.scad', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'saboteur-card-holder',
    name: 'Card Holder Grid',
    description: 'Organizational grid system for holding and displaying cards, perfect for board games',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/saboteur-card-holder/main.scad'),
    projectFiles: ['main.scad', 'project.json'],
    unsupportedReason: 'This upstream project includes grid.scad, but that file is not present in the Tau playground source tree.',
    hidden: false,
  },
  {
    id: 'stamp',
    name: 'Stamp',
    description: 'SVG-driven stamp generator using uploaded artwork',
    kernel: 'OpenSCAD',
    entry: 'Main.scad',
    sourceUrl: assetUrl('projects/stamp/Main.scad'),
    projectFiles: ['Main.scad', 'project.json', 'stamp_template_handle.stl', 'stamp_template_knub.stl', 'yaa.svg'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'tray-scad',
    name: 'Custom Tray System',
    description: 'Customizable tray system for organizing tools and small items',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/tray-scad/main.scad'),
    projectFiles: ['main.scad', 'project.json'],
    unsupportedReason:
      'This upstream project includes Untitled-1.scad, but that file is not present in the Tau playground source tree.',
    hidden: false,
  },
  {
    id: 'vane-trap',
    name: 'Vane Trap Device',
    description: 'Custom vane trap mechanism with adjustable parameters',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/vane-trap/main.scad'),
    projectFiles: ['main.scad', 'presets.json', 'project.json'],
    runtime: 'openscad',
    exportFormats: ['glb', 'gltf'],
    hidden: false,
  },
  {
    id: 'wham',
    name: 'Wham Project',
    description: 'Experimental design project with customizable features',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/wham/main.scad'),
    projectFiles: ['main.scad', 'project.json'],
    unsupportedReason:
      'This upstream project includes Untitled-1.scad, but that file is not present in the Tau playground source tree.',
    hidden: true,
  },
];
