import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const users = [];

passport.use(
    new LocalStrategy(function (username, password, done) {
        const user = users.find(u => u.username === username);
        if (!user) return done(null, false);
        if (!bcrypt.compareSync(password, user.password)) return done(null, false);
        return done(null, user); // ✅ Success
    })
);

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
    const user = users.find(u => u.username === username);
    done(null, user);
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashed });
    console.log("User registered:", username); // Debug
    res.json({ message: 'User registered' });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ username: user.username }, 'jwt_secret', { expiresIn: '1h' });
        return res.json({ token });
    })(req, res, next);
});


function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/profile', verifyToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}` });
});

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
});
