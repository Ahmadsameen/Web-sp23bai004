const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const User = require('./models/User'); 
const { body, validationResult } = require('express-validator');
const Product = require('./models/product'); 
const Order = require('./models/order');

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

const isAdmin = async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send('Access denied. Admin only.');
    }
    next();
};

(async () => {
    const adminEmail = 'adminbro@gmail.com';
    const adminPassword = 'adminbropass';
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = new User({ email: adminEmail, password: hashedPassword, isAdmin: true });
        await newAdmin.save();
        console.log('Admin user created');
    }
})();

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
            req.session.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
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

app.get('/admin/products', isAdmin, async (req, res) => {
    const products = await Product.find();
    res.render('admin/products', { title: 'Admin Products', products });
});

app.get('/admin', isAdmin, (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

app.get('/admin/products/add', isAdmin, (req, res) => {
    res.render('admin/add-product', { title: 'Add Product' });
});

app.post('/admin/products/add', isAdmin, async (req, res) => {
    const { name, price, description, imageUrl } = req.body;
    const product = new Product({ name, price, description, imageUrl });
    await product.save();
    res.redirect('/admin/products');
});

app.get('/admin/products/edit/:id', isAdmin, async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('admin/edit-product', { title: 'Edit Product', product });
});

app.get('/admin/orders', isAdmin, async (req, res) => {
    const orders = await Order.find().populate('userId').populate('items.productId');
    res.render('admin/orders', { title: 'Admin Orders', orders });
});

app.post('/admin/products/edit/:id', isAdmin, async (req, res) => {
    const { name, price, description, imageUrl } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, price, description, imageUrl });
    res.redirect('/admin/products');
});

app.get('/admin/products/delete/:id', isAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));