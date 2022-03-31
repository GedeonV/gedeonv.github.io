import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
// import { World } from '../internal'

export class Scene360 {
    constructor(sceneName, path, renderer, canvas) {
        this.renderer = renderer
        this.canvas = canvas
        this.currentIntersect = null
        this.hotspots = []
        this.labels = []

        this.clock = new THREE.Clock()
        this.tempV = new THREE.Vector3();

        /**
         * Debug
         */
        this.gui = new dat.GUI({name: 'Scène 360'});
        this.gui.hide()

        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.texture = new THREE.TextureLoader().load(path);
        this.texture.mapping = THREE.EquirectangularReflectionMapping;

        /**
         * Setup Scene
         */
        this.scene = new THREE.Scene();
        this.scene.name = sceneName
        this.scene.background = this.texture;


        /**
         * Setup Camera
         */
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 10000);
        this.camera.position.set(0,5,0)
        this.camera.updateProjectionMatrix();
        this.scene.add(this.camera)

        //this.axeHelper = new THREE.AxesHelper(5);
        //this.scene.add(this.axeHelper)

        /**
         * Setup Raycaster
         */
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        this.raycasterLabel = new THREE.Raycaster()

        /**
         * Setup Controls
         */
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enabled = false
        this.controls.enableZoom = false
        this.controls.enableDamping = true
        this.controls.target.set(0,5,0)

        this.scene = this.scene
        this.camera = this.camera
    }

    createHotspot(hotspots){
        hotspots.forEach((element, key) => {
            this.geometry = new THREE.SphereGeometry(1,32,16)
            this.material = new THREE.MeshBasicMaterial({color: '#a52424', transparent: true, opacity: 0}) // transparent: true, opacity: 0
            const hotspot = new THREE.Mesh(this.geometry, this.material)
            hotspot.position.copy(element.position)

            this.hotspots.push(hotspot)

            this.folder = this.gui.addFolder(element.HotspotName)
            this.folder.add(hotspot.position, 'x', -100, 100, 0.01).name('X')
            this.folder.add(hotspot.position, 'y', -100, 100, 0.01).name('Y')
            this.folder.add(hotspot.position, 'z', -100, 100, 0.01).name('Z')

            this.elem = document.createElement("div");
            
            this.label = document.createElement("span")
            this.label.textContent = element.HotspotName

            this.elem.appendChild(this.label)

            this.slug = element.HotspotName
            this.slug = this.slug.replace(/^\s+|\s+$/g, '');
            this.slug = this.slug.toLowerCase();
            var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
            var to   = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
            for (var i=0, l=from.length ; i<l ; i++) {
                this.slug = this.slug.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }
            this.slug = this.slug.replace(/[^a-z0-9 -]/g, '') 
            .replace(/\s+/g, '-') 
            .replace(/-+/g, '-'); 

            this.elem.classList.add('hotspot', `hotspot__${this.slug}`)
            this.label.classList.add('label')
            this.labels.push(this.elem)
            document.querySelector('body').appendChild(this.elem)
            
            this.elem.addEventListener('click', () => {
                console.log('click')
            })

            this.scene.add(hotspot)
        });
    }

    render(){   
        const time = this.clock.getElapsedTime()
        for(let i=0; i<this.hotspots.length;i++){
            this.hotspots[i].position.y += Math.cos( time ) * 0.01;

            this.hotspots[i].updateWorldMatrix(true, false);
            this.hotspots[i].getWorldPosition(this.tempV);

            this.tempV.project(this.camera)

            this.raycasterLabel.setFromCamera(this.tempV, this.camera)
            const intersectedObjects = this.raycasterLabel.intersectObjects(this.scene.children)

            const show = intersectedObjects.length && this.hotspots[i] === intersectedObjects[0].object;
            if(!show || Math.abs(this.tempV.z) > 1){
                this.labels[i].style.display = 'none'
            } else {
                this.labels[i].style.display = ''

                const x = (this.tempV.x *  .5 + .5) * this.canvas.clientWidth;
                const y = (this.tempV.y * -.5 + .5) * this.canvas.clientHeight;
            
                this.labels[i].style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0)`
                this.labels[i].style.zIndex = (-this.tempV.z * .5 + .5) * 100000 | 0;
            }
        }
        this.renderer.render(this.scene, this.camera);   
    }

    enableScene(){
        this.controls.enabled = true;
        this.gui.show()

        this.labels.forEach(el => {
            el.classList.add('visible')
        })

        // this.boundEventClick = this.onClick.bind(this)
        // window.addEventListener('click', this.boundEventClick, false)

        // this.boundEventMove = this.onMouseMove.bind(this)
        // window.addEventListener('mousemove', this.boundEventMove, false)
    }

    // onMouseMove(e){
    //     this.mouse.x = e.clientX / this.sizes.width * 2 - 1
    //     this.mouse.y = - (e.clientY / this.sizes.height) * 2 + 1
    //     this.raycaster.setFromCamera(this.mouse, this.camera)
    //     let intersects = this.raycaster.intersectObjects(this.hotspots, false)
    //     if(intersects.length > 0){
    //         if(!this.currentIntersect){
    //             intersects[0].object.material.color.set('#ffffff')
    //         }
    //         this.currentIntersect = intersects[0]
    //     } else {
    //         if(this.currentIntersect){
    //             this.currentIntersect.object.material.color.set('#a52424')
    //         }
    //         this.currentIntersect = null
    //     }
    // }

    // onClick(e){
    //     e.preventDefault()
    //     this.mouse.x = e.clientX / this.sizes.width * 2 - 1
    //     this.mouse.y = - (e.clientY / this.sizes.height) * 2 + 1
    //     this.raycaster.setFromCamera(this.mouse, this.camera)
    //     let intersects = this.raycaster.intersectObjects(this.hotspots, false)
    // }

    disableScene(){
        this.controls.enabled = false
        this.gui.hide()

        this.labels.forEach(el => {
            el.classList.remove('visible')
        })

        // window.removeEventListener('click', this.boundEventClick)
        // window.removeEventListener('click', this.boundEventMove)
    }
}