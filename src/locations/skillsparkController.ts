import axios from 'axios';
import { ApiResponse } from '../api';
import { LocationResponse } from '../sharedModels';
import { loadWasm } from '../wasmLoader';

export async function getSkillsparkMenu(): Promise<ApiResponse<LocationResponse>> {
  const { parseSkillsparkPdf } = await loadWasm();

  const docBuffer = await axios.get<ArrayBuffer>('https://skillspark.ch/images/menu.pdf', { responseType: 'arraybuffer' });

  const result = await parseSkillsparkPdf(new Uint8Array(docBuffer.data));
  const stuff = JSON.parse(Buffer.from(result).toString()) as Week;

  return {
    statusCode: 200,
    body: stuff
  };
}

interface Week {
  montag: Day;
  dienstag: Day;
  mitwoch: Day;
  donnerstag: Day;
  freitag: Day;
  taglich: string[];
  unknown: string[];
}

interface Day {
  tag: string;
  traditionell: string[];
  vegetarisch: string[];
}
