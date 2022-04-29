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
stats.showPanel(0)
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

export class World {
    constructor(canvas){
        var scene, scenes, camera, controls, composer, transition, renderer, gui
        var mainScene, LezardsScene, CBScene, TsubakiScene, DragonScene, Rest, current360

        var activeCamera = 0
        var currentView

        const backButton = document.querySelector('#backMainScene');
        backButton.addEventListener('click', (e) => {
            activeCamera = 0
            controls.autoRotate = true
            controls.enabled = true
            scenes.forEach(c => {
                c.disableScene()
            })
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
        mainScene = new THREE.Scene()
        mainScene.background = new Color('#FFFFFF')
        mainScene.fog = new THREE.Fog(0xFFFFFF, 1, 100)
        
        scene = mainScene
        
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );
    
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

                scenes.forEach(c => {
                    c.disableScene()
                })
            } else if(e.code === "Digit2"){
                // CB Scene
                activeCamera = 1     
                controls.enabled = false
                scenes.forEach(c => {
                    c.disableScene()
                })           
                current360 = CBScene
                CBScene.enableScene()
            } else if(e.code === "Digit3"){
                // Lezards Scene
                activeCamera = 2
                controls.enabled = false
                scenes.forEach(c => {
                    c.disableScene()
                })
                current360 = LezardsScene
                LezardsScene.enableScene()
            } else if(e.code === "Digit4"){
                // Tsubaki Scene
                activeCamera = 3
                controls.enabled = false
                scenes.forEach(c => {
                    c.disableScene()
                })
                current360 = TsubakiScene
                TsubakiScene.enableScene()
            } else if(e.code === "Digit5"){
                activeCamera = 4
                controls.enabled = false
                scenes.forEach(c => {
                    c.disableScene()
                })
                current360 = DragonScene
                DragonScene.enableScene()
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
                                controls.enabled = false
                                controls.autoRotate = false

                                scenes.forEach(c => {
                                    c.disableScene()
                                })
                                current360 = LezardsScene
                                LezardsScene.enableScene()                               
                                backButton.classList.add('visible')
                            } else if(current === "Pin - Cote et braise") {
                                activeCamera = 1
                                controls.enabled = false
                                controls.autoRotate = false

                                scenes.forEach(c => {
                                    c.disableScene()
                                })
                                current360 = CBScene
                                CBScene.enableScene()                               
                                backButton.classList.add('visible')
                            } else if(current === "Pin - Tsubaki"){
                                activeCamera = 3
                                controls.enabled = false
                                controls.autoRotate = false

                                scenes.forEach(c => {
                                    c.disableScene()
                                })
                                current360 = TsubakiScene
                                TsubakiScene.enableScene()                               
                                backButton.classList.add('visible')
                            } else if(current === "Pin - Dragon or"){
                                activeCamera = 4
                                controls.enabled = false
                                controls.autoRotate = false

                                scenes.forEach(c => {
                                    c.disableScene()
                                })
                                current360 = DragonScene
                                DragonScene.enableScene()                               
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
        scenes = [
            LezardsScene = new Scene360("Lezardscreation", vue1, renderer, canvas),
            CBScene = new Scene360("Côtes et Braises",vue2, renderer, canvas),
            TsubakiScene = new Scene360("Tsubaki", vue3, renderer, canvas),
            DragonScene = new Scene360("Dragon d'or", vue4, renderer, canvas),
            Rest = new Scene360("Restaurant", vue4, renderer, canvas)
        ]

        Rest.createHotspot([
            { HotspotName: "Réfectoire", position: new THREE.Vector3(100,10,-10), link: LezardsScene},
        ])
        .createInfo([
            {InfoName: 'Cantine', position: new THREE.Vector3(23.5, 0, -31), element: '.popup__info-autre'},
        ])
        
        LezardsScene
        .createHotspot([
            { HotspotName: "Amphi", position: new THREE.Vector3(-50,10,5), link: CBScene},
            { HotspotName: "Restaurant", position: new THREE.Vector3(10,10,-50), link: Rest},
            { HotspotName: "Toilettes", position: new THREE.Vector3(10,10,50)}
        ])
        .createInfo([
            {InfoName: 'Lampe', position: new THREE.Vector3(23.5, 0, -31), element: '.popup__info-lampe'},
            {InfoName: 'Table', position: new THREE.Vector3(68.5, -10, 0.15), element: '.popup__info-table'},
        ])

        CBScene.createHotspot([
            { HotspotName: "Toilettes", position: new THREE.Vector3(-50,10,11), link: LezardsScene},
        ])

        TsubakiScene.createHotspot([
            { HotspotName: "Toilettes", position: new THREE.Vector3(100,-10,50)},
            { HotspotName: "Dortoir", position: new THREE.Vector3(14,30,100)}
        ])
    
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
            } else {
                current360.show()
                if(current360.child){
                    current360.disableScene()
                    current360 = current360.child
                    current360.enableScene()
                }
            }
            stats.end()
        }
    }
}