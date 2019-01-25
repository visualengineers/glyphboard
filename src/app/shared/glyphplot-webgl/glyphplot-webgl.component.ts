import { Component, OnInit, ElementRef, ViewChild, HostListener, OnChanges } from '@angular/core';
import { RegionManager } from 'app/home/region.manager';
import { Input } from '@angular/core';

import {Configuration } from 'app/shared/glyphplot/configuration.service';
import {ConfigurationData} from 'app/shared/glyphplot/configuration.data';
import {EventAggregatorService} from '../events/event-aggregator.service';
import { Logger } from 'app/logger.service';

import * as THREE from 'three';
import { ShadowMaterial, Color, BufferGeometry } from 'three';
import { RefreshPlotEvent } from '../events/refresh-plot.event';


@Component({
  selector: 'app-glyphplot-webgl',
  templateUrl: './glyphplot-webgl.component.html',
  styleUrls: ['./glyphplot-webgl.component.scss']
})

export class GlyphplotWebglComponent implements OnInit, OnChanges {
  @Input() width: number;
  @Input() height: number;

  
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private cameraTarget: THREE.Vector3;
  public scene: THREE.Scene;

  private zoomFactor : number = 1;
  
  public fieldOfView: number = 60;
  public nearClippingPane: number = 1;
  public farClippingPane: number = 1100;

  private cube: THREE.Mesh[] = [];
  private group: THREE.Group;

  private _configuration: ConfigurationData;
  private _data: any;
  private _particleSystem : THREE.Points;

  private _data_MinX : number;
  private _data_MaxX : number;
  private _data_MinY : number;
  private _data_MaxY : number;

  private _shaderMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: "attribute float size; varying vec3 vColor; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }",
    fragmentShader: "varying vec3 vColor; void main() { gl_FragColor = vec4( vColor, 1.0 ); }",

    blending: THREE.NoBlending,
    depthTest: false,
    transparent: false,
    vertexColors: THREE.VertexColors
  } );

  private _shaderDiskMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: "attribute float size; varying vec3 vColor; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }",
    // fragmentShader: "varying  vec3 vColor; void main() { float r = 0.0, delta = 0.0, alpha = 1.0; vec2 cxy = 2.0 * gl_PointCoord - 1.0; r = dot(cxy, cxy); if (r > 1.0) { discard; } gl_FragColor = vec4(vColor, alpha); }",
    fragmentShader: "varying  vec3 vColor; void main(){float r = 0.0, delta = 0.0, alpha = 1.0; vec2 cxy = 2.0 * gl_PointCoord - 1.0; r = dot(cxy, cxy); delta = fwidth(r); alpha = 1.0 - smoothstep(0.5 - delta, 0.5 + delta, r); gl_FragColor = vec4(vColor, alpha);}",    
    blending: THREE.NormalBlending,   
    depthTest: false,    
    transparent: true,    
    vertexColors: THREE.VertexColors
  } );

  private _particleGeometry : THREE.BufferGeometry = new THREE.BufferGeometry();    

  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  
  @ViewChild('threejscanvas')
  private canvasRef: ElementRef
  
  public manager;

  constructor(
    private logger: Logger,
    public regionManager: RegionManager, 
    private configurationService: Configuration,
    private eventAggregator: EventAggregatorService
  ) { 
    this.configurationService.configurations[0].getData().subscribe(message => 
      {
      if (message != null)
      {
        this.data = message;
        this.buildParticles();
      }     
    }); 
    
    this._configuration = this.configurationService.configurations[0];
    this.eventAggregator.getEvent(RefreshPlotEvent).subscribe(this.onRefreshPlot);

    this.render = this.render.bind(this);   

  }

  ngOnInit() : void {
    this.manager = this.regionManager;        
  }

  ngOnChanges() : void {
    this.setViewFrustum();
  }

  ngAfterViewInit() {
    this.createScene();
    this.createLight();
    this.createCamera();
    this.startRendering();

    this.setViewFrustum();
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(200));     
  }

  private createLight() {
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 100);
    this.scene.add(light);
  }
  
  private createCamera() {

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / -2, this.height / 2);    

    // Set position and look at
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = -100;
  }

  private getAspectRatio(): number {

      let height = this.height;
      if (height === 0) {
          return 0;
      }

      return this.width / this.height;
  }

  private getScale(): number {
    return 1.0/ (this.width / (this.camera.bottom - this.camera.top));
  }

  private startRendering() {

    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.width, this.height);    
    this.renderer.shadowMap.enabled = false;    
    this.renderer.setClearColor(0xFFFFFF, 1);
    this.renderer.autoClear = true;

    this.buildParticles();

    let component: GlyphplotWebglComponent = this;

    (function render() {
        component.render();
    }());
  }

  public render() {

    let self: GlyphplotWebglComponent = this;    

    (function render(){
      requestAnimationFrame(render);     

			self.renderer.render( self.scene, self.camera );

    }());    

    this.renderer.render(this.scene, this.camera);
    this.scene.background = new THREE.Color( 0xFFFFFF );
  }


   //#region HostListeners
   @HostListener('mousemove', ['$event'])
   mouseMove(e: MouseEvent) {

    if (e.buttons == 1)
    {
      var position = this.camera.position;

      this.camera.position.set(position.x+(-e.movementX * this.getScale()), position.y + (-e.movementY * this.getScale()), position.z);
    }
   }

   @HostListener('document:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
      if (e.key == " ")
      {
        console.log("resetView...");
        this.resetView();
      }
    }

   private resetView() : void
   {   
    this.camera.position.set(0, 0, 100);
    this.zoomFactor = 1;    
   }
   
   @HostListener('mousewheel', ['$event'])
   mousewheel(e: WheelEvent) {
    let wheelDelta = e.wheelDelta / 120;;

    this.zoomFactor += wheelDelta * 0.1;
    if (this.zoomFactor < 0.1)
      this.zoomFactor = 0.1;

    this.setViewFrustum();
   }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.setViewFrustum();
  }

  private setViewFrustum() : void {
    if (this.camera == null)
      return;

    const aspect = this.getAspectRatio();    

    this.camera.left = this._data_MinX / this.zoomFactor;
    this.camera.right = this._data_MaxX / this.zoomFactor;
    this.camera.top = (this._data_MinY / this.zoomFactor) / aspect;
    this.camera.bottom = (this._data_MaxY / this.zoomFactor) / aspect;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    
    console.log("Set renderer size: " + this.width + " x " + this.height);
    
    this.render();      
  }

  private buildParticles()
  {
    this._shaderDiskMaterial.extensions.derivatives = true;

    this.setViewFrustum();

    if (this._particleSystem)
    {
       this.scene.remove(this._particleSystem);
       this._particleSystem = null;
    }

    const particlePositions = [];
		const particleColors = [];
    const particleSizes = [];

    if (this.data != null)
    {   
      this._data_MinX = 0;
      this._data_MaxX = 0;

      this._data_MinY = 0;
      this._data_MaxY = 0;

      const colorFeature = this.data.schema.color;
      const colorScale = item => {
        return item === undefined
          ? 0
          : this._configuration.color(+item[colorFeature]);
      };

      this.data.positions.forEach(item => {     
        var pX = item.position.x;
        var pY = item.position.y;
        var pZ = -10;

        particlePositions.push(pX); 
        particlePositions.push(pY); 
        particlePositions.push(pZ);
        
        const isPassive = !((this._configuration.filteredItemsIds.indexOf(item.id) > -1) || (this._configuration.featureFilters.length == 0));
        const feature = this.getFeaturesForItem(item, this._configuration).features;
        const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
        particleColors.push( color.r, color.g, color.b);

        particleSizes.push(10);
        
        if (pX < this._data_MinX)
          this._data_MinX = pX;

        if (pY < this._data_MinY)
          this._data_MinY = pY;

        if (pX > this._data_MaxX )
          this._data_MaxX  = pX;

        if (pY > this._data_MaxY)
          this._data_MaxY = pY;      
      });

      this.setViewFrustum();

      this.resetView(); 

    console.log(particlePositions.length);

    this._particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
    this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
    this._particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );

    this._particleSystem = new THREE.Points(
      this._particleGeometry,
      this._shaderDiskMaterial);
    
    // add it to the scene
    this.scene.add(this._particleSystem);
    }  
  }  

  private buildParticles2()
  {
    this._shaderDiskMaterial.extensions.derivatives = true;
    this.setViewFrustum();

    if (this._particleSystem)
    {
       this.scene.remove(this._particleSystem);
       this._particleSystem = null;
    }

    const particlePositions = [];
		const particleColors = [];
    const particleSizes = [];
    
    var color = new THREE.Color();

    if (this.data != null)
    {   
      this._data_MinX = 0;
      this._data_MaxX = 0;

      this._data_MinY = 0;
      this._data_MaxY = 0;

      let count = this._data.positions.length;
      // let j = 0;

      var particles = 1000000;
      var n = 1000, n2 = n / 100;

      for ( var i = 0; i < particles; i ++ ) {
      // this.data.positions.forEach(position => {
        i++;
        
        var pX = Math.random() * n - n2;
        var pY = Math.random() * n - n2;
        var pZ = -10;

        particlePositions.push(pX); 
        particlePositions.push(pY); 
        particlePositions.push(pZ);
        
        var vx = ( pX / n ) + 0.5;
        var vy = ( pY / n ) + 0.5;
        var vz = ( pZ / n ) + 0.5;
        color.setRGB( vx, vy, vz );

        // color.setHSL( i / count, 1.0, 0.5 );
        particleColors.push( color.r, color.g, color.b);

        particleSizes.push(2);
        
        if (pX < this._data_MinX)
          this._data_MinX = pX;

        if (pY < this._data_MinY)
          this._data_MinY = pY;

        if (pX > this._data_MaxX )
          this._data_MaxX  = pX;

        if (pY > this._data_MaxY)
          this._data_MaxY = pY;      
      }

      this.setViewFrustum();

      this.resetView(); 
    

    console.log(particlePositions.length);

    this._particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
    this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
    this._particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );

    this._particleGeometry.computeBoundingSphere();

    this._particleSystem = new THREE.Points(
      this._particleGeometry,
      this._shaderDiskMaterial);
    
    // add it to the scene
    this.scene.add(this._particleSystem);
    }  
  }

  private onRefreshPlot = (payload: boolean) => {
    if(this.data == null){
      return;
    }
    this._configuration = this.configurationService.configurations[0];
    this.updateParticles();
  }

  private getFeaturesForItem(d: any, config: ConfigurationData) {
    const item = this.data.features.find(f => {
      return f.id === d.id;
    });
    let itemContext = config.individualFeatureContexts[d.id];
    if (itemContext === undefined) {
      if (config.globalFeatureContext >= 0) {
        itemContext = config.globalFeatureContext;
      } else {
        itemContext = item['default-context'];
      }
    }
    const ret = {
      features: Object.assign(item.features[itemContext], item.features['global']),
      values: item.values
    }
    return ret;
  }

  private updateParticles(){
    const colorFeature = this.data.schema.color;
    const colorScale = item => {
      return item === undefined
        ? 0
        : this._configuration.color(+item[colorFeature]);
    };

		const particleColors = [];

    this.data.positions.forEach(e => {
          const isPassive = !((this._configuration.filteredItemsIds.indexOf(e.id) > -1) || (this._configuration.featureFilters.length == 0));
          const feature = this.getFeaturesForItem(e, this._configuration).features;
          const color = isPassive ? new THREE.Color('#ccc') : new THREE.Color(colorScale(feature));
          particleColors.push( color.r, color.g, color.b);
    });
    this._particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
  }
}