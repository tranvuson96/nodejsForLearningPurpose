const path = require('path');
// lấy các packages cần thiết
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');

// lấy route và errcontroller
const errorController = require('./controllers/Err');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/manager');

// gọi app và tạo biến lưu trữ cho connection và protection cross-site scripting attack
const app = express();
const MongoDB_URI = 'mongodb+srv://sontvfx11243:aoeXszMuk6HEIiNO@cluster0.anl8k.mongodb.net/management'
const store = new MongoDBStore({
    uri:MongoDB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();
// vị trí lưu file image 
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
});

// filter file image
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ) {
        cb(null, true);
        
    } else {
        cb(null, false);

    }
};
// set view ejs 
app.set('view engine', 'ejs');
app.set('views', 'views');
// sử dụng packages parser 
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter }).single('imageUrl'));
// gắn path cho css và image
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data/images',express.static(path.join(__dirname, 'data/images')));
// tạo session và csrfProtect
app.use(session({secret: 'userData', resave:false,saveUninitialized:false, store:store}));
app.use(csrfProtection);
// lưu các biến locals
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.role = req.session?.user?.role || req.session?.manager?.role || 'anonymous';
    res.locals.userId = req.session.user?._id || req.session.manager?._id;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// sử dụng các routes
app.use(userRoutes);
app.use(authRoutes);
app.use(adminRoutes);

// xử lý err
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session?.isLoggedIn
      });
});

// liên kết với mongo
mongoose.connect(MongoDB_URI)
    .then(result=>{
        
        app.listen(process.env.PORT || 8080, '0.0.0.0' , () => {
            console.log('running')
        });
    })
    .catch(err => {
        console.log(err);
    });