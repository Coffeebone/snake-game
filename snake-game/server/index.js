// server/index.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// 환경 변수 로드
require('dotenv').config();

// User 모델 정의
const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  highScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
  } catch (err) {
    console.error('MongoDB 연결 실패:', err.message);
    process.exit(1);
  }
};

connectDB();

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions' 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30일
  }
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// Passport Google 전략 설정
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 기존 사용자 확인
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // 새 사용자 생성
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value
      });
      
      await user.save();
      done(null, user);
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  }
));

// 사용자 직렬화/역직렬화
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 인증 확인 미들웨어
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({ error: '로그인이 필요합니다' });
};

// 라우트 설정

// Google OAuth 라우트
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// 사용자 인증 상태 확인
app.get('/api/current_user', (req, res) => {
  res.send(req.user || null);
});

// 로그아웃
app.get('/api/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// 점수 저장 API
app.post('/api/scores', ensureAuth, async (req, res) => {
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

// 리더보드 API
app.get('/api/leaderboard', async (req, res) => {
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

// 정적 파일 제공 (프론트엔드)
app.use(express.static(path.join(__dirname, '../public')));

// SPA를 위한 폴백 라우트 - 모든 미처리 요청을 index.html로 전달
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});