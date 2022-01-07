/**
 * Base
 */

var scene, camera, renderer, clock, deltaTime, totalTime;

document.addEventListener('DOMContentLoaded', (e) => {
    initialize();
    animate();
})

function initialize(){

    /**
    *  Scene
    */ 
    scene = new THREE.Scene()


    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    /**
 * Sizes
 */

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }


    /**
     * Camera
     */    

    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    scene.add(camera);

    /**
      * Controls
      */ 
    const controls = new THREE.OrbitControls(camera, canvas)
    controls.target.set(0, 0.75, 0)
    controls.enableDamping = true

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({antialias : true, alpha: true, logarithmicDepthBuffer: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

    /**
     * Animate
     */
    clock = new THREE.Clock()
    deltaTime = 0
    totalTime = 0

    /**
     * Setup des objets
     */

    function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }

    const gltfLoader = new THREE.GLTFLoader()
    const dracoLoader = new THREE.DRACOLoader()

    dracoLoader.setDecoderPath('draco/')
    gltfLoader.setDRACOLoader(dracoLoader)

    gltfLoader.load(        
        'models/rem.glb',
            (gltf) =>
            {
                console.log(gltf)
                gltf.scene.scale.set(0.1, 0.1, 0.1)
                gltf.scene.position.y = 0.25
                markerRoot1.add(gltf.scene)
            }
        )

    /**
     * Mouse
     */

    const mouse = new THREE.Vector2()

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX / sizes.width * 2 - 1
        mouse.y = - (event.clientY / sizes.height) * 2 + 1
    })
}



function update()
{

}

function render(){
    renderer.render( scene, camera );
}

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}