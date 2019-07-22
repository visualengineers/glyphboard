

import * as THREE from 'three';
import { CameraSyncUtilities } from 'app/shared/util/cameraSyncUtilities';
import { ViewportTransformationEventData } from 'app/shared/events/viewport-transformation.event.data';
import { IRenderable } from './renderer';
import { View } from './view';

// import * as vertexShader from '/assets/shader/glyphplot_vertex.vert';

export class DotView extends View {

    private particleSystem: THREE.Points;
    private shaderDiskMaterial: THREE.ShaderMaterial;
    private particleGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();

    
      

    constructor(viewWidth: number, viewHeight: number) {
        super(viewWidth, viewHeight);

        console.log(this.shaderDiskMaterial);
        this.shaderDiskMaterial = new THREE.ShaderMaterial( {
            blending: THREE.NormalBlending,
            depthTest: false,
            transparent: true,
            vertexColors: THREE.VertexColors,
            side: THREE.BackSide
        });

        console.log(this.shaderDiskMaterial);

        const fl = new THREE.FileLoader();
        fl.load('/assets/shader/glyphplot_vertex.vert', vertexShader => {
            this.shaderDiskMaterial.vertexShader = vertexShader as string
        });
        fl.load('/assets/shader/glyphplot_fragment.frag', fragmentShader => {
            this.shaderDiskMaterial.fragmentShader = fragmentShader as string
        });

        this.createScene();
    }

    update(): void {
        
    }

    protected createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xEEEEEE );

        this.createLight();

        this.buildParticles();
    }

    onDataChange(): void {
        this.buildParticles();
    }
    onConfigurationChange(): void {
        this.updateParticles();
    }
    onSelectionChange(): void {
        this.updateParticles();
    }

    private buildParticles() {
        if(!this.configuration || !this.selectionService) {
            return;
        }
        this.shaderDiskMaterial.extensions.derivatives = true;
    
        if (this.particleSystem) {
           this.getScene().remove(this.particleSystem);
           this.particleSystem = null;
        }
    
        
    
        const particlePositions = [];
        const particleColors = [];
        const particleSizes = [];
    
        if (this.data != null) {
            
            const colorFeature = this.data.schema.color;
            const colorScale = item => {
                return item === undefined
                ? 0
                : this.configuration.color(+item[colorFeature]);
            };
        
            // step 3: push window-scaled positions
            this.data.positions.forEach(item => {
                const renderPosX = (item.position.ox * this.cameraUtil.DataScale.x);
                const renderPosY = (((this.cameraUtil.DataMax.y - item.position.oy) + this.cameraUtil.DataMin.y) * this.cameraUtil.DataScale.y);
                const renderPosZ = -10;
        
                particlePositions.push(renderPosX);
                particlePositions.push(renderPosY);
                particlePositions.push(renderPosZ);
    
                let isPassive =
                  !((this.selectionService.filteredItemsIds.indexOf(item.id) > -1) ||
                    (this.selectionService.featureFilters.length === 0));

                let feature;

                if(this.configuration.getFeaturesForItem(item) !== null)
                    feature = this.configuration.getFeaturesForItem(item).features;

                const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
               // const color = new THREE.Color(colorScale(feature));
                particleColors.push( color.r, color.g, color.b);
        
                particleSizes.push(10);
            });
        
            // this.setViewFrustum();
        
            this.particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
            this.particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
            this.particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );
        
            this.particleSystem = new THREE.Points(
                this.particleGeometry,
                this.shaderDiskMaterial);
        
            this.particleSystem.frustumCulled = false;
        
            // add it to the scene
            this.getScene().add(this.particleSystem);
        
            // ### REFACTOR this.render();
            }
        }
        
        private updateParticles() {
            if(!this.data)
                return;
            const colorFeature = this.data.schema.color;
        
            const colorScale = item => {
              return item === undefined
                ? 0
                : this.configuration.color(+item[colorFeature]);
            };
        
            const particleColors = [];
        
            this.data.positions.forEach(item => {
              const isPassive =
                    !((this.selectionService.filteredItemsIds.indexOf(item.id) > -1) ||
                    (this.selectionService.featureFilters.length === 0));
                  const feature = this.configuration.getFeaturesForItem(item).features;
                  const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
                  particleColors.push( color.r, color.g, color.b);
            });
        
            this.particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
            
            // ### REFACTOR this.render();
          }
}