import { World } from './js/World'
import "./style.scss"

const canvas = document.querySelector('canvas.webgl')
const world = new World(canvas)

bindEventListeners();
render();

function bindEventListeners(){
    window.onresize = resizeCanvas

    window.addEventListener('keyup', event => {
        world.changeScene(event)
    }) 

    window.addEventListener('keyup', event => {
        world.resetScene(event)
    })

    window.addEventListener('keyup', event => {
        if(event.code === "ArrowRight"){
            world.nextPin()
        }
    })

    window.addEventListener('keyup', event => {
        if(event.code === "ArrowLeft"){
            world.previousPin()
        }
    })

    window.addEventListener('click', () => {
        world.onClick()
    })

    resizeCanvas();
}

function resizeCanvas() {
	canvas.style.width = '100%';
	canvas.style.height= '100%';
	
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
    world.onWindowResize();
}

function render(){
    requestAnimationFrame(render);
    world.update()
}



