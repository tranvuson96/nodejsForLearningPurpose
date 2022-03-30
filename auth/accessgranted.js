
// bảo vệ route nếu chưa login
exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};

// thừa thãi ko biết làm gì viết vào cho vui :))
exports.adminRole = (req, res, next) => {
    if (req.session.user.role != 'admin') {
        return res.render('denied',{
            pageTitle: 'Access Denied',
            path: '/AccessDenied'
        })
    }
    next();
};

// tạo locker cho route nếu staff bị lock thì sẽ không truy cập được vào route
exports.locker = (req, res, next) => {
    if (req.session.user.status === 'lock') {
        return res.render('denied',{
            pageTitle: 'Access Denied',
            path: '/AccessDenied'
        })
    }
    next();
}

// bảo vệ route staff
exports.staffRole = (req, res, next) => {
    if (req.session.user.role !== 'staff' && req.session.user.role !== 'admin') {
        return res.render('denied',{
            pageTitle: 'Access Denied',
            path: '/AccessDenied'
        })
    }
    next();
};

// bảo vệ rote manager
exports.managerRole = (req, res, next) => {
    if (req.session.manager.role !== 'manager' && req.session.user.role !== 'admin') {
        return res.render('denied',{
            pageTitle: 'Access Denied',
            path: '/AccessDenied'
        })
    }
    next();
};