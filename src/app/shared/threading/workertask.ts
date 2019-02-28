export class WorkerTask {
    public script: any;
    public callback: any;
    public startMessage: any;

    constructor(script, callback, msg) {
        this.script = script;
        this.callback = callback;
        this.startMessage = msg;
    }
}
