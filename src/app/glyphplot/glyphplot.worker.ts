const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const data = ev.data;
    ctx.postMessage(data);
    self.close();
};
