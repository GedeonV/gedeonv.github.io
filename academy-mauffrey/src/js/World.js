import * as THREE from 'three'

import Stats from 'stats.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js';

// import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
// import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js';

import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import models from '../../static/models/academy-mauffrey.glb'


import { Color, Object3D, TextureLoader, Vector3 } from 'three'
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

THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};

export class World {
    constructor(canvas){
        var scene, scenes, camera, controls, composer, transition, renderer, gui, animCamera, action, mixer, clip
        var mainScene, current360

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
        scene = mainScene

        mainScene.background = new Color('0x3F3F3F')
        
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
        camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
        // camera.position.set(2, 2, 2)

        camera.position.set(-107.99894247141552, 75.83479260248458, -127.7151015822532)
        // camera.getWorldDirection(new THREE.Vector3(0.7595899940570272, -0.3944633343974142, 0.5171283387559793));


        camera.rotation.order = 'YXZ';
        scene.add(camera)
    
        const helper = new THREE.CameraHelper(camera);
        scene.add(helper);

        /**
         * Controls
         */
        // controls = new OrbitControls(camera, canvas)
        // controls.enableDamping = true
        // controls.enablePan = false

        /**
         * Loaders 
         */
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();

        /**
         * Renderer
         */
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias : true, 
            logarithmicDepthBuffer: true
        })

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMappingExposure = 1;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        /**
         * Models 
         */
    
        dracoLoader.setDecoderPath('/draco/')
        gltfLoader.setDRACOLoader(dracoLoader)
    
        let pins = []
        var target = new THREE.Vector3();

        gltfLoader.load(models,
            (gltf) => {
                mixer = new THREE.AnimationMixer(gltf.scene)
                clip = THREE.AnimationClip.findByName(gltf.animations, "CameraAction")
                console.log(clip)
                action = mixer.clipAction(clip).setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;

                const children = [...gltf.scene.children]
                console.log(gltf)
                animCamera = gltf.cameras[0]
                for(const child of children)
                {   
                    if(child.children.length > 0){
                        // console.log(child.children[0])
                        if(child.children[0].type == 'DirectionalLight'){
                            console.log(child.children[0])
                            child.children[0].castShadow = true
                            child.children[0].shadow.bias = 0.0001
                        }
                    }

                    if(child.material){
                        child.castShadow = true;

                        if(child.name === 'Plane'){
                            child.receiveShadow = true;
                        }

                        
                    } 

                    if(child.name !== 'Cube'){
                        mainScene.add(child)        
                    }
                    mainScene.updateMatrixWorld(true);
                }

                // console.log(pins)
                // if(pins.length > 0){
                //     currentView = pins[0]
                //     pins[0].geometry.computeBoundingBox()
                //     var boundingBox = pins[0].geometry.boundingBox;
    
                //     target.subVectors(boundingBox.max, boundingBox.min)
                //     target.multiplyScalar(0.5)
                //     target.add(boundingBox.min)
                //     target.applyMatrix4(pins[0].matrixWorld)
    
                //     console.log(target)
                //     camera.position.set(target.x - 2, 5, target.z - 2)
                //     controls.target.set(target.x, 1, target.z)
                //     controls.maxPolarAngle = (Math.PI / 4)
                //     controls.minPolarAngle = (Math.PI / 4)
    
                //     controls.minDistance = 2
                //     controls.maxDistance = 2
    
                //     controls.autoRotate = true;
                //     controls.autoRotateSpeed = 2.5
                // }
            },
            (xhr) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            (error) => {
                console.log( 'An error happened' );
            }
        )

        THREE.DefaultLoadingManager.onLoad = function ( ) {
            console.log( 'Loading Complete!');
            divLoader.classList.add('loaded');
            if(mixer){
                mixer.addEventListener("finished", function(e){
                    console.log(e)
                    console.log(animCamera)

                    animCamera.updateMatrixWorld();

                    // let vector = new THREE.Vector3(); // create once and reuse it!
                    // let direction = animCamera.getWorldDirection(vector);
                    // console.log(direction)

                    // var vector2 = animCamera.position.clone();
                    // vector2.applyMatrix4(animCamera.matrixWorld);
                    // console.log(vector2)

                    // camera.position.set(new THREE.Vector3(-107.99894247141552, 75.83479260248458, -127.7151015822532))
                    // camera.getWorldDirection(new THREE.Vector3(0.7595899940570272, -0.3944633343974142, 0.5171283387559793));

                    controls = new OrbitControls(animCamera, canvas)
                    controls.enableDamping = true
                    controls.enablePan = false
                })
            }


            setTimeout(() => {
                action.play()
            }, 1000)
        };


        
        



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
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        scene.add(hemiLight)
        
        // const directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
        // directionalLight.castShadow = true;
        
        // directionalLight.shadow.camera.top = 300;
        // directionalLight.shadow.camera.bottom = - 300;
        // directionalLight.shadow.camera.left = - 300;
        // directionalLight.shadow.camera.right = 300;
        // directionalLight.shadow.camera.near = 0.1;
        // directionalLight.shadow.camera.far = 3500;
        // directionalLight.shadow.bias = 0.0001;

        // directionalLight.shadow.mapSize.width = 2048
        // directionalLight.shadow.mapSize.height = 2048
        
        // directionalLight.position.set(105, 75, -120);
        // scene.add(directionalLight);

        // const lightHelper = new THREE.CameraHelper( directionalLight.shadow.camera)
        // scene.add(lightHelper);

    
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
                            // if(current === "Pin - Lezardscreation"){
                            //     activeCamera = 2
                            //     controls.enabled = false
                            //     controls.autoRotate = false

                            //     scenes.forEach(c => {
                            //         c.disableScene()
                            //     })
                            //     current360 = LezardsScene
                            //     LezardsScene.enableScene()                               
                            //     backButton.classList.add('visible')
                            // } else if(current === "Pin - Cote et braise") {
                            //     activeCamera = 1
                            //     controls.enabled = false
                            //     controls.autoRotate = false

                            //     scenes.forEach(c => {
                            //         c.disableScene()
                            //     })
                            //     current360 = CBScene
                            //     CBScene.enableScene()                               
                            //     backButton.classList.add('visible')
                            // } else if(current === "Pin - Tsubaki"){
                            //     activeCamera = 3
                            //     controls.enabled = false
                            //     controls.autoRotate = false

                            //     scenes.forEach(c => {
                            //         c.disableScene()
                            //     })
                            //     current360 = TsubakiScene
                            //     TsubakiScene.enableScene()                               
                            //     backButton.classList.add('visible')
                            // } else if(current === "Pin - Dragon or"){
                            //     activeCamera = 4
                            //     controls.enabled = false
                            //     controls.autoRotate = false

                            //     scenes.forEach(c => {
                            //         c.disableScene()
                            //     })
                            //     current360 = DragonScene
                            //     DragonScene.enableScene()                               
                            //     backButton.classList.add('visible')
                            // }
                        }
                    })
                }
            }
        }

        /**
         * Scene 360
         */
        scenes = []
        
    
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

            // Update Mixer
            if(mixer){
                mixer.update(deltaTime)
            }

            // Update controls
            if(controls){
                controls.update()
            }
    
            // Render
            if(activeCamera === 0){
                if(animCamera){
                    renderer.render(scene, animCamera)
                }
            } else if (activeCamera === 1){
                renderer.render(scene, camera)
            } else {
                current360.show()
                if(current360.child){
                    current360.disableScene()
                    current360 = current360.child
                    current360.enableScene()
                }
            }
            // lightHelper.update()
            stats.end()
        }

        /**
         * GUI
         */

        gui = new dat.GUI()
        // gui.add(directionalLight.position, 'x', -500, 500)        
        // gui.add(directionalLight.position, 'y', -500, 500)        
        // gui.add(directionalLight.position, 'z', -500, 500)        
    }
}