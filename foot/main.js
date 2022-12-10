
const USE_SHADOWS = true;
const FRAMERATE = 30;

import * as THREE from '/lib/three/three.module.js';
import { GLTFLoader } from '/lib/three/GLTFLoader.js';
import { OrbitControls } from '/lib/three/OrbitControls.js';



// set up renderer and scene
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.physicallyCorrectLights = true; // doesn't seem to work in constructor
if(USE_SHADOWS) renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
console.log('renderer:', renderer);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xf0d0d0, 0x101030, 4));
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 12);
controls.target.set(0, 2, 0);
controls.autoRotate = true;
controls.enablePan = false;
controls.update();
console.log('scene:', scene);

// load gltf
async function async_load(loader, url) {
    return new Promise(resolve => {
        loader.load(url, resolve);
    });
}
const gltf = await async_load(new GLTFLoader(), '/foot/foot.glb');
console.log('gltf:', gltf);
scene.add(gltf.scene);
scene.traverse(obj => {
    if(obj.material && obj.material.map) {
        obj.material.map.encoding = THREE.sRGBEncoding;
    }
    if(USE_SHADOWS && obj.material instanceof THREE.Material) {
        obj.receiveShadow = true;
        if(!obj.userData.noShadow)
            obj.castShadow = true;
        console.log(obj, ' receives shadow');
    }
    if(obj.userData) {
        if(USE_SHADOWS && obj instanceof THREE.Light && obj.name.indexOf('shadow') > -1) {
            console.log(obj, ' casts shadow');
            obj.castShadow = true;
            obj.shadow.mapSize.width = obj.shadow.mapSize.height = 1024;
        }
    }
});
scene.matrixAutoUpdate = false;


// load an environment image
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
new EXRLoader().load('/mnt/tera/graphics/hdr/forest.exr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    //scene.background = envMap;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
});

// play animations
const animationMixer = new THREE.AnimationMixer(gltf.scene);
for(let i = 0; i < gltf.animations.length; i++) {
    console.log('anim:', gltf.animations[0]);
    let action = animationMixer.clipAction(gltf.animations[i]);
    action.play();
}

// set up render loop
const frame_clock = new THREE.Clock(true);
const frame_interval = 1 / FRAMERATE;
let frame_delta = 0;
const anim_clock = new THREE.Clock(true);

renderer.setAnimationLoop((time) => {
    frame_delta += frame_clock.getDelta();
    if(frame_delta < frame_interval) return;
    frame_delta = frame_delta % frame_interval;

    if(!cameras[camid]) return;
    const camera = cameras[camid];

    // update size/aspect if necessary
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if(width !== canvas.width || height !== canvas.height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    animationMixer.update(anim_clock.getDelta());

    renderer.render(scene, camera);
});



