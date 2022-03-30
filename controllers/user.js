const mongoose = require('mongoose');
const User = require('../models/user');
const Manager = require('../models/manager');
const Register = require('../models/register');
const Records = require('../models/workrecord');
const DayRecords = require('../models/dayrecord');
const Health = require('../models/covid')
const date = require('date-and-time');
const moment = require('moment');
const today = moment().startOf('day');

exports.getHome = (req, res, next) => {
    const userId = req.session.user?._id;
    const managerId = req.session.manager?._id;
    if(managerId) {
        return Manager
        .findById(managerId)
        .then(manager => {
            res.render('welcome',{
                pageTitle: 'Chào mừng',
                path: '/',
                user: manager
            });
        })
        .catch(err => next(new Error(err)));
    }
    if(userId) {
        return User
        .findById(userId)
        .then(user =>{
            res.render('welcome',{
                pageTitle: 'Chào mừng',
                path: '/',
                user: user
            });
        }).catch(err => next(new Error(err)));
    }
    res.render('welcome',{
        pageTitle: 'Chào mừng',
        path: '/',
        user: null
    });
}

exports.getUser = (req, res, next) =>{
    const user = req.session.user;
    res.render('user/info', {
        pageTitle: "User's info",
        path: '/user',
        editing: false,
        user: user
    });
};

// vào edit mode 
exports.getEditUser = (req,res,next) => {
    const userId = req.session.user._id;
    const editmode = req.query.edit;
    if(!editmode){
        return res.redirect('/');
    }
    User
    .findById(userId)
    .then(user => {
        res.render('user/info', {
            pageTitle: "User's info",
            path: '/edit-user',
            editing: editmode,
            user: user
        });
    }).catch(err => next(new Error(err)));
};

// xử lý thông tin edit
exports.postEditImg = (req,res,next) => {
    const userId = req.session.user._id;
    const updatedImg = req.file;
    console.log(updatedImg);
    if(!updatedImg){
        return res.status(422).redirect(`/user/${userId}`);
    }

    User
    .findById(userId)
    .then(user => {
        user.imageUrl = updatedImg.path;
        return user.save()
    })
    .then(user => {
        res.render('user/info', {
            pageTitle: "User's info",
            path: '/user',
            editing: false,
            user: user
        });
    })
    .catch(err => {
        console.log(err);
    });
};

// xử lý thông tin đăng ký nghỉ phép

exports.excAnnualLeave = (req, res, next) => {
    // lấy dữ liệu từ input
    const startDate = date.parse(req.body.startDate,'YYYY-MM-DD');
    const endDate = date.parse(req.body.endDate,'YYYY-MM-DD');
    const annualhours = req.body.hours;
    const userId = req.body.userId;
    const description = req.body.description;


    // xử lý dữ liệu có được chấp nhận hay không
    const Days = date.subtract(endDate,startDate).toDays();
    if((Days<=0)&&(annualhours==0)){
        return res.redirect(`/register-denied/${userId}`)
    }
    //tìm user rồi update annualLeave 
    User.findById(userId).then(user=>{
        const leftOver = user.annualLeave - Days;
        // nếu ngày bắt đầu nghỉ lớn hơn ngày kết thúc thì trả về false
        if(((annualhours==0)&&(leftOver<0)) || ((annualhours>0)&&(leftOver<0)) ){
            return res.redirect(`/register-denied/${user._id}`);
        }
        const sum = leftOver - annualhours/8;
        // bảo đảm việc trừ theo giờ 
        if(sum<0){
            return res.redirect(`/register-denied/${user._id}`);
        }
        // bảo đảm số giờ nghỉ mỗi ngày 
        if(user.hoursleft<annualhours){
            return res.redirect(`/register-denied/${user._id}`);
        }
        user.annualLeave = sum;
        user.hoursleft = user.hoursleft-annualhours;
        // tạo đơn đăng ký sau khi thỏa mãn các yêu cầu
        const register = new Register({
            startDate:startDate,
            endDate:endDate,
            userId:user._id,
            hours: annualhours,
            description:description,
        });
        register.save().then(result=>{
            // tìm và đẩy các ID đơn đăng ký vào DayRecords
            return DayRecords.find({
                userId:result.userId,
                createdAt:{
                    $gte: moment(result.createdAt).startOf('day').toDate(),
                    $lte: moment(result.createdAt).endOf('day').toDate()
                },
            },function(err,records){
                const record = records[0]
                // nếu ko có records thì sẽ tạo mới và gán luôn registerId 
                if(!record){
                    const reCord = new DayRecords({
                        userId: result.userId,
                        registers:[{registerId:result._id}]    
                    });
                    return reCord.save();
                }
                record.registers.push({registerId:result._id});
                return record.save();
            })
        }).then(()=>{
            user.save()
            .then(result=>{
                res.render('excepted',{
                pageTitle: 'Register Excepted',
                path: '/user-register/',
                user: result
                })
            })
        })
    })
    .catch(err => next(new Error(err)));
};

// từ chối đơn xin nghỉ
exports.deniedRegister = (req,res,next) => {
    const userId = req.params.userId;
    res.render('registererr',{pageTitle:'Register Denied',path:'/register-denied',userId:userId});
};

//render trang điểm danh
exports.getRollCall = (req, res, next) => {
    const userId = req.session.user._id;
    User
    .findById(userId)
    .then(user => {
        res.render('user/rollcall', {
            pageTitle: 'Roll Call',
            path: '/roll-call',
            user: user,
            working: false
        });
    }).catch(err => next(new Error(err)));
};
 
    // vào trạng thái làm việc
exports.postRollCall = (req,res,next) => {
    const working = req.query.working;
    // kiểm tra và render
    if(working){
        // nhận các body từ req
        const place = req.body.place;
        const userId = req.body.userId;
        const record = new Records({
            startAt: new Date(),
            place: place,
            userId:userId,
        });
        return record.save().then(record=>{
        // tìm DayRecord rồi đẩy luôn ID vào 
            DayRecords.find({
                userId:userId,
                createdAt:{
                    $gte: moment(record.createdAt).startOf('day').toDate(),
                    $lte: moment(record.createdAt).endOf('day').toDate()
                }
            }).then(data=>{
                const dayrecords = data[0]
                // nếu ko có records thì sẽ tạo mới và gán luôn registerId vào array
                // console.log(dayrecords);
                if(!dayrecords){
                    const dayrecord = new DayRecords({
                        userId: record.userId,
                        records:[{recordId:record._id}]    
                    });
                    return dayrecord.save()
                }
                if(dayrecords){
                    dayrecords.records.push({recordId:record._id});
                    return dayrecords.save();
                }
            })
            // lấy một số dữ liệu từ user
            record.populate('userId').then(user=>{
                
                res.render('user/rollcall', {
                    pageTitle: 'Roll Call',
                    path: '/roll-call',
                    user: user,
                    working: true
                });
            }).catch(err => next(new Error(err)));;
        }).catch(err => next(new Error(err)));;
    }
    if(!working){
        return res.redirect('/')
    }
};

// exit working mode
exports.exitWorkingMode = (req,res,next)=>{
    // lấy dữ liệu từ hidden input và tạo biến endAt
    const userId = req.body.userId;
    const recordId = req.body.recordId;
    const endAt = new Date();
    // tìm recordId rồi update 
    Records
        .findById(recordId)
        .then(record=>{
            const times = date.subtract(endAt ,record.startAt).toHours();
            record.endAt = endAt;
            record.times = times;
            return record.save()
        })
        .then(result=>{
            // tìm tất cả records có trong ngày
            return Records.find({
                    startAt:{
                        $gte: today.toDate(),
                        $lte:moment(today).endOf('day').toDate() 
                        },
                    userId: userId
            })
        })
        .then(records=>{
            // tạo biến total và check nếu có records thì tính tổng rồi lưu vào totalhourspday của user
            let total;
            let overTime;
                // tính tổng 
            if(records.length>0) {
                total = records.reduce((a,b)=>a+b.times,0);     
                if(total>8) {
                    return overTime = 8-total;
                }
                // tìm user tương ứng rồi lưu thay đổi vào
                User.findById(userId)
                    .then(user=>{
                        user.totalhourspday = total;
                        user.overTime = overTime;
                        return user.save();
                    })
                    .then(user=>{
                        res.render('user/rollcall', {
                            pageTitle: 'Roll Call',
                            path: '/roll-call',
                            user: user,
                            working: false
                        });
                    })
            } 
        })
        .catch(err => next(new Error(err)));
};

//render thông tin giờ làm của user

exports.getUserTimeRecords = (req,res,next)=>{
    // lấy dữ liệu và khai báo biến đếm
    const userId = req.session.user._id;
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = req.session.line || 2
    let totalItems;

    // chuẩn bị dữ liệu 
    DayRecords.find({userId:userId})
    .populate('records.recordId')
    .populate('registers.registerId')
    .then(result=>{
        result.forEach(day=>{
           const totalhours =day.records.reduce((a,b)=>a+b.recordId.times,0);
           const registereddays = day.registers.reduce((a,b)=>{
                const time1 = Date.parse(b.registerId.startDate);
                const time2 = Date.parse(b.registerId.endDate);
                const diff = (time2-time1)/86400000
                return a+diff;
           },0)
           const registeredhours = day.registers.reduce((a,b)=>a+b.registerId.hours,0);
           day.total = totalhours;
           day.registereddays = registereddays + registeredhours/8;
           day.registeredhours = registeredhours;
           return day.save();
       })
    })
    .then(()=>{

        DayRecords.find({userId:userId})
            .countDocuments()
            .then(numDoc=>{
                totalItems = numDoc;
                return DayRecords.find({userId:userId})
                .skip((page -1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('records.recordId')
                .populate('registers.registerId')
                .populate('userId')
            })
            .then(data=>{
                // render ra giao diện
                res.render('user/timerecords',{
                    pageTitle:'Time Records',
                    path:'/timerecords',
                    users: data,
                    date:date,
                    salary:null,
                    overTime: null,
                    lamthieu:null,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                    oldInput: {
                        daysPerPage: ITEMS_PER_PAGE,
                    }
                })
            })
    })
    .catch(err => next(new Error(err)));

};

exports.postUserTimeRecords = (req,res,next)=>{
    // lưu số ngày hiển thị vào session để khi sang trang mới không bị reset
    req.session.line = req.body.daysPerPage;
    req.session.save(err=>{
        console.log(err);
        res.redirect(`/timerecords/${req.session.user._id}`);
    });
};

// lương tháng
exports.postUserMonth = (req,res,next) => {
    const userId = req.session.user._id;
    const month = req.body.month;
    // tìm tất cả records có trong tháng
    DayRecords.find({
        userId:userId,
        createdAt:{
            $gte: moment(month).startOf('month').toDate(),
            $lte: moment(month).endOf('month').toDate()
        }
    })
    .populate('records.recordId')
    .populate('registers.registerId')
    .populate('userId')
    .then(records=>{
        if(!records.length) return
        // tính toán số h đã làm mỗi ngày tổng lượng annualLeave đã đăng ký 
        totalhours = records.reduce((a,b)=>a+b.total,0);
        registerday = records.reduce((a,b)=>a+b.registereddays,0);
        registerhours = records.reduce((a,b)=>a+b.registeredhours,0);
        lamthieu = (8*records.length-totalhours-8*registerday);
        // nêu làm thiếu giờ < 0 tứ là overTime sẽ dương lúc đấy set thieu gio = 0 và ngược lại
        const thieugio = lamthieu<0 ? 0 : lamthieu;
        overTime = totalhours-8*records.length;
        const themgio = overTime<0 ? 0 : overTime;
        // tính salary rồi render
        salary=records[0].userId.salaryScale*3000000+(themgio-thieugio)*200000;
        res.render('user/salary', {
            pageTitle: 'salary',
            path: '/salary',
            user: records,
            lamthieu: thieugio,
            overTime: themgio,
            salary
        })
    })
    .catch(err => next(new Error(err)));
};

//render thông tin covid của user

exports.getUserCovid = (req,res,next) =>{
    const userId = req.session.user?._id;
    const managerId = req.session.manager?._id;
    // xác định đấy là manager hay staff vì sử dụng cùng 1 file ejs
    if(managerId) {
        return Manager
        .findOne({_id:managerId})
        .populate('staffs.userId')
        .then(manager=>{
            res.render('user/covid', {
                pageTitle: 'staffs covid',
                path: '/covid-19',
                user: manager
            })
        })
        .catch(err => next(new Error(err)));
    }
    if(userId) {
        return User
        .findById(userId)
        .then(user=>{
            res.render('user/covid', {
                pageTitle: 'staffs covid',
                path: '/covid-19',
                user: user
            });
        })
        .catch(err => next(new Error(err)));
    }
    res.render('user/covid', {
        pageTitle: 'staffs covid',
        path: '/covid-19',
        user: null
    });
};

exports.postUserCovid = (req,res,next) => {
    // lấy dữ liệu
    const userId = req.session.user._id;
    const bodyheat= req.body.bodyheat;
    const vaccintype=req.body.vaccintype;
    const ngaytiem=req.body.ngaytiem;
    const shot=req.body.shot;
    const isPositive = req.body.isPositive;
    // tìm bản đăng ký nếu ko có thì tạo mới nếu có thì update
    Health.findOne({userId:userId})
    .then(health=>{
        if(!health){
            const health = new Health({
                userId:userId,
                bodyheat: bodyheat,
                positiveWithCovid:isPositive
            });
            if((!vaccintype)){
                health.vaccin.firstShot.shottype = 'chưa tiêm';
                return health.save();
            }
            if(vaccintype){
                if(shot==1){
                    health.vaccin.firstShot.shottype = vaccintype;
                    health.vaccin.firstShot.date= ngaytiem;
                    return health.save();
                }
                if(shot==2){
                    health.vaccin.secondShot.shottype = vaccintype;
                    health.vaccin.secondShot.date= ngaytiem;
                    return health.save();
                }
            }
        }
        if(Object.keys(health)!==0) {
            health.bodyheat=bodyheat;
            health.positiveWithCovid=isPositive;
            if(shot==1){
                health.vaccin.firstShot.shottype = vaccintype;
                health.vaccin.firstShot.date= ngaytiem;
                return health.save();
            }
            if(shot==2){
                health.vaccin.secondShot.shottype = vaccintype;
                health.vaccin.secondShot.date= ngaytiem;
                return health.save();
            }
        }
    })
    .then(()=>{
        res.render('requestexcepted',{
            pageTitle:'Excepted',
            path:'/user'
        })
    })
    .catch(err => next(new Error(err)));
};