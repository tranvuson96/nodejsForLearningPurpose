const express = require('express');
const userController = require('../controllers/user');
const isAuth = require('../auth/accessgranted');
const router = express.Router();

// màn hình thông tin và nghỉ phép
router.get('/',userController.getHome);

router.get('/user/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.getUser);

router.get('/user-edit/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.getEditUser);

router.post('/user-edit/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.postEditImg);

router.post('/user-register/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    isAuth.locker,
    userController.excAnnualLeave);

router.use('/register-denied/:userId',
    isAuth.isLoggedIn,
    userController.deniedRegister);
// màn hình điểm danh
router.get('/roll-call/:userId',
    isAuth.isLoggedIn,
    userController.getRollCall);

router.post('/roll-call/:userId',
    isAuth.isLoggedIn,
    isAuth.locker,
    userController.postRollCall);

router.post('/exitwork/:userId',
    isAuth.isLoggedIn,
    isAuth.locker,
    userController.exitWorkingMode);

// màn hình tra cứu thông tin giờ làm

router.get('/timerecords/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.getUserTimeRecords);

router.post('/timerecords/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.postUserTimeRecords);


router.post('/timerecords',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.postUserMonth);

// màn hình thông tin sức khỏe

router.get('/covid-19/:userId',
    isAuth.isLoggedIn,
    userController.getUserCovid);

router.post('/covid-19/:userId',
    isAuth.isLoggedIn,
    isAuth.staffRole,
    userController.postUserCovid);

module.exports = router;