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
});

// カードの位置とサイズを更新する関数
function updateCardPositions(index) {
    const cardOffset = Math.PI / numberOfCards; // カード間の角度
    for (let i = 0; i < numberOfCards; i++) {
        const theta = (i / numberOfCards) * Math.PI * 2 + cardOffset;
        const phi = theta - Math.PI / 2; // 中央のカードが向かい合うように調整

        // 円周上の位置を計算
        const x = radius * Math.cos(phi);
        const z = radius * Math.sin(phi);
        const card = cards[i];

        // 中央にあるカードを大きくし、他は元のサイズにする
        const scale = (i === index) ? 1.2 : 1; // 中央のカードを大きく表示
        card.scale.set(scale, scale, scale);

        // 中央に来たカードを前に移動
        const zOffset = (i === index) ? -5 : 0;
        card.position.set(x, 0, z + zOffset);

        // カードが常にカメラの方向を向くようにする
        card.lookAt(camera.position);

        // カード名のテキストも同様に更新
        const text = cardNames[i];
        text.position.set(x, 5, z + zOffset);
        text.lookAt(camera.position);
        text.scale.set(scale, scale, scale); // テキストも大きく表示
    }
}

// 初期の中央カードをセット
let currentIndex = 0;
updateCardPositions(currentIndex);

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
