const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    // const isLoggedIn=req.get('Cookie').split(';')[0].trim().split('=')[2] === 'true';
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('62220cc34bb64fd0bff5a844')
        .then(user=>{
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err)=>{
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err=>console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(()=>{
        res.redirect('/');
    });
};