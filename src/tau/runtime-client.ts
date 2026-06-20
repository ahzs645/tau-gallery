import { createRuntimeClientOptions } from '@taucad/runtime';
import { esbuild } from '@taucad/runtime/bundler';
import { fromMemoryFs } from '@taucad/runtime/filesystem';
import { replicad } from '@taucad/runtime/kernels';
import { webWorkerTransport } from '@taucad/runtime/transport/web';
import { openscad } from '@taucad/openscad';

export const galleryRuntimeOptions = createRuntimeClientOptions({
  transport: webWorkerTransport({ fileSystem: fromMemoryFs() }),
  kernels: [replicad(), openscad()],
  bundlers: [esbuild()],
  renderTimeout: 45_000,
});
