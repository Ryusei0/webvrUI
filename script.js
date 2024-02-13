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

const videos = [
    { name: "ビデオ1", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/1.mp4" },
    { name: "ビデオ2", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/2.mp4" },
    { name: "ビデオ0", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/0.mp4" },
    { name: "ビデオ3", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/3.mp4" },
    // 他の動画をここに追加
];

// カードと動画テクスチャを格納する配列
const cards = [];
let currentIndex = 0;
const radius = 30; 
const videoTextures = [];
const cardGeometry = new THREE.PlaneGeometry(5, 8);

const videoElements = []; // ビデオ要素を格納する配列を追加
const textMeshes = []; // テキストメッシュを格納する配列を追加

// 各ビデオに対してカードを作成
videos.forEach((video, index) => {
    const videoElement = document.createElement('video');
    videoElement.src = video.url;
    videoElement.crossOrigin = "anonymous";
    videoElement.preload = 'auto'; // ビデオのプリロードを設定
    videoElement.load(); // ビデオをプリロードするための呼び出し

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTextures.push(videoTexture);

    const cardMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);

    // カードを円形に配置
    const theta = (index / videos.length) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    card.position.set(x, 0, z);
    card.lookAt(camera.position);

    // クリックイベントの追加
    card.userData = { videoElement: videoElement, index: index };

    scene.add(card);
    cards.push(card);
});

// レンダリングループ
function animate() {
    requestAnimationFrame(animate);
    
    // ビデオテクスチャを更新
    videoTextures.forEach((texture) => {
        if (texture.image.readyState === HTMLVideoElement.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;
        }
    });

    renderer.render(scene, camera);
}

animate();

// カードの位置とサイズを更新する関数
function updateCardPositions(index) {
    const cardOffset = 2 * Math.PI / videos.length; // カード間の角度
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

    // テキストメッシュの位置を更新
    textMeshes.forEach((textMesh, i) => {
        const angle = (2 * Math.PI / videos.length) * (i - index) + Math.PI / 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        textMesh.position.set(x, cards[i].geometry.parameters.height / 2 + 0.5, z); // テキストの高さを適切に調整
        textMesh.lookAt(camera.position);
    });
}

// フォントを読み込み、テキストジオメトリを作成
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    videos.forEach((video, index) => {
        // ビデオテクスチャを作成
        const videoElement = document.createElement('video');
        videoElement.src = video.url;
        videoElement.crossOrigin = 'anonymous';
        videoElement.load();
        videoElements.push(videoElement);

        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTextures.push(videoTexture);

        const cardMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);

        // カードを円形に配置
        const theta = (index / videos.length) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        card.position.set(x, 0, z);
        card.lookAt(camera.position);
        scene.add(card);
        cards.push(card);

        // ビデオ名のテキストメッシュを作成
        const textGeometry = new TextGeometry(video.name, {
            font: font,
            size: 0.5,
            height: 0.02,
            curveSegments: 12,
            bevelEnabled: false
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, 5, z); // テキストの高さを適切に調整
        textMesh.lookAt(camera.position);
        scene.add(textMesh);
        textMeshes[index] = textMesh; // textMeshes 配列にテキストメッシュを追加
    });

    // 初期のカード位置を更新
    updateCardPositions(0);
});


// ボタンイベントハンドラー
document.getElementById('slideLeft').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % videos.length;
    updateCardPositions(currentIndex);
});
document.getElementById('slideRight').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + videos.length) % videos.length;
    updateCardPositions(currentIndex);
});

// レンダリング関数
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

// レイキャスターとマウスベクトルの設定
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // クリックされたオブジェクトを取得
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards);

    if (intersects.length > 0) {
        const intersectedCard = intersects[0].object;
        const videoElement = intersectedCard.userData.videoElement;
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }
}

window.addEventListener('click', onMouseClick, false);

// アニメーションループの開始
animate();