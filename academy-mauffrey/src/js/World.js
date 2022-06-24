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

import models from '../../static/models/academy-mauffreyv27.glb'


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
        var scene, scenes, camera, controls, composer, transition, renderer, gui
        var animations, animCamera, actions, mixer, traveling, movingCamion1, movingCamion2, movingCamion3, movingCamion4, movingCamion5
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

        mainScene.background = new Color('0xdddddd')
        
        const axesHelper = new THREE.AxesHelper( 50 );
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
        camera.position.set(-107.99894247141552, 75.83479260248458, -127.7151015822532)

        camera.rotation.order = 'YXZ';
        scene.add(camera)
    
        const helper = new THREE.CameraHelper(camera);
        // scene.add(helper);

        /**
         * Controls
         */
        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.enablePan = false
        // controls.maxPolarAngle = (Math.PI / 4)
        // controls.minPolarAngle = (Math.PI / 4)

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

        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;
        renderer.toneMappingExposure = 2.3;
        renderer.colorManagement=true

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        /**
         * Actions
         */

        this.updateAllActions = () => {
            actions.forEach(action => {
                action.clampWhenFinished = true;
            })
        }

        this.playAllActions = () => {
            actions.forEach(action => {
                action.play()
            })
        }


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
                animations = gltf.animations
                
                traveling = mixer.clipAction(animations[0]).setLoop(THREE.LoopOnce);
                movingCamion1 = mixer.clipAction(animations[1]).setLoop(THREE.LoopOnce);
                movingCamion2 = mixer.clipAction(animations[2]).setLoop(THREE.LoopOnce);
                movingCamion3 = mixer.clipAction(animations[3]).setLoop(THREE.LoopOnce);
                movingCamion4 = mixer.clipAction(animations[4]).setLoop(THREE.LoopOnce);
                movingCamion5 = mixer.clipAction(animations[5]).setLoop(THREE.LoopOnce);

                actions = [traveling, movingCamion1, movingCamion2, movingCamion3, movingCamion4, movingCamion5];
                this.updateAllActions()

                const children = [...gltf.scene.children]
                console.log(gltf)
                animCamera = gltf.cameras[0]
                // camera.copy(animCamera)
                // let helper = new THREE.CameraHelper( animCamera );
                // scene.add(helper)


                for(const child of children)
                {   
                    if(child.name === 'Autres_plans'){
                        child.receiveShadow = true
                    }
                    console.log(child)

                    if(child.name === 'Plan_principal'){
                        console.log(child)
                        child.receiveShadow = true
                    }

                    if(child.name === 'Bâtiment_principal'){
                        child.traverse(c => {
                            if (c.isMesh){ 
                                c.castShadow = true;
                                if(c.material.map) c.material.map.anisotropy = 16; 
                            }
                        })
                    }

                    if(child.name === "Bâtiments_4_et_5"){
                        child.traverse(c => {
                            if (c.isMesh){ 
                                c.castShadow = true;
                                if(c.material.map) c.material.map.anisotropy = 16; 
                            }
                        })
                    }

                    if(child.name === "Voitures"){
                        child.traverse(c => {
                            if (c.isMesh){ 
                                c.castShadow = true;
                                if(c.material.map) c.material.map.anisotropy = 16; 
                            }
                        })
                    }

                    if(child.name === "Camions"){
                        child.traverse(c => {
                            if (c.isMesh){ 
                                c.castShadow = true;
                                if(c.material.map) c.material.map.anisotropy = 16; 
                            }
                        })
                    }

                    if(child.name === "Batiments_2_et_3"){
                        child.traverse(c => {
                            if (c.isMesh){ 
                                c.castShadow = true;
                                if(c.material.map) c.material.map.anisotropy = 16; 
                            }
                        })
                    }

                    mainScene.add(child)
                    mainScene.updateMatrixWorld(true);
                }
            },
            (xhr) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            (error) => {
                console.log( 'An error happened' );
            }
        )

        THREE.DefaultLoadingManager.onLoad = () => {
            console.log( 'Loading Complete!');
            divLoader.classList.add('loaded');
            
            setTimeout(() => {
                this.playAllActions()
            }, 1000)

            if(mixer){
                mixer.addEventListener("finished", function(e){
                    let clip = e.action.getClip()
                    if(clip.name === "CameraAction"){
                        var vector = new THREE.Vector3(0, 0, 0);
                        let direction = animCamera.getWorldDirection(vector);
                        console.log(direction)

                        let raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(new THREE.Vector2(), animCamera);
                        const intersects = raycaster.intersectObjects(scene.children)
                        let point = intersects[0].point 
                        scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) );
                        controls.target.set(point.x, point.y, point.z)
                        activeCamera = 1

                        setTimeout(() => {
                            controls.autoRotate = true
                        }, 2500)
                    }

                    // activeCamera = 1

                    
                })
            }
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

        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.3);
        scene.add(ambient)

        const directionalLight = new THREE.DirectionalLight(0xffa95c, 1);
        directionalLight.castShadow = true;
        
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = - 100;
        directionalLight.shadow.camera.left = - 100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 250;
        directionalLight.shadow.bias = -0.0001;

        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        
        directionalLight.position.set(0, 65, 80);
        scene.add(directionalLight);

        // const lightHelperShadow = new THREE.CameraHelper( directionalLight.shadow.camera );
        // scene.add( lightHelperShadow );

        // const lightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );
        // scene.add(lightHelper);

        const spotlight = new THREE.SpotLight(0xffa95c,4);
        spotlight.position.set(0,65,80);
        spotlight.castShadow = true;
        scene.add( spotlight );

        spotlight.shadow.bias = -0.0001;
        spotlight.shadow.mapSize.width = 1024*4;
        spotlight.shadow.mapSize.height = 1024*4;

        // const spotlightHelperShadow = new THREE.CameraHelper( directionalLight.shadow.camera );
        // scene.add( spotlightHelperShadow );

        var light = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        scene.add(light);    

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

            // lightHelperShadow.update()
            // spotlightHelperShadow.update()

            stats.end()
        }

        /**
         * GUI
         */

        gui = new dat.GUI()

        let amb = gui.addFolder('Lumière Ambiante')
        amb.add(ambient, 'intensity', 0, 1)       
        amb.addColor(ambient,'color')


        let dir = gui.addFolder('Lumière Directionnelle');
        dir.add(directionalLight, 'intensity', 0, 5) 
        dir.addColor(directionalLight,'color')
        dir.add(spotlight, 'castShadow')
        
        dir.add(directionalLight.shadow.camera, 'top', -300, 300).onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        })

        dir.add(directionalLight.shadow.camera, 'right', -300, 300).onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        }) 

        dir.add(directionalLight.shadow.camera, 'bottom', -300, 300) .onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        })

        dir.add(directionalLight.shadow.camera, 'left', -300, 300) .onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        })

        dir.add(directionalLight.shadow.camera, 'near', 0, 1).onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        })

        dir.add(directionalLight.shadow.camera, 'far', 5, 1000).onChange(val => {
            directionalLight.shadow.camera.updateProjectionMatrix();
        }) 
        
        dir.add(directionalLight.position, 'x', -300, 300) 
        dir.add(directionalLight.position, 'y', -300, 300) 
        dir.add(directionalLight.position, 'z', -300, 300) 

        let hem = gui.addFolder('Hemisphere')
        hem.addColor(light,'color')
        hem.addColor(light,'groundColor')
        hem.add(light, 'intensity', 0, 5)


        let spot = gui.addFolder('Projecteur') 
        spot.add(spotlight, 'intensity', 0, 5) 
        spot.addColor(spotlight,'color')
        spot.add(spotlight, 'castShadow')

        spot.add(spotlight.position, 'x', -300, 300) 
        spot.add(spotlight.position, 'y', -300, 300) 
        spot.add(spotlight.position, 'z', -300, 300) 
    }
}