export interface Runner {
  getInputs(): { data(): Int8Array; delete(): void }[];
  getOutputs(): { data(): Uint8Array; delete(): void }[];
  infer(): boolean;
  cleanUp(): void;
}
