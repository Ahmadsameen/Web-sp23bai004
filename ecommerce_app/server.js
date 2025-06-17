const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');

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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));