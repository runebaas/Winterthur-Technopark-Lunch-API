function internalLoad(bin: typeof import('../pkg')): typeof import('../pkg') {
  return bin;
}

export async function loadWasm(): Promise<WasmBinary> {
  const wasm = internalLoad(await import(/* webpackChunkName: "wasmPkg" */'../pkg'));

  return {
    parseSkillsparkPdf: wasm.parse_skillspark_pdf,
    stuff: wasm.stuff
  };
}

interface WasmBinary {
  parseSkillsparkPdf(fileContent: Uint8Array): Promise<Uint8Array>;
  stuff(stuff: string): string;
}
