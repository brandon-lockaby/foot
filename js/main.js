
import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { OrbitControls } from './lib/OrbitControls.js';

// renderer and targets
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 12);
controls.target.set(0, 2, 0);
controls.autoRotate = true;
controls.enablePan = false;
controls.update();
//scene.add(new THREE.HemisphereLight(0xf0d0d0, 0x101030, 4));
const gltf_loader = new GLTFLoader();
const gltf = await gltf_loader.loadAsync('./models/foot.glb');
console.log(gltf);
scene.add(gltf.scene);

// modifications
scene.traverse(obj => {
    if(obj.material && obj.material.name == 'white') {
        obj.material = new THREE.MeshNormalMaterial({});
        obj.geometry.computeVertexNormals({flatShading: true, wireframe: true});
    }
});

// events
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// all render
renderer.setAnimationLoop((time) => {
    controls.update();
    renderer.render(scene, camera);
});
