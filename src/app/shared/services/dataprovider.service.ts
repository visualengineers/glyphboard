import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/takeWhile';
import { environment } from 'environments/environment';

@Injectable()
export class DataproviderService {
  private backendAddress: string;
  public dataSets: any;
  public dataSet: any;
  private alive: boolean; // used to unsubscribe from the IntervalObservable when OnDestroy is called.

  private timer: Observable<number>;
  private interval: number;

  private dataSetsSubject = new BehaviorSubject<any>(this.dataSets);
  private dataSetSubject = new BehaviorSubject<any>(this.dataSet);
  private deliverSchema: any;
  private deliverFeature: any;
  private deliverPosition: any;
  private deliverMeta: any;

  constructor(private http: Http) {
    this.alive = true;
    this.interval = 10000;
    this.timer = Observable.timer(0, this.interval);
    this.backendAddress = environment.backendAddress === undefined
      ? 'http://localhost:4201/'
      : environment.backendAddress;

    this.timer
    .takeWhile(() => this.alive)
    .subscribe(() => {
      this.http.get(this.backendAddress + 'datasets')
        .subscribe((data) => {
            const response = data['_body'] || '';
            const newData = JSON.parse(response);
            if (this.jsonEqual(newData, this.dataSets)) {
              return; // check if changes occured in datasets
            }
            this.dataSets = newData;
            this.setDataSets(this.dataSets);
          });
    });
  }

  private jsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  public downloadDataSet(name: string, version: string, position: string) {
    this.http
      .get(this.backendAddress + 'datasets/' + name + '/' + version + '/schema')
      .subscribe((schemaData) => {
        const schemaResponse = schemaData['_body'] || '';
        this.deliverSchema = JSON.parse(schemaResponse);
        this.http
          .get(this.backendAddress + 'datasets/' + name + '/' + version + '/feature')
          .subscribe((featureData) => {
            const featureResponse = featureData['_body'] || '';
            this.deliverFeature = JSON.parse(featureResponse);
            this.http
              .get(this.backendAddress + 'datasets/' + name + '/' + version + '/position/' + position)
              .subscribe((positionData) => {
                const positionResponse = positionData['_body'] || '';
                this.deliverPosition = JSON.parse(positionResponse);
                // if meta is available
                this.http
                  .get(this.backendAddress + 'datasets/' + name + '/' + version + '/meta')
                  .subscribe((metaData) => {
                    const metaResponse = metaData['_body'] || '';
                    this.deliverMeta = JSON.parse(metaResponse);
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

  private setDataSets(value: string) {
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
