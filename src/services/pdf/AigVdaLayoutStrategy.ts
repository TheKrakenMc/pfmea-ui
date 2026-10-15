import type { FMEAPdfStrategy } from './fmeaExportStrategies';
import type { PfmeaPdfData } from '../../types/pfmeaExport.types';
import { generatePfmeaPdf } from '../pfmeaPdfGenerator';

export class AigVdaLayoutStrategy implements FMEAPdfStrategy<PfmeaPdfData> {
  name = 'AIAG & VDA (2019)';

  async generate(data: PfmeaPdfData, t: (key: string) => string): Promise<Blob> {
    return generatePfmeaPdf(data, t);
  }
}
