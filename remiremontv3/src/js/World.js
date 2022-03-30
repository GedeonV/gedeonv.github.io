import * as THREE from 'three'

import Stats from 'stats.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js';

import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js';

import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import rem from '../../static/models/rem.glb'

import vue1 from '../../static/360/vue_1.jpg'
import vue2 from '../../static/360/vue_2.jpg'
import vue3 from '../../static/360/vue_3.jpg'
import vue4 from '../../static/360/vue_4.jpg'

import { Color, Object3D, Vector3 } from 'three'
import gsap from 'gsap'

import { Scene360 } from './Scene360';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

console.log('VERSION: ', THREE.REVISION );

const divLoader = document.querySelector('div#loader');
THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onLoad = function ( ) {
    console.log( 'Loading Complete!');
    divLoader.classList.add('loaded')
};

THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};

export class World {r
    constructor(canvas){
        var scene, camera, controls, composer, transition, renderer, gui
        var mainScene, lezardsScene, CBScene, TsubakiScene, DragonScene

        var activeCamera = 0
        var currentView

        const backButton = document.querySelector('#backMainScene');
        backButton.addEventListener('click', (e) => {
            scene = mainScene
            controls.autoRotate = true

            gsap.to(camera, {
                duration: 1,
                zoom: 1,
                onUpdate: function(){
                    camera.updateProjectionMatrix();
                },
            })
            composer.passes[1].uniforms.mixRatio.value = 0.30;
            e.currentTarget.classList.remove('visible');
        })

        /**
         * Scenes
         */
    
        // Config Main Scene
        mainScene = new THREE.Scene()
        mainScene.background = new Color('#FFFFFF')
        mainScene.fog = new THREE.Fog(0xFFFFFF, 1, 100)

        var white = new THREE.Color("rgb(255,255,255)")
        
        // Default Scene
        scene = mainScene
        
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );
    
        const size = 100;
        const divisions = 100;
    
        /**
         * Sizes
         */
    
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
    

        this.onWindowResize = function(){
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight
    
            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
    
            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }
    
        /**
         * Camera
         */
    
        // Base camera
        camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(2, 2, 2)
        camera.rotation.order = 'YXZ';
        scene.add(camera)
    
        const helper = new THREE.CameraHelper(camera);
        scene.add(helper);
        /**
         * Controls
         */
        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.enablePan = false
    
        /**
         * Models 
         */
    
        const gltfLoader = new GLTFLoader()
        const dracoLoader = new DRACOLoader()
    
        dracoLoader.setDecoderPath('/draco/')
        gltfLoader.setDRACOLoader(dracoLoader)
    
        let pins = []
        var target = new THREE.Vector3();
    
        gltfLoader.load(rem,
            (gltf) => {
                const children = [...gltf.scene.children]
                for(const child of children)
                {
                    child.scale.set(0.025, 0.025, 0.025)
                    if(child.name.includes('Pin')){
                        pins.push(child)
                    }
                    mainScene.add(child)
                    mainScene.updateMatrixWorld(true);
                }
                console.log(pins)
                if(pins.length > 0){
                    currentView = pins[0]
                    pins[0].geometry.computeBoundingBox()
                    var boundingBox = pins[0].geometry.boundingBox;
    
                    target.subVectors(boundingBox.max, boundingBox.min)
                    target.multiplyScalar(0.5)
                    target.add(boundingBox.min)
                    target.applyMatrix4(pins[0].matrixWorld)
    
                    console.log(target)
                    camera.position.set(target.x - 2, 5, target.z - 2)
                    controls.target.set(target.x, 1, target.z)
                    controls.maxPolarAngle = (Math.PI / 4)
                    controls.minPolarAngle = (Math.PI / 4)
    
                    controls.minDistance = 2
                    controls.maxDistance = 2
    
                    controls.autoRotate = true;
                    controls.autoRotateSpeed = 2.5
                }
            },
            (xhr) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            (error) => {
                console.log( 'An error happened' );
            }
        )
    
        /**
         * Raycaster
         */
    
        const raycaster = new THREE.Raycaster()
    
        /**
         * Mouse
         */
    
        const mouse = new THREE.Vector2()
    
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX / sizes.width * 2 - 1
            mouse.y = - (event.clientY / sizes.height) * 2 + 1
        })
    
        /**
         * Lights
         */
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        mainScene.add(ambientLight)
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.castShadow = true
        //directionalLight.shadowCameraVisible = true

        // directionalLight.shadow.mapSize.set(1024, 1024)
        // directionalLight.shadow.camera.far = 15
        // directionalLight.shadow.camera.left = - 7
        // directionalLight.shadow.camera.top = 7
        // directionalLight.shadow.camera.right = 7
        // directionalLight.shadow.camera.bottom = - 7
        directionalLight.position.set(0, 5, 0)
        mainScene.add(directionalLight)
    
    
        /**
         * Keybinds
         */
    
        var index = 0

        this.previousPin = () => {
            index--
            if(index < 0){
                index = pins.length - 1
            }
            console.log(index)
    
            console.log(pins[index])
            console.log(pins[index].userData.name)
    
            currentView = pins[index]
    
            pins[index].geometry.computeBoundingBox()
            let boundingBox = pins[index].geometry.boundingBox;
    
            target.subVectors(boundingBox.max, boundingBox.min)
            target.multiplyScalar(0.5)
            target.add(boundingBox.min)
            target.applyMatrix4(pins[index].matrixWorld)
    
            gsap.to( controls.target, {
                duration: 1,
                x: target.x,
                y: 1,
                z: target.z,
                onUpdate: function () {
                    controls.update(); 
                },
            });
        }

        this.nextPin = function(){
            index++
            if(index > pins.length - 1){
                index = 0
            }
    
            currentView = pins[index]
    
            pins[index].geometry.computeBoundingBox()
            let boundingBox = pins[index].geometry.boundingBox;
    
            target.subVectors(boundingBox.max, boundingBox.min)
            target.multiplyScalar(0.5)
            target.add(boundingBox.min)
            target.applyMatrix4(pins[index].matrixWorld)
    
            gsap.to( controls.target, {
                duration: 1,
                x: target.x,
                y: 1,
                z: target.z,
                onUpdate: function () {
                    controls.update();
                },
            });
        }
        
        this.resetScene = function(e){
            if(e.code === "KeyR"){
                gsap.to(camera, {
                    duration: 1,
                    zoom: 1,
                    onUpdate: function(){
                        camera.updateProjectionMatrix();
                    },
                })
                composer.passes[1].uniforms.mixRatio.value = 0;
            }
        }
        
        this.changeScene = function(e){
            if(e.code === "Digit1"){
                activeCamera = 0
                controls.enabled = true
                lezardsScene.disableScene()
                TsubakiScene.disableScene()
                CBScene.disableScene()
            } else if(e.code === "Digit2"){
                // CB Scene
                activeCamera = 1                
                CBScene.enableScene()
                lezardsScene.disableScene()
                TsubakiScene.disableScene()
            } else if(e.code === "Digit3"){
                // Lezards Scene
                activeCamera = 2
                controls.enabled = false
                lezardsScene.enableScene()
                CBScene.disableScene()
                TsubakiScene.disableScene()
            } else if(e.code === "Digit4"){
                // Tsubaki Scene
                activeCamera = 3
                controls.enabled = false
                TsubakiScene.enableScene()
                CBScene.disableScene()
                lezardsScene.disableScene()
            }
        }
    
        this.onClick = function(e){
            if(currentIntersect){
                let testView = currentIntersect.object
                let current = currentIntersect.object.userData.name
    
                if(testView === currentView){
                    gsap.to(camera, {
                        duration: 1,
                        zoom: 3,
                        onStart: function(){
                            composer.passes[1].uniforms.mixRatio.value = 0.70;
                        },
                        onUpdate: function(){
                            camera.updateProjectionMatrix();
                        },
                        onComplete: function(){
                            if(current === "Pin - Lezardscreation"){
                                activeCamera = 2
                                controls.autoRotate = false
                                backButton.classList.add('visible')
                            }
                        }
                    })
                }
            }
        }
    
        /**
         * Renderer
         */
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias : true, 
            logarithmicDepthBuffer: true
        })
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
        /**
         * Post processing
         */
            
        composer = new EffectComposer( renderer );
        
        // render pass
        
        var renderPass = new RenderPass( scene, camera )
                
        // save pass
        
        var renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            stencilBuffer: false
        };
        
        var savePass = new SavePass( new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters ) );
    
        // blend pass
    
        var blendPass = new ShaderPass( BlendShader, 'tDiffuse1' );
        blendPass.uniforms[ 'tDiffuse2' ].value = savePass.renderTarget.texture;
        blendPass.uniforms[ 'mixRatio' ].value = 0.30;
        
        // output pass
        
        var outputPass = new ShaderPass( CopyShader );
        outputPass.renderToScreen = true;
        
        // setup pass chain
        
        composer.addPass( renderPass );
        composer.addPass( blendPass );
        composer.addPass( savePass );
        composer.addPass( outputPass );


        /**
         * Scene 360
         */
    
        lezardsScene = new Scene360(vue1, renderer, canvas)
        lezardsScene.createHotspot([
            {
                HotspotName: "Radio",
                position: new THREE.Vector3(-50,10,5),
            },
            {
                HotspotName: "Amphi",
                position: new THREE.Vector3(10,10,-50),
            },
            {
                HotspotName: "Eul Camion",
                position: new THREE.Vector3(10,10,50)
            },
        ]            
        )

        CBScene = new Scene360(vue2, renderer, canvas)
        TsubakiScene = new Scene360(vue3, renderer, canvas)
        DragonScene = new Scene360(vue4, renderer, canvas)
    
        /**
         * Animate
         */
    
        let currentIntersect = null
    
        const clock = new THREE.Clock()
        let previousTime = 0

        this.update = function() {
            stats.begin()
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - previousTime
            previousTime = elapsedTime
    
            raycaster.setFromCamera(mouse, camera)
            if(pins){
                const objectsToTest = [pins]
    
                for(const o of objectsToTest){
                    const intersects = raycaster.intersectObjects(o)
                    if(intersects.length){
                        if(!currentIntersect){
                            //console.log('mouse enter')
                        }
                        currentIntersect = intersects[0]
                    } else {
                        if(currentIntersect){
                            //console.log('mouse leave')
                        }
                        currentIntersect = null
                    }
                }
            }

            // Update controls
            controls.update()
    
            // Render
            if(activeCamera === 0){
                composer.render(scene, camera)
            } else if(activeCamera === 1){
                CBScene.render()
            } else if(activeCamera === 2){
                lezardsScene.render(elapsedTime)
            } else if(activeCamera === 3){
                TsubakiScene.render()
            }

            stats.end()
        }
    }
}