import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import tankFile from "../tank.glb";
import fontFileBold from "three/examples/fonts/helvetiker_bold.typeface.json";
import fontFile from "three/examples/fonts/helvetiker_regular.typeface.json";

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";

const animations = [];
function registerAnimations(animation) {
  animations.push(animation);
}

function runAnimations() {
  animations.forEach((animation) => animation());
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  85,
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

renderer.setClearColor(0x78c2d9, 1);

var controls = new OrbitControls(camera, renderer.domElement);

controls.maxPolarAngle = Math.PI / 2.1;
controls.minPolarAngle = Math.PI / 8;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(20, 1, 20);
var material = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0x88b14c), //.convertSRGBToLinear(),
  flatShading: true,
});
var material2 = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0x00ffff),
});
var cube = new THREE.Mesh(geometry, material);
cube.position.y = -0.5;

function createFlowLine({
  start,
  end,
  color,
  flowing,
  dashOffset = 0.1,
  dashRatio = 0.1,
  dashArray = 0.2,
}) {
  const lineGometry = new THREE.Geometry();
  console.log("flowStart", start);
  console.log("flowEnd", end);
  lineGometry.vertices.push(start);
  lineGometry.vertices.push(end);

  const line = new MeshLine();
  line.setPoints(lineGometry.vertices);
  const material = new MeshLineMaterial({
    color: color,
    lineWidth: 0.15, // in pixels
    dashOffset,
    dashRatio,
    dashArray,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    //side: THREE.DoubleSide,
    transparent: true,
  });

  const lineMesh = new THREE.Mesh(line, material);

  if (flowing) {
    registerAnimations(() => {
      lineMesh.material.uniforms.dashOffset.value -= 0.002;
    });
  }

  return lineMesh;
}

function createInactiveFlowLine({ start, end }) {
  return createFlowLine({
    color: 0x707070,
    flowing: false,
    start,
    end,
    dashArray: 0.05,
    dashRatio: 0.4,
  });
}

function createActiveFlowLine({ start, end }) {
  return createFlowLine({
    color: 0x09bee0,
    flowing: true,
    start,
    end,
  });
}

function createTank({ tankModel, position, fillPercentage, name }) {
  var s = 0.5;
  const tank = new THREE.Object3D();
  tank.position.y = position.y;
  tank.position.x = position.x;
  tank.position.z = position.z;
  tank.scale.set(s, s, s);
  tank.add(tankModel);
  const tankUI = createUI({ tank, fillPercentage, name });
  tank.add(tankUI);

  return tank;
}

loader.load(
  tankFile,
  function (gltf) {
    var mesh = gltf.scene.children[0];

    mesh.position.y = 0;
    mesh.position.x = 0;
    mesh.position.z = 0;
    mesh.castShadow = true;
    const tank = createTank({
      name: "378493",
      fillPercentage: 22,
      tankModel: mesh,
      position: { x: 0, y: 0, z: 0 },
    });

    const tank2 = createTank({
      name: "378493",
      fillPercentage: 20,
      tankModel: mesh.clone(),
      position: { x: -3.5, y: 0, z: 0 },
    });

    const tank3 = createTank({
      name: "937832",
      fillPercentage: 50,
      tankModel: mesh.clone(),
      position: { x: 1, y: 0, z: -4 },
    });

    const tank4 = createTank({
      name: "123654",
      fillPercentage: 67,
      tankModel: mesh.clone(),
      position: { x: 3, y: 0, z: 3 },
    });

    scene.add(
      createActiveFlowLine({
        start: tank2.getWorldPosition(),
        end: tank.getWorldPosition(),
      })
    );

    scene.add(
      createActiveFlowLine({
        start: tank.getWorldPosition(),
        end: tank4.getWorldPosition(),
      })
    );

    scene.add(
      createInactiveFlowLine({
        start: tank4.getWorldPosition(),
        end: tank3.getWorldPosition(),
      })
    );

    scene.add(
      createInactiveFlowLine({
        start: tank.getWorldPosition(),
        end: tank3.getWorldPosition(),
      })
    );

    // var box = new THREE.BoxHelper( tank, 0xffff00 );

    mesh.receiveShadow = true;

    tank.userData.tester = "my tank";
    console.log(tank);
    scene.add(tank);

    console.log(tank);
    scene.add(tank2);
    scene.add(tank3);
    scene.add(tank4);
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
scene.add(light4);
//scene.add(helper);
//Text

let loader2 = new THREE.FontLoader();
let font = loader2.parse(fontFileBold);

var color = 0xfaf9f9;

function createUI({ tank, fillPercentage, name }) {
  var box = new THREE.Box3().setFromObject(tank);
  const center = box.getCenter().sub(tank.position.clone());
  console.log(center);
  const tankUI = new THREE.Object3D();
  tankUI.position.set(center.x + 0.3, center.y + 1.1, center.z - 0.1);
  console.log(center);

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

  var tankNameText = new THREE.TextGeometry(message, {
    font: font,
    size: 0.3,
    height: 0.01,
  });

  var message = ` ${Number(fillPercentage)}%`;

  var fillPercentText = new THREE.TextGeometry(message, {
    font: font,
    size: 0.5,
    height: 0.01,
  });

  // make shape ( N.B. edge view not visible )

  const text = new THREE.Mesh(fillPercentText, matLite);
  text.position.z = 0;
  text.position.x = -1.7;
  text.position.y = -0;
  text.geometry.center();

  const text2 = new THREE.Mesh(tankNameText, matLite);
  text2.position.z = 0;
  text2.position.x = -1.7;
  text2.position.y = 0.9;
  text2.geometry.center();

  const xx = new THREE.Geometry();

  xx.vertices.push(new THREE.Vector3(0, -1.5, 0));
  xx.vertices.push(new THREE.Vector3(-1, -0.5, 0));
  xx.vertices.push(new THREE.Vector3(-2.5, -0.5, 0));

  const line = new MeshLine();
  line.setPoints(xx.vertices);

  const material = new MeshLineMaterial({
    color: 0xff00ff,
    lineWidth: 0.05, // in pixels
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });

  const mesh = new THREE.Mesh(line, material);

  tankUI.add(mesh);

  //tankUI.add(box);
  tankUI.add(text);
  tankUI.add(text2);

  registerAnimations(() => {
    tankUI.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));
  });

  return tankUI;
}

var mouse = new THREE.Vector2(),
  INTERSECTED;
var radius = 100,
  theta = 0;
const raycaster = new THREE.Raycaster();

window.addEventListener("click", onMouseClick, false);

function onMouseClick(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);
  console.log(intersects.map((data) => data));
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
