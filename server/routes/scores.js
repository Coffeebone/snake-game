// server/routes/scores.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 인증 미들웨어
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({ error: '로그인이 필요합니다' });
};

// 점수 저장
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { score } = req.body;
    
    if (!score || typeof score !== 'number') {
      return res.status(400).send({ error: '유효한 점수를 제공해주세요' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
    }
    
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: '점수 저장 중 오류 발생' });
  }
});

// 리더보드 가져오기
router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await User.find()
      .sort({ highScore: -1 })
      .limit(10)
      .select('displayName highScore profilePicture');
      
    res.send(topScores);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: '리더보드 조회 중 오류 발생' });
  }
});

module.exports = router;