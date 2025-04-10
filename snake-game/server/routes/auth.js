// server/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google 인증 라우트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 콜백 라우트
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// 현재 사용자 정보 가져오기
router.get('/current_user', (req, res) => {
  res.send(req.user || null);
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send({ error: '로그아웃 중 오류 발생' });
    }
    res.redirect('/');
  });
});

module.exports = router;