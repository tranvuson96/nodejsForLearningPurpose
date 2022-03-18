exports.getLogin = (req, res, next) => {
    // const isLoggedIn=req.get('Cookie').split(';')[0].trim().split('=')[2] === 'true';
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    // Expries=  ; Max-Age=10 ; Secure; Domain= ;HttpOnly
    res.setHeader('Set-Cookie', 'loggedIn==true; HttpOnly')
    res.redirect('/');
};