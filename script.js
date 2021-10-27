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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    // directionalLight.castShadow = true
    // directionalLight.shadow.mapSize.set(1024, 1024)
    // directionalLight.shadow.camera.far = 15
    // directionalLight.shadow.camera.left = - 7
    // directionalLight.shadow.camera.top = 7
    // directionalLight.shadow.camera.right = 7
    // directionalLight.shadow.camera.bottom = - 7
    // directionalLight.position.set(5, 5, 5)
    // scene.add(directionalLight)


    /**
     * Camera
     */

    camera = new THREE.Camera()
    scene.add(camera)

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 1280, 960 );
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
        sourceWidth: 1280,
        sourceHeight: 960,
        displayWidth: 1280,
        displayHeight: 960
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

    // const dracoLoader = new THREE.DRACOLoader()
    // dracoLoader.setDecoderPath('/draco/')

    function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }

    new THREE.MTLLoader()
		.setPath( 'models/' )
		.load( 'nomad.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/' )
				.load( 'nomad.obj', function ( group ) {
                    group.position.y = 0.25
                    group.scale.set(0.25, 0.25, 0.25)
					markerRoot1.add(group);
				}, onProgress, onError );
		});
    

    let pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLight.position.set(0.5,3,2);
    pointLight.add( 
        new THREE.Mesh( 
            new THREE.SphereBufferGeometry( 0.05, 16,8 ), 
            new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 }) 
        ) 
    );
    markerRoot1.add( pointLight );

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