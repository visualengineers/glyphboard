import { WorkerTask } from './workertask';

export class WorkerThread {
  private parentPool: any;
  private workerTask: WorkerTask;

  constructor(parentPool: any) {
    this.parentPool = parentPool;
  }

  public run(workerTask) {
    this.workerTask = workerTask;
    // create a new web worker
    if (this.workerTask.script != null) {
      const worker = new Worker(workerTask.script);
      worker.addEventListener('message', (event) => {
        this.workerTask.callback(event);
        this.parentPool.freeWorkerThread(this);
      }, false);
      worker.postMessage(this.workerTask.startMessage);
    }
  }
}
