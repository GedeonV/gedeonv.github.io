import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class Scene {
    constructor(path, renderer, canvas) {
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);

        this.texture = new THREE.TextureLoader().load(path);
        this.texture.mapping = THREE.EquirectangularReflectionMapping;

        //Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = this.texture;

        var white = new THREE.Color("rgb(255,255,255)")
        this.gridHelper = new THREE.GridHelper( 100, 100, white, white);
        this.scene.add(this.gridHelper)

        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enabled = true
        this.controls.enableZoom = false
        this.controls.enableDamping = true
        this.controls.target.set(0,3,0)

    
        this.render = function () {
            renderer.render(this.scene, this.camera);
        };
    }
}