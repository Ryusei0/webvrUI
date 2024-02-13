import * as THREE from 'three';

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
const cardPositions = [];
for (let i = 0; i < numberOfCards; i++) {
    const theta = (i / numberOfCards) * Math.PI * 2; // 角度
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.position.set(x, 0, z); // y軸は0とする
    card.lookAt(camera.position); // カードがカメラを向くように回転
    scene.add(card);
    cards.push(card);
    cardPositions.push(new THREE.Vector3(x, 0, z));
}

// カードの並びを更新する関数
function updateCardPositions(direction) {
    // カードの位置を配列で回転させる
    if (direction > 0) {
        cardPositions.unshift(cardPositions.pop()); // 右に移動
    } else {
        cardPositions.push(cardPositions.shift()); // 左に移動
    }

    // 新しい位置にカードを配置
    for (let i = 0; i < numberOfCards; i++) {
        cards[i].position.set(cardPositions[i].x, cardPositions[i].y, cardPositions[i].z);
        cards[i].lookAt(camera.position);
    }
}

// レンダリング関数
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// DOMがロードされた後でイベントリスナーを追加
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('slideLeft').addEventListener('click', () => updateCardPositions(-1));
    document.getElementById('slideRight').addEventListener('click', () => updateCardPositions(1));
});

render();
