import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーン、カメラ、レンダラーの設定
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// カードの配置を円形にする
const numberOfCards = 10;
const radius = 30; // 円の半径
const cardGeometry = new THREE.PlaneGeometry(5, 8); // カードのサイズ
const cardMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
const cards = [];
for (let i = 0; i < numberOfCards; i++) {
    const theta = (i / numberOfCards) * Math.PI * 2; // 角度
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.position.set(x, y, -i * 0.1); // 奥行きを微調整
    card.rotation.y = Math.PI - theta; // カードが中心を向くように回転
    scene.add(card);
    cards.push(card);
}

// レンダリング関数
function render() {
    renderer.render(scene, camera);
}

// カードの位置を更新する関数
function updateCardPositions(direction) {
    // 各カードの位置を更新
    cards.forEach(card => {
        const theta = Math.atan2(card.position.y, card.position.x) + direction * (Math.PI / numberOfCards);
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        card.position.set(x, y, card.position.z);
        card.rotation.y = Math.PI - theta;
    });
    
    // 奥行きをソートして更新
    cards.sort((a, b) => b.position.z - a.position.z);
    cards.forEach((card, index) => {
        card.position.z = -index * 0.1;
    });
}

// ボタンイベント
document.getElementById('slideLeft').addEventListener('click', () => updateCardPositions(1));
document.getElementById('slideRight').addEventListener('click', () => updateCardPositions(-1));

render();
