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
const y = 0;
camera.position.set(0, y, 11);

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
directionalLight.position.set(0, 7, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -7;
plane.receiveShadow = true;
scene.add(plane);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

let mixer;

loader.load('https://s3.ap-northeast-3.amazonaws.com/testunity1.0/webar/light.gltf', function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.07, 0.07, 0.07);
    
    // モデルの位置を調整
    gltf.scene.position.y = -5; // Y軸（上下位置）を調整。モデルを下に移動させる
    gltf.scene.position.z = 1; // Z軸（前後位置）を調整。必要に応じて前後に移動

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
const radius = 6;
const videoTextures = [];
const cardWidth = 3.2;
const cardHeight = 1.8;
const cardcamera = y/1.5;
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

// カメラの制限を設定/解除するためのフラグ
let isCameraLocked = true;

// カメラの垂直回転を制限する
function lockCameraRotation() {
    controls.minPolarAngle = Math.PI / 2; // 水平面のみ
    controls.maxPolarAngle = Math.PI / 2; // 水平面のみ
    isCameraLocked = true;
}

// カメラの垂直回転の制限を解除する
function unlockCameraRotation() {
    controls.minPolarAngle = 0; // 制限なし
    controls.maxPolarAngle = Math.PI; // 制限なし
    isCameraLocked = false;
}

// モデルがカメラを見続けるようにする
function ensureModelFacesCamera() {
    scene.traverse(function (node) {
        if (node.isMesh) {
            node.lookAt(camera.position);
        }
    });
}

// 機能の有効/無効を切り替えるボタンの追加
document.getElementById('lockCameraButton').addEventListener('click', function() {
    if (isCameraLocked) {
        unlockCameraRotation();
        this.textContent = 'カメラの回転制限を解除';
    } else {
        lockCameraRotation();
        this.textContent = 'カメラの回転を水平平面に限定';
    }
});

// レンダリングループ
function animate() {
    ensureModelFacesCamera(); // モデルがカメラを向くように更新
    controls.update(); // 必要に応じてコントロールを更新
    renderer.render(scene, camera);
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

// 初期状態でカメラの回転を制限
lockCameraRotation();

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

function findClosestCardInFrontOfCamera() {
    let closestIndex = -1;
    let closestAngle = Math.PI; // 最も近い角度を格納する変数を初期化（180度で初期化）

    // カメラの正面にあるカードを探索
    cards.forEach((card, index) => {
        // カメラの位置からカードの位置へのベクトルを計算
        const directionToCard = new THREE.Vector3().subVectors(card.position, camera.position).normalize();
        // カメラの視線ベクトルを取得
        const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        // ベクトル間の角度を計算（ドット積から）
        const angle = Math.acos(cameraDirection.dot(directionToCard));

        // これまでで最も小さい角度よりも小さければ、そのインデックスと角度を更新
        if (angle < closestAngle && angle < Math.PI / 2) { // 反対側ではなく、正面のカードだけを考慮
            closestAngle = angle;
            closestIndex = index;
        }
    });

    return closestIndex; // 最も近いカードのインデックスを返す
}

// 一番手前のカードの動画を再生するイベントリスナー
document.getElementById('playCenterVideo').addEventListener('click', function() {
    // カメラの中心に最も近いカードを特定する
    let closestCardIndex = findClosestCardInFrontOfCamera();
    // 最も近いカードに関連付けられたビデオエレメントを取得
    const closestVideoElement = cards[closestCardIndex].userData.videoElement;

    // ビデオの再生状態をチェックして、適切に制御
    if (closestVideoElement.paused) {
        closestVideoElement.play();
    } else {
        closestVideoElement.pause();
    }
});


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

// ハンバーガーメニューをクリックしたときのイベント
document.querySelector('.hamburger-menu').addEventListener('click', function() {
    document.getElementById('menuContent').style.display = document.getElementById('menuContent').style.display === 'block' ? 'none' : 'block';
  });
  
  // 情報の一覧を配列で
  const infoArray = ["情報1", "情報2", "情報3", "情報4"];
  
  // 情報の一覧をリストに追加する関数
  function populateInfoList() {
    const list = document.getElementById('infoList');
    infoArray.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      list.appendChild(listItem);
    });
  }
  
  // ドキュメントが読み込まれた後に情報リストを追加
  document.addEventListener('DOMContentLoaded', populateInfoList);