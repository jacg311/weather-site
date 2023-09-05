/*import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(10, 3, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x18b507 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
cube.rotation.x += -1.1;
cube.rotation.z += -0.25;


window.onresize = function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();*/

async function getCurrentWeather() {
    // get current weather for city
    let city = document.getElementById("location").value;
    let response = new Response("{}", {
        status: 512,
        statusText: "test response"
    });

    if (!response.ok) {

    }

    let data = await response.json();

    // fill error text when an error occurs
    if (!response.ok) {

        // probably a data problem
        if (data["message"]) {
            document.getElementById("error_text").innerText = `An error occured! ${data["message"]}`
        }
        else { // something has gone very wrong uh oh
            document.getElementById("error_text").innerText = `A server error occured! ${response.status}: ${response.statusText}`;
        }
    }
}