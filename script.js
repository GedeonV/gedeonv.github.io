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

var mesh1;

initialize();
animate();

function initialize(){
    // Scene
    scene = new THREE.Scene()


    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)


    /**
     * Camera
     */

    camera = new THREE.Camera()
    scene.add(camera)

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
		//antialias : true,
		//alpha: true
	});
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
	
    renderer.setClearColor(new THREE.Color('0x000000'), 0)
	renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
        // sourceWidth: 1280,
        // sourceHeight: 960,
        // displayWidth: 1280,
        // displayHeight: 960
    });

    function onResize()
    {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)	
        if ( arToolkitContext.arController !== null )
        {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
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
        detectionMode: 'mono'
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
        type: 'pattern', patternUrl: "/data/nomad.patt", smooth: true,
    })

    const dracoLoader = new THREE.DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }

    const gltfLoader = new THREE.GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    gltfLoader.load(        
        'models/nomad.glb',
            (gltf) =>
            {
                gltf.scene.scale.set(1.25, 1.25, 1.25)
                gltf.scene.position.y = 0.25
                markerRoot1.add(gltf.scene)
            }
        )
    

    // let pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
    // pointLight.position.set(0.5,3,2);
    // pointLight.add( 
    //     new THREE.Mesh( 
    //         new THREE.SphereBufferGeometry( 0.05, 16,8 ), 
    //         new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 }) 
    //     ) 
    // );
    // markerRoot1.add( pointLight );

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