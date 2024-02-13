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
let currentIndex = 0;
const numberOfCards = 10;
const radius = 30; // 円の半径
const cardGeometry = new THREE.PlaneGeometry(5, 8); // カードのサイズ
const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // カードを黒に設定
const cards = [];
const cardNames = []; // カード名のための配列を準備
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
    updateCardPositions(currentIndex);
});

// カードの位置とサイズを更新する関数
function updateCardPositions(index) {
    const cardOffset = 2 * Math.PI / numberOfCards; // カード間の角度
    cards.forEach((card, i) => {
        const angle = cardOffset * (i - index) + Math.PI / 2; // indexを中心に配置
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        card.position.set(x, 0, z);
        card.lookAt(camera.position);

        // カードのスケールを更新
        const scale = (i === index) ? 1.5 : 1; // 中央のカードを大きく表示
        card.scale.set(scale, scale, scale);
    });

    cardNames.forEach((text, i) => {
        const angle = cardOffset * (i - index) + Math.PI / 2; // indexを中心に配置
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        text.position.set(x, 5, z);
        text.lookAt(camera.position);

        // テキストのスケールを更新
        const scale = (i === index) ? 1.5 : 1; // 中央のテキストを大きく表示
        text.scale.set(scale, scale, scale);
    });
}

// ボタンイベントハンドラー
document.getElementById('slideLeft').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % numberOfCards;
    updateCardPositions(currentIndex);
});
document.getElementById('slideRight').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + numberOfCards) % numberOfCards;
    updateCardPositions(currentIndex);
});

// レンダリング関数
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();