import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DiagnosticsData } from 'src/app/shared/util/diagnostics-data.interface';
import { DiagnosticsConverter } from 'src/app/shared/util/diagnostics-converter';
import { DiagnosticsDataEncoded } from 'src/app/shared/util/diagnostics-data.encoded';
import { environment } from 'src/environments/environment';

@Injectable()
export class DiagnosticsService {
  public static readonly diagnosticsRoute = `http://${environment.diagnosticsServerAddress}:${environment.diagnosticsServerPort}/log/appData`;
  public static headers: HttpHeaders = new HttpHeaders().set('content-type','application/json');

  public constructor(
      private readonly _httpClient: HttpClient
    ) {  }

    public submit(diagnostics: DiagnosticsData): void {
      if (!environment.sendDiagnosticsData) {
        return;
      }

      var msg = DiagnosticsConverter.toJson(diagnostics);

      this._httpClient.post<DiagnosticsDataEncoded>(
        DiagnosticsService.diagnosticsRoute,
        msg,
        { headers: DiagnosticsService.headers })
      .subscribe();
    }
}
