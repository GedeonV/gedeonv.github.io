import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Vector3 } from 'three'
import gsap from 'gsap'

console.log( THREE.REVISION );

/**
 * Base
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Models 
 */

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()

dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

let pins = []
var target = new THREE.Vector3(1,1,1);

gltfLoader.load('/models/rem.glb',
    (gltf) => {
        const children = [...gltf.scene.children]
        for(const child of children)
        {
            child.scale.set(0.025, 0.025, 0.025)
            if(child.name.includes('Pin')){
                console.log(child.name)
                pins.push(child)
            }
            scene.add(child)
            scene.updateMatrixWorld(true);
        }
        console.log(pins)
    },
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
 * Floor
 */


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
//controls.target.set(0, 0.75, 0)
controls.enableDamping = true

window.addEventListener('click', () => {
    if(currentIntersect){
        console.log(currentIntersect.object)
        console.log(currentIntersect.object.userData.name)

        currentIntersect.object.geometry.computeBoundingBox()
        var boundingBox = currentIntersect.object.geometry.boundingBox;

        target.subVectors(boundingBox.max, boundingBox.min)
        target.multiplyScalar(0.5)
        target.add(boundingBox.min)
        target.applyMatrix4(currentIntersect.object.matrixWorld)

        console.log(target)

        gsap.to( controls.target, {
            duration: 1,
            x: target.x,
            y: 0.8,
            z: target.z,
            onUpdate: function () {
                controls.update();
            }
        });

        gsap.to(controls, {
            duration: 1,
            minDistance: 2,
            ease: 'power1.inOut',
            onComplete: () => {
                controls.maxDistance = 0
                controls.autoRotate = true; 
            },
        })

        

        // gsap.to(camera, {duration: 1, zoom: 15, onUpdate: function(){
        //     camera.updateMatrixWorld();
        // }})

        
    }
})

window.addEventListener('wheel', () => {
    console.log(camera.zoom)
    console.log(camera)
})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias : true, 
    logarithmicDepthBuffer: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

let currentIntersect = null

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
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
        
            for(const intersect of intersects)
            {
                //console.log(intersect.object.userData.name)
            } 
        
            for(const object of o)
            {
                if(!intersects.find(intersect => intersect.object === object))
                {
                    //object.material.color.set('#ff0000')
                }
            }
        }
    }

    // Update controls
    controls.update()

    // Render

    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()