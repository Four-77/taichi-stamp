
// Firebase 引入（记得替换为你的 config）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase 配置（替换为你的）
const firebaseConfig = {
  apiKey: "AIzaSyAuJ-Aum81PCEyoWvA9qjJGTPEdgtbBiVc",
  authDomain: "tachi-stamp.firebaseapp.com",
  projectId: "tachi-stamp",
  storageBucket: "tachi-stamp.firebasestorage.app",
  messagingSenderId: "75815616456",
  appId: "1:75815616456:web:01f2158c5ecbb01e5e4afd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentStamps = 0;

// 登录 & 注册
window.login = async () => {
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
  currentUser = userCredential.user;
  initUserData();
};

window.signup = async () => {
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
  currentUser = userCredential.user;
  await setDoc(doc(db, "users", currentUser.uid), { stamps: 0 });
  initUserData();
};

window.logout = async () => {
  await signOut(auth);
  location.reload();
};

// 初始化用户数据
async function initUserData() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("main-section").style.display = "block";
  document.getElementById("userEmail").innerText = currentUser.email;

  const userRef = doc(db, "users", currentUser.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    currentStamps = docSnap.data().stamps || 0;
  } else {
    currentStamps = 0;
    await setDoc(userRef, { stamps: 0 });
  }

  document.getElementById("stampCount").innerText = currentStamps;
  updatePuzzleDisplay(currentStamps);
}

// 拼图显示逻辑
function updatePuzzleDisplay(stampCount) {
  const container = document.getElementById("puzzleContainer");
  container.innerHTML = "";

  for (let i = 1; i <= 7; i++) {
    const img = document.createElement("img");
    img.src = stampCount >= i ? `images/puzzle-${i}.jpg` : `images/puzzle-placeholder.jpg`;
    img.classList.add("puzzle-piece");
    container.appendChild(img);
  }

  if (stampCount >= 7) {
    alert("恭喜你集齐拼图！请向店员兑换奖励！");
  }
}

// 盖章
window.addStamp = async () => {
  const pwd = document.getElementById("staffPwd").value;
  if (pwd !== "1234") {
    alert("店员密码错误");
    return;
  }

  if (currentStamps >= 7) {
    alert("已集满7章！");
    return;
  }

  currentStamps += 1;
  await updateDoc(doc(db, "users", currentUser.uid), { stamps: currentStamps });
  document.getElementById("stampCount").innerText = currentStamps;
  updatePuzzleDisplay(currentStamps);
};

// 监听登录状态
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    initUserData();
  }
});

  // 清空盖章记录
  db.collection("users").doc(currentUser.uid).set({ stamps: 0 });
  currentStamps = 0;
  updateStampGrid();
  alert("已兑换成功！拼图已重置。");
}
