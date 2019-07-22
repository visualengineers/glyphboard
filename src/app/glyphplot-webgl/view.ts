

import * as THREE from 'three';
import { CameraSyncUtilities } from 'app/shared/util/cameraSyncUtilities';
import { ViewportTransformationEventData } from 'app/shared/events/viewport-transformation.event.data';
import { IRenderable } from './renderer';
import { ConfigurationData } from 'app/shared/services/configuration.data';
import { SelectionService } from 'app/shared/services/selection.service';

export class View implements IRenderable {
    protected scene         : THREE.Scene;
    protected camera        : THREE.OrthographicCamera;

    protected viewWidth     : number;
    protected viewHeight    : number;

    protected data          : any;
    protected configuration : ConfigurationData;
    protected selectionService: SelectionService;
    protected cameraUtil    : CameraSyncUtilities;

    constructor(viewWidth: number, viewHeight: number) {
        this.viewWidth  = viewWidth;
        this.viewHeight = viewHeight;

        this.createCamera(viewWidth, viewHeight);
    }

    update(): void {
        
    }
    onResize(viewWidth: number, viewHeight: number): void {
        this.viewWidth  = viewWidth;
        this.viewHeight = viewHeight;
        // is actually handled with setViewFrustum (in terms of the camera)
    }
    getScene(): THREE.Scene {
        return this.scene;
    }
    getCamera(): THREE.OrthographicCamera {
        return this.camera;
    }

    setViewFrustum(left: number, top: number, right: number, bottom: number) {
        this.camera.left    = left;
        this.camera.right   = right;
        this.camera.top     = top;
        this.camera.bottom  = bottom;
        this.camera.updateProjectionMatrix();
    }

    onData(data: any) {
        this.data = data;
        this.updateCameraUtil();
        this.onDataChange();
    }
    protected onDataChange(): void {}

    onConfiguration(configuration: ConfigurationData) {
        this.configuration = configuration;
        this.onConfigurationChange();
    }
    protected onConfigurationChange() {}

    onSelection(selectionService: SelectionService) {
        this.selectionService = selectionService;
        this.onSelectionChange();
    }
    protected onSelectionChange(): void {}

    protected createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xEEEEEE );

        this.createLight();
    }
    
    protected createLight() {
        const light = new THREE.PointLight(0xFFFFFF, 1, 1000);
        light.position.set(0, 0, 100);
        this.scene.add(light);
    }
    
    protected createCamera(viewWidth: number, viewHeight: number) {
    
        const aspectRatio = this.getAspectRatio(viewWidth, viewHeight);
        this.camera = new THREE.OrthographicCamera(viewWidth / -2, viewWidth / 2, viewHeight / -2, viewHeight / 2);
    
        // Set position and look at
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 100;
    
        this.camera.lookAt(0, 0, 0);
    }

    private getAspectRatio(width: number, height: number): number {
        if (height === 0) {
            return 0;
        }
        return width / height;
    }

    protected updateCameraUtil(): void {
        if (this.data === null) {
            return; 
        }
        let dataMinX, dataMinY, dataMaxX, dataMaxY = 0;

            dataMinX = this.data.positions[0].position.ox;
            dataMaxX = this.data.positions[0].position.ox;
        
            dataMinY = this.data.positions[0].position.oy;
            dataMaxY = this.data.positions[0].position.oy;

        // step 1: find min, max values
        this.data.positions.forEach(item => {
            const pX = item.position.ox;
            const pY = item.position.oy;
    
            if (pX < dataMinX) {
            dataMinX = pX;
            }
    
            if (pY < dataMinY) {
            dataMinY = pY;
            }
    
            if (pX > dataMaxX ) {
            dataMaxX  = pX;
            }
    
            if (pY > dataMaxY) {
            dataMaxY = pY;
            }
        });
    
        // add 5% border
        const borderX = (dataMaxX - dataMinX) / 20;
        const borderY = (dataMaxY - dataMinY) / 20;
    
        // adjust drawing range
        dataMinX -= borderX;
        dataMaxX += borderX;
    
        dataMinY -= borderY;
        dataMaxY += borderY;

        // step 2: compute scale to fit into screen space (simlar to glyphplot.layout.controller.updatePositions())
        const dataDomainX = (dataMaxX) - (dataMinX);
        const dataDomainY = (dataMaxY) - (dataMinY);
    
        const dataScaleX = this.viewWidth / dataDomainX;
        const dataScaleY = this.viewHeight / dataDomainY;
        
        this.cameraUtil = new CameraSyncUtilities(
            new THREE.Vector2(dataMinX, dataMinY),
            new THREE.Vector2(dataMaxX, dataMaxY),
            new THREE.Vector2(dataScaleX, dataScaleY)
        );
    }

    getCameraUtil(): CameraSyncUtilities { return this.cameraUtil; }
}