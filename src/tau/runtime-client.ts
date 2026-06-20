import { createRuntimeClientOptions } from '@taucad/runtime';
import { esbuild } from '@taucad/runtime/bundler';
import { fromMemoryFs } from '@taucad/runtime/filesystem';
import { replicad } from '@taucad/runtime/kernels';
import { inProcessTransport } from '@taucad/runtime/transport/in-process';

export const galleryRuntimeOptions = createRuntimeClientOptions({
  transport: inProcessTransport({ fileSystem: fromMemoryFs() }),
  kernels: [replicad()],
  bundlers: [esbuild()],
});
