import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// シーン、カメラ、レンダラーの設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 背景を白に設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// カードの配置を円形にする
const numberOfCards = 10;
const radius = 30; // 円の半径
const cardGeometry = new THREE.PlaneGeometry(5, 8); // カードのサイズ
const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // カードを黒に設定
const cards = [];
const cardNames = [];
const loader = new FontLoader();

// フォントを読み込み、テキストジオメトリを作成
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    for (let i = 0; i < numberOfCards; i++) {
        const theta = (i / numberOfCards) * Math.PI * 2; // 角度
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        card.position.set(x, 0, z);
        scene.add(card);
        cards.push(card);

        // カード名のテキストジオメトリを作成
        const textGeometry = new TextGeometry(`Card ${i+1}`, {
            font: font,
            size: 0.5,
            height: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, 5, z); // カードの上に配置
        textMesh.lookAt(camera.position);
        scene.add(textMesh);
        cardNames.push(textMesh);
    }
});

// カードの位置を更新する関数
function updateCardPositions(direction) {
    // カードの位置を配列で回転させる
    if (direction > 0) {
        cards.unshift(cards.pop()); // 右に移動
        cardNames.unshift(cardNames.pop()); // テキストも同様に
    } else {
        cards.push(cards.shift()); // 左に移動
        cardNames.push(cardNames.shift()); // テキストも同様に
    }

    // 新しい位置にカードを配置
    for (let i = 0; i < numberOfCards; i++) {
        const theta = (i / numberOfCards) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        cards[i].position.set(x, 0, z);
        cards[i].lookAt(camera.position);
        cardNames[i].position.set(x, 5, z); // テキストの位置を更新
        cardNames[i].lookAt(camera.position);
    }
}

// レンダリング関数
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// レンダリングループを開始
render();

// ボタンのイベントリスナーを追加
document.getElementById('slideLeft').addEventListener('click', () => updateCardPositions(1));
document.getElementById('slideRight').addEventListener('click', () => updateCardPositions(-1));

// ウィンドウリサイズイベント
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

