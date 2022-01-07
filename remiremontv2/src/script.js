import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

console.log( THREE.REVISION );

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

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

// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         const children = [...gltf.scene.children]
//         for(const child of children)
//         {
//             scene.add(child)
//         }
//     },
// )

// gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf',
//     (gltf) => {
//         const children = [...gltf.scene.children]
//         for(const child of children)
//         {
//             scene.add(child)
//         }
//     },
// )


gltfLoader.load('/models/rem.glb', (gltf) => {
    gltf.scene.scale.set(0.025, 0.025, 0.025)
    scene.add(gltf.scene)
})


const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2
object1.position.y = 2
scene.add(object1)

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
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

window.addEventListener('click', () => {
    if(currentIntersect){
        switch(currentIntersect.object){
            case object1: 
                    console.log('click on object 1')
                    action.play()
                break
        }
    }
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
    const objectsToTest = [object1]
    const intersects = raycaster.intersectObjects(objectsToTest)

    if(intersects.length){
        if(!currentIntersect){
            console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    } else {
        if(currentIntersect){
            console.log('mouse leave') 
        }

        currentIntersect = null
    }

    for(const intersect of intersects)
    {
        intersect.object.material.color.set('#0000ff')
    } 

    for(const object of objectsToTest)
    {
        if(!intersects.find(intersect => intersect.object === object))
        {
            object.material.color.set('#ff0000')
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