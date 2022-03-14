const express = require('express');
const userController = require('../controllers/user');
const user = require('../models/user');

const router = express.Router();

// màn hình search
router.get('/',userController.getSearch);

router.post('/',userController.postSearch);

// màn hình thông tin và nghỉ phép
router.get('/user',userController.getUserPage);

router.get('/user/:userId',userController.getUser);

router.post('/user/:userId',userController.getInfo);

router.get('/edit-user/:userId',userController.getEditUser);

router.post('/edit-user/:userId',userController.postEditImg);

router.post('/user-register/:userId/',userController.excAnnualLeave);

router.use('/register-denied/:userId',userController.deniedRegister);
// màn hình điểm danh
router.get('/roll-call/:userId',userController.getRollCall);

router.post('/roll-call/:userId',userController.postRollCall);

router.post('/exitwork/:userId',userController.exitWorkingMode);

// màn hình tra cứu thông tin giờ làm
router.get('/timerecords',userController.getTimeRecord);

router.get('/timerecords/:userId',userController.getUserTimeRecords);

router.post('/timerecords',userController.postUserMonth);
// màn hình thông tin sức khỏe
router.get('/covid-19',userController.getCovid);

router.get('/covid-19/:userId',userController.getUserCovid);

router.post('/covid-19/:userId',userController.postUserCovid);

module.exports = router;