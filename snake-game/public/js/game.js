// public/js/game.js
// 기존 게임 로직...

// 게임 오버 함수 수정
function gameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
    
    // 로그인된 경우에만 점수 저장
    if (currentUser) {
      saveScore(score);
    }
  }
  
  // 점수 저장 함수 추가
  async function saveScore(score) {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score }),
        credentials: 'include'
      });
      
      if (response.ok) {
        // 저장 성공 후 리더보드 갱신
        loadLeaderboard();
      }
    } catch (error) {
      console.error('점수 저장 실패:', error);
    }
  }
  
  // 기존 게임 로직...