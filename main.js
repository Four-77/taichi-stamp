// Placeholder for main.js
// 替换为你自己的 Firebase 配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const stampCount = 7;
const staffPassword = "123456"; // 店员密码，可自定义

let currentUser = null;
let currentStamps = 0;

// 注册账号
function register() {
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pwd)
    .then(() => alert("注册成功！请登录。"))
    .catch(err => alert(err.message));
}

// 登录账号
function login() {
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pwd)
    .then(() => console.log("登录成功"))
    .catch(err => alert(err.message));
}

// Google 登录
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => console.log("Google 登录成功"))
    .catch(err => alert(err.message));
}

// 登出
function logout() {
  auth.signOut();
  document.getElementById("main-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
}

// 实时监听登录状态
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("user-email").innerText = user.email;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
    loadStamps();
  }
});

// 加载当前用户的拼图状态
function loadStamps() {
  db.collection("users").doc(currentUser.uid).get().then(doc => {
    currentStamps = doc.exists ? doc.data().stamps || 0 : 0;
    updateStampGrid();
  });
}

// 更新拼图 UI
function updateStampGrid() {
  const grid = document.getElementById("stampGrid");
  grid.innerHTML = "";
  for (let i = 1; i <= stampCount; i++) {
    const piece = document.createElement("div");
    piece.classList.add("stamp");
    if (i <= currentStamps) {
      piece.classList.add("stamped");
      piece.style.backgroundImage = `url("puzzle${i}.png")`;
    } else {
      piece.style.backgroundImage = `url("placeholder.png")`;
    }
    grid.appendChild(piece);
  }

  const msg = document.getElementById("rewardMsg");
  msg.innerText = currentStamps >= stampCount ? "恭喜你集满拼图！请兑换奖品" : "";
}

// 盖章逻辑（需要店员认证）
function addStamp() {
  const pwd = document.getElementById("staffPwd").value;
  if (pwd !== staffPassword) {
    alert("店员密码错误！");
    return;
  }

  if (currentStamps < stampCount) {
    currentStamps++;
    db.collection("users").doc(currentUser.uid).set({ stamps: currentStamps });
    updateStampGrid();
  } else {
    alert("你已集满拼图！");
  }
}
