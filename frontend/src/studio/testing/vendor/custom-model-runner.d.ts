import type { Runner } from './index';
export function compileModel(buffer: ArrayBuffer): unknown;
export class CustomWakeWordModelRunner implements Runner {
  constructor(model: unknown);
  getInputs(): { data(): Int8Array; delete(): void }[];
  getOutputs(): { data(): Uint8Array; delete(): void }[];
  infer(): boolean;
  cleanUp(): void;
}
