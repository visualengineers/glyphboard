import { Component, OnInit, ElementRef, ViewChild, HostListener, OnChanges } from '@angular/core';
import { RegionManager } from 'app/home/region.manager';
import { Input } from '@angular/core';
import { Configuration } from 'app/shared/glyphplot/configuration.service';
import { Logger } from 'app/logger.service';
import * as THREE from 'three';
import { ShadowMaterial, Color, BufferGeometry } from 'three';

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

  private _data: any;
  private _particleSystem : THREE.Points;

  private _data_MinX : number;
  private _data_MaxX : number;
  private _data_MinY : number;
  private _data_MaxY : number;

  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  
  @ViewChild('threejscanvas')
  private canvasRef: ElementRef
  
  public manager;

  constructor(private logger: Logger, public regionManager: RegionManager, private configurationService: Configuration) { 
    this.configurationService.configurations[0].getData().subscribe(message => {
      if (message != null)
      {
        this.data = message;
        this.buildParticles();
      }     
      
    });    
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
    this.camera.position.z = 100;
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
    this.setViewFrustum();

    if (this._particleSystem)
    {
       this.scene.remove(this._particleSystem);
       this._particleSystem = null;
    }

    const shaderMaterial = new THREE.ShaderMaterial( {
      vertexShader: "attribute float size; varying vec3 vColor; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size; gl_Position = projectionMatrix * mvPosition; }",
      fragmentShader: "varying vec3 vColor; void main() { gl_FragColor = vec4( vColor, 1.0 ); }",

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: false,
      vertexColors: THREE.VertexColors
    } );
    
    const particlePositions = [];
		const particleColors = [];
    const particleSizes = [];
    
    var color = new THREE.Color();

    const particleGeometry = new THREE.BufferGeometry();    

    if (this.data != null)
    {   
      this._data_MinX = 0;
      this._data_MaxX = 0;

      this._data_MinY = 0;
      this._data_MaxY = 0;

      let count = this._data.positions.count;
      let i = 0;

      this.data.positions.forEach(position => {

        i++;

        const pX = position.position.x;
        const pY = position.position.y;
        const pZ = -100;

        particlePositions.push(pX); 
        particlePositions.push(pY); 
        particlePositions.push(pZ);
        
        color.setHSL( i / count, 1.0, 0.5 );
        //  particleColors.push( 1,0,0 );
        particleColors.push( color.r, color.g, color.b );
        
        particleSizes.push(20);
        
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

    particleGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
    particleGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 3 ) );
    particleGeometry.addAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 1 ) );

    this._particleSystem = new THREE.Points(
        particleGeometry,
        shaderMaterial);
    
    // add it to the scene
    this.scene.add(this._particleSystem);
   

    }  
  }  
}