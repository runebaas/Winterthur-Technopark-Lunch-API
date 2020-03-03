function internalLoad(bin: typeof import('../../pkg')): typeof import('../../pkg') {
  return bin;
}

export async function loadWasm(): Promise<WasmBinary> {
  const wasm = internalLoad(await import(/* webpackChunkName: "wasmPkg" */'../../pkg'));

  return {
    parseSkillsparkPdf: wasm.parse_skillspark_pdf,
    parseEurestCafeteriaPdf: wasm.parse_eurest_cafeteria_pdf
  };
}

interface WasmBinary {
  parseSkillsparkPdf(fileContent: Uint8Array): Promise<string>;
  parseEurestCafeteriaPdf(fileContent: Uint8Array): Promise<string>;
}
