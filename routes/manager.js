const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../auth/accessgranted');

const router = express();

// màn hình search
router.get('/search',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.getSearch
);

router.post('/search',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.postSearch
);

router.post(
    '/manager/covid-19/:staffId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.getStaffCovid
);

router.get('/manager/covid-19/:docId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.sendPdf
);

router.get('/manager/staffsrecord/:staffId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.getStaffRecords
);

router.post('/manager/staffsrecord/:staffId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.postMonthStaff
);

router.post('/manager/staffsrecord/delete/:dayRecordsId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.deleteRecords
);

router.post('/manager/staffsrecord/lock/:staffId',
    isAuth.isLoggedIn,
    isAuth.managerRole,
    adminController.lock
);

module.exports = router