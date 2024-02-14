import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

document.getElementById('sendButton').addEventListener('click', sendInput);
document.getElementById('toggleResponse').addEventListener('click', toggleResponse);

function resetViewport() {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.name = "viewport";
        document.getElementsByTagName("head")[0].appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const y = 5;
camera.position.set(0, y, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 0.5;
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(0, 4, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

let mixer;

loader.load('https://s3.ap-northeast-3.amazonaws.com/testunity1.0/webar/light.gltf', function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.04, 0.04, 0.04);
    gltf.scene.traverse(function (node) {
        if (node.isMesh) { node.castShadow = true; }
    });
    mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations.length) {
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    }
}, undefined, function (error) {
    console.error(error);
});

const clock = new THREE.Clock();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    console.log('ウィンドウがリサイズされました'); // デバッグログ
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    // カメラのアスペクト比を更新
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    // レンダラーのサイズを更新
    renderer.setSize(width, height);

    // カードの位置を更新
    updateCardPositions(currentIndex);
}


const videos = [
    { name: "ビデオ1", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/1.mp4" },
    { name: "ビデオ2", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/2.mp4" },
    { name: "ビデオ0", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/0.mp4" },
    { name: "ビデオ3", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/3.mp4" },
    // 他の動画をここに追加
];

const cards = [];
let currentIndex = 0;
const radius = 3;
const videoTextures = [];
const cardWidth = 3.2;
const cardHeight = 1.8;
const cardcamera = y/3;
let cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
const videoElements = [];
const textMeshes = [];

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
    card.position.set(x, cardcamera, z);
    card.lookAt(camera.position);

    // クリックイベントの追加
    card.userData = { videoElement: videoElement, index: index };

    scene.add(card);
    cards.push(card);
});

// レンダリングループ
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    // ビデオテクスチャを更新
    videoTextures.forEach((texture) => {
        if (texture.image.readyState === HTMLVideoElement.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;
        }
    });
    // カードがカメラを向くように更新
    cards.forEach((card) => {
        card.lookAt(camera.position);
    });

    renderer.render(scene, camera);
}

// カードの位置とサイズを更新する関数
function updateCardPositions(index) {
    // 中央のカードを特定するために、現在のカメラの中心に最も近いカードを見つける
    let closestCardIndex = findClosestCardToCameraCenter();
    const cardOffset = 2 * Math.PI / videos.length; // カード間の角度
    cards.forEach((card, i) => {
        const angle = cardOffset * (i - index) + Math.PI / 2; // indexを中心に配置
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        card.position.set(x, 0, z);
        card.lookAt(camera.position);

         // カードが中央にある場合は、スケールを大きくして強調表示
        const scale = (i === closestCardIndex) ? 1.5 : 1; // 中央のカードを大きく表示
        card.scale.set(scale, scale, scale);

        // userDataにカードの現在のインデックスを保存
        card.userData.index = i;
    });

    // テキストメッシュの位置を更新（必要に応じて）
    textMeshes.forEach((textMesh, i) => {
        // 中央のカードに関連するテキストメッシュの位置やサイズを調整
        const scale = (i === closestCardIndex) ? 1.5 : 1;
        textMesh.scale.set(scale, scale, scale); // テキストのスケールも調整
    });
}

// フォントのロード
const fontLoader = new FontLoader();
fontLoader.load('path/to/japanese/font_regular.typeface.json', function (font) { // 日本語対応フォントのパス
    videos.forEach((video, index) => {
        const videoElement = document.createElement('video');
        videoElement.src = video.url;
        videoElement.crossOrigin = 'anonymous';
        videoElement.preload = 'auto';
        videoElement.load();
        videoElements.push(videoElement);

        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTextures.push(videoTexture);

        const cardMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        const theta = (index / videos.length) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        card.position.set(x, 0, z);
        card.lookAt(camera.position);
        card.userData = { videoElement: videoElement };
        scene.add(card);
        cards.push(card);

        // テキストメッシュの作成
        const textGeometry = new TextGeometry(video.name, {
            font: font,
            size: 0.5,
            height: 0.02,
            curveSegments: 12,
            bevelEnabled: false
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, 5, z); // テキストの位置を適切に設定
        textMesh.lookAt(camera.position);
        scene.add(textMesh);
        textMeshes[index] = textMesh;
    });

    updateCardPositions(0); // 初期位置の更新
});

// レンダリングループ
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

document.getElementById('playCenterVideo').addEventListener('click', function() {
    // カメラの中央に最も近いカードを特定するロジック
    let closestCardIndex = findClosestCardToCameraCenter();
    // 中央のカードに関連付けられたビデオエレメントを取得
    const centerVideoElement = cards[closestCardIndex].userData.videoElement;

    // ビデオの再生状態をチェックして、適切に制御
    if (centerVideoElement.paused) {
        centerVideoElement.play();
    } else {
        centerVideoElement.pause();
    }
});

function findClosestCardToCameraCenter() {
    let closestIndex = 0;
    let closestDistance = Infinity;

    // カメラの中央に最も近いカードを探索
    cards.forEach((card, index) => {
        // カメラからカードまでの距離を計算
        const pos = card.position.clone().project(camera);
        const distance = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2)); // カメラの視点からの距離を2D平面で計算

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex; // 中央に最も近いカードのインデックスを返す
}


// ウィンドウのサイズに応じてアスペクト比を更新し、カメラとレンダラーのサイズを調整する関数
function updateSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    // カメラのアスペクト比を更新
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    // レンダラーのサイズを更新
    renderer.setSize(width, height);
}

// ウィンドウリサイズイベントのハンドラー
window.addEventListener('resize', () => {
    updateSize();
    updateCardPositions(currentIndex); // カードの位置も更新
});

// 初期サイズの設定
updateSize();

// カードのサイズをウィンドウサイズに応じて調整する関数
function resizeCards() {
    const maxCardWidth = window.innerWidth * 0.9; // 画面の横幅の90%
    const maxCardHeight = window.innerHeight * 0.9; // 画面の縦幅の90%
    const cardAspectRatio = 16 / 9;
    let cardWidth = cardAspectRatio * maxCardHeight;
    let cardHeight = maxCardHeight;

    if (cardWidth > maxCardWidth) {
        // カードの幅が最大幅を超える場合、幅を基準にサイズを調整する
        cardWidth = maxCardWidth;
        cardHeight = cardWidth / cardAspectRatio;
    }

    // カードのジオメトリを更新
    cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);

    // すべてのカードのメッシュを更新
    cards.forEach((card, index) => {
        card.geometry.dispose(); // 古いジオメトリを削除
        card.geometry = cardGeometry; // 新しいジオメトリを設定
    });

    updateCardPositions(currentIndex); // カードの位置を更新
}

// ウィンドウのリサイズイベントでカードのリサイズ関数を呼び出す
window.addEventListener('resize', resizeCards);


// アニメーションループの開始
animate();

function sendInput() {
    var userInput = document.getElementById('userInput').value;
    var responseContainer = document.getElementById('responseContainer');

    // 送信直後にテキストボックスをクリア
    document.getElementById('userInput').value = '';

    fetch('https://webchat-yghl.onrender.com/submit-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({input_text: userInput})
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        responseContainer.textContent = '応答: ' + data.response; // 応答をページに表示
    })
    .catch((error) => {
        console.error('Error:', error);
        responseContainer.textContent = 'エラーが発生しました。';  // エラーをページに表示
    })
    .finally(() => {
        // フォーカスを外して画面のズームをリセットする
        document.getElementById('userInput').blur();

        // 必要に応じてビューポートをリセットする
        resetViewport();
    });
}

function toggleResponse() {
    var responseContainer = document.getElementById('responseContainer');
    var toggleButton = document.getElementById('toggleResponse');
    if (responseContainer.style.display === 'none') {
     responseContainer.style.display = 'block';
     toggleButton.textContent = '返答を隠す';
    } else {
     responseContainer.style.display = 'none';
     toggleButton.textContent = '返答を表示';
    }
 }