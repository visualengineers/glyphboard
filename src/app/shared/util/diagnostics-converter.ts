import { DiagnosticsDataEncoded } from './diagnostics-data.encoded';
import { DiagnosticsData } from './diagnostics-data.interface';

export class DiagnosticsConverter {

  public static readonly appId = 'ReFlex.Apps.Glyphboard'

  public static toCsv(data: DiagnosticsData): string {
    const timestamp = Date.now();

    return `${this.appId};${data.eventTypeDescription};${this.firstLine(data?.data1 ?? "")};${this.firstLine(data?.data2 ?? "")};${this.firstLine(data?.remarks ?? "")};${timestamp}`;
  }

  public static toJson(data: DiagnosticsData): DiagnosticsDataEncoded {
    const msg = DiagnosticsConverter.toCsv(data);
    return { message: msg };
  }

  private static firstLine(rawValue: string): string {
    const index = rawValue.search(/[\r\n]/);
    return index >= 0 ? rawValue.substring(0, index) : rawValue;
  }
}
