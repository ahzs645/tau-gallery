export type GalleryProject = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kernel: string;
  readonly entry: string;
  readonly sourceUrl: string;
  readonly modelUrl?: string;
  readonly hidden: boolean;
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
    hidden: false,
  },
  {
    id: 'atmospheric-sampler',
    name: 'Atmospheric Sampler',
    description: 'Static 3D model of an atmospheric sampler device.',
    kernel: 'Static',
    entry: 'atmospheric-sampler.glb',
    sourceUrl: assetUrl('projects/atmospheric-sampler/atmospheric-sampler.glb'),
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
    hidden: false,
  },
  {
    id: 'networking',
    name: 'Network Equipment Rack',
    description: 'Custom rack system for network equipment including POE switches and patch panels',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/networking/main.scad'),
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
    hidden: false,
  },
  {
    id: 'pendant-lamp',
    name: 'Pleated Pendant Lamp',
    description: 'Elegant pleated pendant lamp shade with customizable dimensions and pleating patterns',
    kernel: 'OpenSCAD',
    entry: 'Main.scad',
    sourceUrl: assetUrl('projects/pendant-lamp/Main.scad'),
    hidden: false,
  },
  {
    id: 'periodic-table',
    name: 'Interlocking Boxes System',
    description: 'Modular interlocking box system perfect for organizing small parts and components',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/periodic-table/main.scad'),
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
    hidden: false,
  },
  {
    id: 'saboteur-card-holder',
    name: 'Card Holder Grid',
    description: 'Organizational grid system for holding and displaying cards, perfect for board games',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/saboteur-card-holder/main.scad'),
    hidden: false,
  },
  {
    id: 'stamp',
    name: 'Stamp',
    description: 'SVG-driven stamp generator using uploaded artwork',
    kernel: 'OpenSCAD',
    entry: 'Main.scad',
    sourceUrl: assetUrl('projects/stamp/Main.scad'),
    hidden: false,
  },
  {
    id: 'tray-scad',
    name: 'Custom Tray System',
    description: 'Customizable tray system for organizing tools and small items',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/tray-scad/main.scad'),
    hidden: false,
  },
  {
    id: 'vane-trap',
    name: 'Vane Trap Device',
    description: 'Custom vane trap mechanism with adjustable parameters',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/vane-trap/main.scad'),
    hidden: false,
  },
  {
    id: 'wham',
    name: 'Wham Project',
    description: 'Experimental design project with customizable features',
    kernel: 'OpenSCAD',
    entry: 'main.scad',
    sourceUrl: assetUrl('projects/wham/main.scad'),
    hidden: true,
  },
];
