import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class DataproviderService {
  private backendAddress: string;
  public dataSets: any = 0;
  public dataSet: any = 0;
  private alive: boolean; // used to unsubscribe from the IntervalObservable when OnDestroy is called.

  private timer: Observable<number>;
  private interval: number;

  private dataSetsSubject = new BehaviorSubject<any>(this.dataSets);
  private dataSetSubject = new BehaviorSubject<any>(this.dataSet);
  private deliverSchema: any;
  private deliverFeature: any;
  private deliverPosition: any;
  private deliverMeta: any;

  constructor(private http: HttpClient) {
    this.alive = true;
    this.interval = 10000;
    this.timer = timer(0, this.interval);
    this.backendAddress = environment.backendAddress === undefined
      ? 'http://localhost:4201'
      : environment.backendAddress;

    this.timer
    .pipe(takeWhile(() => this.alive))
    .subscribe(() => {
      this.http.get(this.backendAddress + 'datasets')
        .subscribe((data: any) => {
            const newData = data;
            if (this.jsonEqual(newData, this.dataSets)) {
              return; // check if changes occured in datasets
            }
            this.dataSets = newData;
            this.setDataSets(this.dataSets);
          });
    });
  }

  private jsonEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  public downloadDataSet(name: string, version: string, position: string) {
    this.http
      .get(this.backendAddress + 'datasets/' + name + '/' + version + '/schema')
      .subscribe((schemaData: any) => {
        this.deliverSchema = schemaData;
        this.http
          .get(this.backendAddress + 'datasets/' + name + '/' + version + '/feature')
          .subscribe((featureData: any) => {
            this.deliverFeature = featureData;
            this.http
              .get(this.backendAddress + 'datasets/' + name + '/' + version + '/position/' + position)
              .subscribe((positionData: any) => {
                this.deliverPosition = positionData;
                // if meta is available
                this.http
                  .get(this.backendAddress + 'datasets/' + name + '/' + version + '/meta')
                  .subscribe((metaData: any) => {
                    this.deliverMeta = metaData;
                    this.doSetDownloadedData();
                  }, error => {
                    this.doSetDownloadedData();
                  });
              });
          });
      });
  }

  private doSetDownloadedData() {
    this.dataSet = {
      schema: this.deliverSchema,
      features: this.deliverFeature,
      positions: this.deliverPosition,
      meta: this.deliverMeta
    };
    this.setDataSet(this.dataSet);
  }

  private setDataSets(value: any) {
    this.dataSetsSubject.next(value);
  }

  public getDataSets(): Observable<any> {
    return this.dataSetsSubject.asObservable();
  }

  private setDataSet(value: any) {
    this.dataSetSubject.next(value);
  }

  public getDataSet(): Observable<any> {
    return this.dataSetSubject.asObservable();
  }
}
