// public/js/leaderboard.js
async function loadLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const leaderboard = await response.json();
      
      const leaderboardElement = document.getElementById('leaderboard');
      leaderboardElement.innerHTML = `
        <h2>최고 점수 순위</h2>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>플레이어</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.map((player, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <img src="${player.profilePicture}" alt="${player.displayName}" class="leaderboard-pic">
                  ${player.displayName}
                </td>
                <td>${player.highScore}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error('리더보드 로딩 실패:', error);
    }
  }
  
  // 페이지 로드 시 및 게임 종료 시 리더보드 업데이트
  window.addEventListener('DOMContentLoaded', loadLeaderboard);