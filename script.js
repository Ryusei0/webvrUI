// Three.jsモジュールをインポート
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーンを設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 白い背景

// カメラを設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

// レンダラーを設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// カードのジオメトリーを作成
const cardGeometry = new THREE.PlaneGeometry(10, 15);

// カードのマテリアルを作成
const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // 黒色のカード

// カードのメッシュを作成し、シーンに追加
const cards = [];
for (let i = 0; i < 5; i++) {
  const card = new THREE.Mesh(cardGeometry, cardMaterial);
  card.position.x = i * 15 - 30; // カードを横に並べる
  scene.add(card);
  cards.push(card);
}

// コントロールを設定
const controls = new OrbitControls(camera, renderer.domElement);

// リサイズイベントに応じてビューポートを調整
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// アニメーション関数
function animate() {
  requestAnimationFrame(animate);

  // カードを回転
  cards.forEach((card, index) => {
    card.rotation.y += 0.01;
  });

  controls.update();
  renderer.render(scene, camera);
}

// アニメーションを開始
animate();
