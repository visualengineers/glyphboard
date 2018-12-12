import { WorkerThread } from './workerthread';
import { WorkerTask } from './workertask';

export class ThreadPool {
    private taskQueue = [];
    private workerQueue = [];
    private poolSize: number;

    constructor(size: number) {
        this.poolSize = size;
        for (let i = 0 ; i < this.poolSize ; i++) {
            this.workerQueue.push(new WorkerThread(this));
        }
        // while (this.workerQueue.length > 0) { this.workerQueue.shift(); }
        // while (this.taskQueue.length > 0) { this.taskQueue.shift(); }
    }

    public addWorkerTask(workerTask: WorkerTask) {
        if (this.workerQueue.length > 0) {
            // get the worker from the front of the queue
            const workerThread = this.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers,
            this.taskQueue.push(workerTask);
        }
    }

    public freeWorkerThread = function(workerThread) {
        if (this.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            const workerTask = this.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            this.taskQueue.push(workerThread);
        }
    }
}
