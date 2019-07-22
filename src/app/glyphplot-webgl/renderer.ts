

import * as THREE from 'three';

export interface IRenderable  {
    // scene       : THREE.Scene;
    // camera      : THREE.OrthographicCamera;
    update()    : void;
    onResize(viewWidth: number, viewHeight: number)  : void;   
    getScene()  : THREE.Scene;
    getCamera() : THREE.OrthographicCamera;
}

export class Renderer {

    private canvas      : HTMLCanvasElement;
    private renderer    : THREE.WebGLRenderer;
    private activeView  : IRenderable;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement;

        this.init();
    }

    init(): void {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
    
        this.renderer.setPixelRatio(devicePixelRatio);

        this.renderer.shadowMap.enabled = false;
        this.renderer.setClearColor(0xEEEEEE, 1);
        this.renderer.autoClear = true;
    }

    draw(doDrawing = true): void {
        if(!doDrawing || !this.activeView) {
            return;
        }

        requestAnimationFrame(() => {
            this.draw();
        });

        this.activeView.update();
        this.render();
    }
    
    render(): void {
        // this.renderer.clear();
        this.renderer.render( this.activeView.getScene(), this.activeView.getCamera() );
    }

    onResize(viewWidth: number, viewHeight: number): void {
        this.renderer.setSize(viewWidth, viewHeight);
        if(this.activeView) {
            this.activeView.onResize(viewWidth, viewHeight);
        }
    }

    setView(view: IRenderable): void {
        this.activeView = view;
    }
}