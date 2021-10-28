// import './style.css'
// import * as THREE from 'three'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// import 'script-loader!./threex/ar-threex.js'

/**
 * Base
 */

var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;

document.addEventListener('DOMContentLoaded', (e) => {
    initialize();
    animate();
})

function initialize(){
    // Scene

    scene = new THREE.Scene()


    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1.0)
    scene.add(ambientLight)


    /**
     * Camera
     */    

    camera = new THREE.PerspectiveCamera(70, 640 / 480, 1, 1000);
    scene.add(camera);

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
     * Setup de arToolkitSource
     */

    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam',
    });

    function onResize()
    {
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)	
        if ( arToolkitContext.arController !== null )
        {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
        }	
    }

    arToolkitSource.init(function onReady(){
        onResize()
    });

    window.addEventListener('resize', function(){
        onResize()
    });

    /**
     * Setup de arToolkitContext
     */

    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: '/data/camera_para.dat',
        detectionMode: 'mono',
    });

    arToolkitContext.init( function onCompleted(){
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    });

    /**
     * Setup du marker
     */

    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);
    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern', patternUrl: "/data/nomad.patt",
    })


    function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }

    const gltfLoader = new THREE.GLTFLoader()
    const dracoLoader = new THREE.DRACOLoader()

    dracoLoader.setDecoderPath('draco/')
    gltfLoader.setDRACOLoader(dracoLoader)

    gltfLoader.load(        
        'models/nomad.glb',
            (gltf) =>
            {
                gltf.scene.scale.set(1, 1, 1)
                gltf.scene.position.y = 0.25
                markerRoot1.add(gltf.scene)
            }
        )
}

function update()
{
    if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
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