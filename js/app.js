import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
import particle_texture from "../img/particle.jpg";

function lerp(a, b, t){
  return a * (1-t) + b * t;
}

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.count = 0;
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.point = new THREE.Vector3();

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );


    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 3, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.raycasterEvent();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  raycasterEvent(){

    let mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10, 10, 10, 10).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}),
    );

    let test = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.3, 10, 10),
      new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}),
    );


    // this.scene.add(test);

    window.addEventListener( 'pointermove', (event)=>{
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera( this.pointer, this.camera );

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects([mesh]);
      if(intersects[0]){
        console.log(intersects[0].point);
        test.position.copy(intersects[0].point);
        this.point.copy(intersects[0].point);
      }
    });
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0.6,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 6, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    this.camera.updateProjectionMatrix();


  }

  addObjects() {
    let that = this;

    let plarticleGeo = new THREE.PlaneBufferGeometry(1, 1);
    let geo = new THREE.InstancedBufferGeometry();
    let particle_count = 10000;
    let min_radius = 0.5;
    let max_radius = 2;
    geo.setAttribute('each_instance_position', plarticleGeo.getAttribute('position'));
    geo.index = plarticleGeo.index;

    let instance_position = new Float32Array(particle_count * 3);

    for (let i = 0; i < particle_count; i++) {
      const i3 = i * 3;
      let theta = Math.random() * 2 * Math.PI;
      let r = lerp(min_radius, max_radius, Math.random());
      const x = r * Math.sin(theta);
      const y = (Math.random() - 0.5) * 0.5;
      const z = r * Math.cos(theta);
      instance_position.set([x, y, z], i3);

      
      // // 2 way to assign each data
      // pos[i3 + 0] = (Math.random() - 0.5) * 0.5;
      // pos[i3 + 1] = (Math.random() - 0.5) * 0.5;
      // pos[i3 + 2] = (Math.random() - 0.5) * 0.5;
      
    }
    geo.setAttribute('instance_position', new THREE.InstancedBufferAttribute(instance_position, 3, false));

    console.log(geo);

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        u_mouse: { value: new THREE.Vector3() },
        u_particle_texture: { value: new THREE.TextureLoader().load(particle_texture) },
        progress: { value: 0.6 },
        resolution: { value: new THREE.Vector4() },
      },
      transparent:true,
      // wireframe: true,
      vertexShader: vertex,
      depthTest : false,
      fragmentShader: fragment
    });

    

    
    this.geometry = new THREE.PlaneGeometry(2, 2, 100, 100);

    this.mesh = new THREE.Mesh(geo,this.material)
    this.scene.add(this.mesh)

  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.u_mouse.value = this.point;
    this.material.uniforms.progress.value = this.settings.progress;



    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);

  }
}

new Sketch({
  dom: document.getElementById("container")
});
