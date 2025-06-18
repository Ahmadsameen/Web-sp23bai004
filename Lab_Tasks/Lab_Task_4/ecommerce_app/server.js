const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const User = require('./models/User'); 
const { body, validationResult } = require('express-validator');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
mongoose.connect('mongodb://localhost/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


app.get('/', (req, res) => {
    res.render('index', { title: 'Home', user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array()[0].msg);
    }
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.redirect('/login?success=1');
    } catch (err) {
        if (err.code === 11000) {
            res.redirect('/register?error=duplicate');
        } else {
            console.log(err);
            res.status(500).send('Error registering user: ' + err.message);
        }
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, email: user.email };
            res.redirect('/');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error logging in: ' + err.message);
    }
});

app.get('/profile', (req, res) => {
    if (!req.session.user) { 
        return res.redirect('/login'); 
    }
    res.render('profile', { title: 'Profile', user: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));