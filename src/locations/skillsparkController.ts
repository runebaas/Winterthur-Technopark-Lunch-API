import axios from 'axios';
import { ApiResponse } from '../api';
import { LocationResponse } from '../sharedModels';
import { loadWasm } from '../wasmLoader';

export async function getSkillsparkMenu(): Promise<ApiResponse<LocationResponse>> {
  const { parseSkillsparkPdf } = await loadWasm();

  const docBuffer = await axios.get<ArrayBuffer>('https://skillspark.ch/images/menu.pdf', { responseType: 'arraybuffer' });

  const result = await parseSkillsparkPdf(new Uint8Array(docBuffer.data));
  const stuff = Buffer.from(result).toString();

  return {
    statusCode: 200,
    body: JSON.parse(stuff)
  };
}
