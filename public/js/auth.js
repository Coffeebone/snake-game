// public/js/auth.js
let currentUser = null;

async function checkLoginStatus() {
  try {
    const response = await fetch('/api/current_user', {
      credentials: 'include'
    });
    
    if (response.ok) {
      currentUser = await response.json();
      updateUI();
    }
  } catch (error) {
    console.error('로그인 상태 확인 실패:', error);
  }
}

function updateUI() {
  const authContainer = document.getElementById('auth-container');
  
  if (currentUser) {
    authContainer.innerHTML = `
      <div class="user-info">
        <img src="${currentUser.profilePicture}" alt="프로필" class="profile-pic">
        <span>${currentUser.displayName}</span>
        <a href="/api/logout" class="logout-btn">로그아웃</a>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="/auth/google" class="google-login-btn">
        <img src="https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png" alt="구글 로그인">
      </a>
    `;
  }
}

// 페이지 로드 시 로그인 상태 확인
window.addEventListener('DOMContentLoaded', checkLoginStatus);