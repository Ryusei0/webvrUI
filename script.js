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
// グローバル変数の宣言部分
let currentAudio = null;
let currentVideoElement = null; // 動画要素を追跡するために追加
let isPlaying = false;
let currentIndex = 0; // 現在のカードのインデックスを追跡
let cards = []; // Use let if you plan to reassign cards
// 現在のリストが元のリストかどうかを追跡
let isOriginalList = true;



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

const radius = 6;
const videoTextures = [];
const cardWidth = 3.2;
const cardHeight = 1.8;
const cardcamera = y/1.5;
let cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
const videoElements = [];

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

// 動画リストの準備
const videos = [
    { category: "大学について",title:"list1", name: "ビデオ1", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/1.mp4" },
    { category: "大学について", title:"list1",name: "ビデオ2", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/2.mp4" },
    { category: "学校生活", title:"list2",name: "ビデオ0", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/0.mp4" },
    { category: "学校生活", title:"list2",name: "ビデオ3", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/3.mp4" },
    // 他の動画をここに追加
];


// 複数のリストを保持する配列
const allLists = [
    {
        id: "list1",
        videos: [
            {planeid:1,category
                :"当サイトについて",url
                :"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/Artificial+intelligence+to+Enhance+Language+Skills+Presentation+in+Blue+and+Purple+3D+Modern+Style+(2).mp4",text:"当サイトは、次世代の会話型ウェブサイトです。従来のサイトと違い、あなたが情報を探したり、欲しかった情報が見つけられずに、再検索したりする必要はありません。圧倒的に詳しく、そして分かりやすく、あなたの欲しい情報を届けます。",mp3:"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/audios/%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88_20240215_085026_858dab12be6142398953cfd2297c9480.mp3",time:17},
                {planeid:1,category
                :"こんな経験ありますか",url
                :"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/Artificial+intelligence+to+Enhance+Language+Skills+Presentation+in+Blue+and+Purple+3D+Modern+Style+(1).mp4",text:"私たちの強みは、圧倒的に賢いことです。情報量の制限はなく、あなたと1対1のコミュニケーションを実現します。何か知りたいことがあれば、下のテキストボックスから質問してくださいね。",mp3:"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/audios/%E5%B0%8E%E5%85%A5%EF%BC%92_20240216_032001_465ed5af894146c09e7c40d5b9f48f81.mp3",time:12},
         {planeid:1,category
                :"webサイトの限界",url
                :"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/Artificial+intelligence+to+Enhance+Language+Skills+Presentation+in+Blue+and+Purple+3D+Modern+Style+(2).mp4",text:"当サイトは、次世代の会話型ウェブサイトです。従来のサイトと違い、あなたが情報を探したり、欲しかった情報が見つけられずに、再検索したりする必要はありません。圧倒的に詳しく、そして分かりやすく、あなたの欲しい情報を届けます。",mp3:"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/audios/%E3%83%98%E3%82%9A%E3%82%A4%E3%83%B3_20240216_032031_b3ab9655d6464c5d84b285e16366779d.mp3",time:17},
                {planeid:1,category
                :"こんな経験なくしましょう",url
                :"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/Artificial+intelligence+to+Enhance+Language+Skills+Presentation+in+Blue+and+Purple+3D+Modern+Style+(1).mp4",text:"私たちの強みは、圧倒的に賢いことです。情報量の制限はなく、あなたと1対1のコミュニケーションを実現します。何か知りたいことがあれば、下のテキストボックスから質問してくださいね。",mp3:"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/audios/%E8%A7%A3%E6%B1%BA%E3%81%B8_20240216_032100_0901556cc47146f2b45982d016f93958.mp3",time:12},
        {planeid:1,category
                :"私たちの強み",url
                :"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/Artificial+intelligence+to+Enhance+Language+Skills+Presentation+in+Blue+and+Purple+3D+Modern+Style+(1).mp4",text:"私たちの強みは、圧倒的に賢いことです。情報量の制限はなく、あなたと1対1のコミュニケーションを実現します。何か知りたいことがあれば、下のテキストボックスから質問してくださいね。",mp3:"https://s3.ap-northeast-3.amazonaws.com/testunity1.0/audios/%E7%89%B9%E5%BE%B4_20240216_032128_fbadab376de74be0bf32af0c4915ef87.mp3",time:12},
        ]
    },
    {
        id: "list2",
        videos: [
    { id:"1",category:"大学について",name: "ビデオ1", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/1.mp4" },
    {  id:"1",category:"大学について",name: "ビデオ2", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/2.mp4" },
    {  id:"1",category:"学校生活",name: "ビデオ0", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/0.mp4" },
    {  id:"1",category:"学校生活",name: "ビデオ3", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/3.mp4" },
    // 他の動画をここに追加
]
    },
    // 他のリストをここに追加...
];

// alternateVideosの初期化
let alternateVideos = [];


function init() {
    regenerateCards(videos); // アプリケーション起動時に元のリストに基づいてカードを生成
    updateCardPositions(); // カードの位置を更新
    // その他の初期化処理...
}

function findClosestCardInFrontOfCamera() {
    let closestIndex = -1;
    let closestDistance = Infinity; // 最も近い距離を初期化

    // カメラから各カードへの距離を計算し、最も近いものを見つける
    cards.forEach((card, index) => {
        const distance = camera.position.distanceTo(card.position); // カメラからカードへの距離

        if (distance < closestDistance) {
            closestDistance = distance; // 最も近い距離を更新
            closestIndex = index; // 最も近いカードのインデックスを更新
        }
    });
    return closestIndex; // 最も近いカードのインデックスを返す
}

function playCenterMedia(index) {
    const playButton = document.getElementById('playCenterVideo');
    const activeList = isOriginalList ? videos : alternateVideos; // 現在のアクティブリストを取得

    currentIndex = index !== undefined ? index : findClosestCardInFrontOfCamera(); // 引数が与えられた場合はそれを使用

    const mediaInfo = activeList[currentIndex]; // 現在のメディア情報を取得
    const card = cards[currentIndex]; // 現在のカードを取得
    currentVideoElement = card.userData.videoElement; // ビデオ要素を取得

    // 再生中のメディアをクリア
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    if (currentVideoElement && mediaInfo.url.endsWith('.mp4')) {
        currentVideoElement.play();
        isPlaying = true; // 再生状態を更新
        if (playButton.textContent !== '停止') {
            playButton.textContent = '停止'; // ユーザーが操作した場合のみラベルを更新
        }
    }

    if (mediaInfo.mp3) {
        currentAudio = new Audio(mediaInfo.mp3);
        currentAudio.play();
        isPlaying = true; // 再生状態を更新
        if (playButton.textContent !== '停止') {
            playButton.textContent = '停止'; // ユーザーが操作した場合のみラベルを更新
        }

        currentAudio.onended = () => {
            if (isPlaying) { // 自動再生で次のメディアに進む場合
                let nextIndex = (currentIndex + 1) % activeList.length;
                playCenterMedia(nextIndex); // 直接次のインデックスを指定して再生
            }
        };
    }
}

// ユーザー操作によるメディアの停止
function stopMedia(userAction = false) {
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    isPlaying = false; // 再生状態を更新
    if (userAction) { // ユーザーが明示的に操作した場合のみラベルを変更
        document.getElementById('playCenterVideo').textContent = '再生';
    }
}

// イベントリスナーの設定
document.getElementById('playCenterVideo').addEventListener('click', () => {
    if (isPlaying) {
        stopMedia(true); // ユーザーが停止を要求
    } else {
        let index = findClosestCardInFrontOfCamera();
        playCenterMedia(index); // ユーザーが再生を要求
    }
});


// カテゴリラベルを更新する関数
function updateCategoryLabel() {
    const closestCardIndex = findClosestCardInFrontOfCamera();
    const categoryLabel = document.getElementById('videoListContainer');
    const activeList = isOriginalList ? videos : alternateVideos; // 現在アクティブなリストを選択

    if (closestCardIndex !== -1) {
        const closestCard = activeList[closestCardIndex]; // アクティブなリストからカードを選択
        categoryLabel.textContent = `${closestCard.category}`;
    } else {
        categoryLabel.textContent = 'カテゴリーが見つかりません';
    }
}

//ビデオプレーンの切り替え

function regenerateCards(videos) {
    // 既存のカードをシーンから削除
    cards.forEach(card => {
        scene.remove(card);
        if (card.material.map) card.material.map.dispose();
        card.material.dispose();
        card.geometry.dispose();
    });
    cards.length = 0; // カード配列をリセット
    videoTextures.forEach(texture => texture.dispose());
    videoTextures.length = 0; // ビデオテクスチャ配列をクリア

    videos.forEach((video, index) => {
        const videoElement = document.createElement('video');
        videoElement.src = video.url;
        videoElement.crossOrigin = "anonymous";
        videoElement.preload = 'auto';
        videoElement.load();

        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTextures.push(videoTexture);

        const cardMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
    
        card.userData = { videoElement: videoElement, index: index }; // ユーザーデータにビデオ要素とインデックスを保存

        scene.add(card); // シーンにカードを追加
        cards.push(card); // カード配列にカードを追加
    });

    currentIndex = 0; // 最初のカードを中心に設定
    updateCardPositions(); // カードの位置を更新
}

// カードの位置を更新する関数
function updateCardPositions() {
    if (cards.length == 0) return; // カードがなければ何もしない

    // カード間の角度を計算
    const cardOffset = 2 * Math.PI / cards.length;

    // 中心に来るカードの角度を設定
    let firstCardAngle = cardOffset * currentIndex;

    // 各カードの位置を計算して更新
    cards.forEach((card, index) => {
        // カードの配置角度を計算
        const angle = firstCardAngle + cardOffset * index;
        const x = radius * Math.sin(angle); // 円周上のX座標
        const z = radius * Math.cos(angle); // 円周上のZ座標

        // カードを新しい位置に配置
        card.position.set(x, 0, z);
        card.lookAt(new THREE.Vector3(0, 0, 0)); // カードが原点（カメラの位置）を向くようにする

        // 最初のカードをカメラの前に配置
        if (index === currentIndex) {
            card.position.set(0, 0, radius);
        }
    });
}

// カメラに最も近いカードのtitle属性を基にalternateVideosを更新する関数
function updateAlternateVideosBasedOnClosestCard() {
    // カメラに最も近いカードのインデックスを取得
    const closestCardIndex = findClosestCardInFrontOfCamera();
    
    // カメラに最も近いカードのtitle属性（リストID）を取得
    const closestCardTitle = videos[closestCardIndex].title;
    
    alternateVideos = [];

    // targetIdに一致するリストを探す
    const targetList = allLists.find(list => list.id === closestCardTitle);

    // 該当するリストが見つかった場合、そのvideosをalternateVideosに設定
    if (closestCardTitle) {
        alternateVideos = targetList.videos;
    }
}

// リスト切り替えボタンのイベントハンドラ
document.getElementById('changeListButton').addEventListener('click', () => {
    // リストの状態を切り替える
    isOriginalList = !isOriginalList;

    updateAlternateVideosBasedOnClosestCard();
    // 新しいリストでカードを再生成
    const newVideos = isOriginalList ? videos : alternateVideos;
    regenerateCards(newVideos);
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
    updateCategoryLabel(); // カテゴリラベルを更新
    requestAnimationFrame(animate);
    findClosestCardInFrontOfCamera()
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


// フォントのロード
const fontLoader = new FontLoader();
fontLoader.load(function () { // 日本語対応フォントのパス
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
    });

    updateCardPositions(0); // 初期位置の更新
});

// レンダリングループ
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

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

  // ページの読み込みが完了したらinit関数を呼び出し
window.addEventListener('load', init);

// モーダルの表示・非表示の制御
document.getElementById('showModalButton').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'block';
    populateModalContent();
});

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('myModal')) {
        document.getElementById('myModal').style.display = 'none';
    }
});

// モーダルに文字と画像を追加する関数
function populateModalContent() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = ''; // コンテンツをクリア

    // 文字の追加
    const textContent = document.createElement('p');
    textContent.textContent = 'ここにモーダルのテキストが表示されます。';
    modalBody.appendChild(textContent);

    // 画像の追加
    const image = document.createElement('img');
    image.src = 'https://s3.ap-northeast-3.amazonaws.com/testunity1.0/image/_20%E9%80%A3%E7%99%BA_%E5%AD%A6%E6%A0%A1%E7%94%9F%E6%B4%BB%E3%81%A6%E3%82%99%E7%88%AA%E7%97%95%E6%AE%8B%E3%81%99%E5%8B%87%E8%80%85%E3%81%9F%E3%81%A1%E3%81%8B%E3%82%99%E3%83%A4%E3%83%8F%E3%82%99%E3%81%99%E3%81%8D%E3%82%99%E3%82%8Bwwwwwwwwww_TikTok_.jpg';
    image.alt = '画像の説明';
    image.style.width = '50%'; // 画像のサイズ調整
    image.style.left = '25%';
    modalBody.appendChild(image);
}
