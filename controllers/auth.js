const Manager = require('../models/manager');
const User = require('../models/user');
// load trang login
exports.getLogin = (req, res, next) => {
    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login'
    });
};

// gửi request từ user đến database
exports.postLogin = (req, res, next) => {
    const username= req.body.username;
    const password = req.body.password;
    // tìm manager và user cùng 1 lúc
    const manager = Manager.findOne({username:username});
    User.findOne({username:username})
        .then(user=>{
            if(!user){
                // nếu k có user thì tìm trong manager nếu k có trong manager thì redirect to login
                return manager.then(manager=>{
                    if(!manager) {
                        return res.redirect('/login');
                    }
                    // so sánh password nếu sai thì redirect to login
                    if(manager.password === password) {
                        req.session.isLoggedIn = true;
                        req.session.manager = manager;
                        return req.session.save(err=>{
                        res.redirect('/');
                        })
                    }
                    res.redirect('/login')
                })
            }
            if(user.password === password) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err=>{
                    res.redirect('/');
                })
            }
            res.redirect('/login')
        })
};

// xóa session khi thoát
exports.postLogout = (req, res, next) => {
    req.session.destroy((err)=>{
        res.redirect('/login');
    });
};