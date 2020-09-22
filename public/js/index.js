import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import tankFile from "../tank.glb";
import fontFile from "../fonts/helvetiker.json";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

const animations = [];
function registerAnimations(animation) {
  animations.push(animation);
}

function runAnimations() {
  animations.forEach((animation) => animation());
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var loader = new GLTFLoader();

// Ambient light
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setClearColor(0x5f85c4, 1);

var controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(50, 1, 50);
var material = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0xe8f0fb).convertSRGBToLinear(),
  flatShading: true
});
var material2 = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0x00ffff),
});
var cube = new THREE.Mesh(geometry, material);


function createTank({ tankModel, position }) {
  var s = 0.5;
  const tank = new THREE.Object3D();
  tank.position.y = position.y;
  tank.position.x = position.x;
  tank.position.z = position.z;
  tank.scale.set(s, s, s);
  tank.add(tankModel);
  const tankUI = createUI(tank);
  tank.add(tankUI);

  return tank;
}

loader.load(
  tankFile,
  function (gltf) {
    var mesh = gltf.scene.children[0];

    mesh.position.y = 1;
    mesh.position.x = 0;
    mesh.position.z = 0;
    mesh.castShadow = true;
    const mesh2 =  mesh.clone()
    const tank = createTank({
      tankModel: mesh,
      position: { x: 0, y: 0, z: 0 },
    });

    const tank2 = createTank({
     tankModel:mesh2,
      position: { x: -2.5, y: 0, z: 0 },
    });

   // var box = new THREE.BoxHelper( tank, 0xffff00 );


    mesh.receiveShadow = true;
    
    tank.userData.tester = "my tank";
    console.log(tank)
    scene.add(tank);

    console.log(tank)
    scene.add(tank2);

    //scene.add(box)
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

cube.receiveShadow = true;
scene.add(cube);

var cube = new THREE.Mesh(geometry, material);

camera.position.z = 5;
camera.position.y = 5;
camera.rotateX(25);
var light4 = new THREE.DirectionalLight(0xe8f0fb, 1);
light4.intensity = 0.8;
light4.position.set(10, 30, 30);
//light4.angle = Math.PI / 5;
light4.penumbra = 0.3;
light4.castShadow = true;

light4.shadow.mapSize.width = 2048;
light4.shadow.mapSize.height = 2048;

var d = 50;

light4.shadow.camera.left = -d;
light4.shadow.camera.right = d;
light4.shadow.camera.top = d;
light4.shadow.camera.bottom = -d;

light4.shadow.camera.near = 1;
light4.shadow.camera.far = 2500;
//light4.shadow.bias = -0.0001;
light4.shadow.radius = 8;
var helper = new THREE.CameraHelper(light4.shadow.camera);
scene.add(light4)
scene.add(helper)
//Text

let loader2 = new THREE.FontLoader();
let font = loader2.parse(fontFile);

var text;
var color = 0x6282bd;

function createUI(tank) {
  var box = new THREE.Box3().setFromObject(tank)
  const center = box.getCenter().sub(tank.position.clone());
  console.log(center)
  const tankUI = new THREE.Object3D();
  tankUI.position.set(center.x+0.3,center.y+1.1,center.z-0.1)
  console.log(center)

  var g = new THREE.BoxGeometry(0.1, 2, 0.1);

  var m = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x00ff00).convertSRGBToLinear(),
  });
  var d = new THREE.Mesh(g, m);
  d.position.y = 0;
  d.position.x = 0;
  d.position.z = 0;
  tankUI.add(d);

  var matLite = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });

  var message = "  Tank: \n183974";

  var shapes = font.generateShapes(message, 0.3);

  var geometry = new THREE.ShapeBufferGeometry(shapes);

  // make shape ( N.B. edge view not visible )

  text = new THREE.Mesh(geometry, matLite);
  text.position.z = 0;
  text.position.x = -1;
  text.position.y = 1.8;

  text.geometry.center();
  //text.rotateX(-Math.PI / 2);
  var points = [0, 0, 0, -0.2, 1.2, 0, -1.7, 1.2, 0];

  const linegeometry = new LineGeometry();
  linegeometry.setPositions(points);

  var material = new LineMaterial({
    color: color,
    linewidth: 2, // in pixels
    dashed: false,
  });

  material.resolution.set(window.innerWidth, window.innerHeight);

  var line = new Line2(linegeometry, material);
  tankUI.add(line);

  //tankUI.add(box);
  tankUI.add(text);

  registerAnimations(() => {
    tankUI.rotation.y = Math.atan2(
      camera.position.x - text.position.x,
      camera.position.z - text.position.z
    );
  });

  return tankUI;
}



var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;
const raycaster = new THREE.Raycaster();

window.addEventListener( 'click', onMouseClick, false );

function onMouseClick( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


  raycaster.setFromCamera( mouse, camera );
  
  var intersects = raycaster.intersectObjects( scene.children );
  console.log(intersects.map(data=>data))

}



//scene.add(light4);
//scene.add(helper)
var animate = function () {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  controls.update();

  runAnimations();


  renderer.render(scene, camera);
};

animate();
