const Health = require('../models/covid');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const User = require('../models/user');
const DayRecords = require('../models/dayrecord');
const date = require('date-and-time');
const moment = require('moment');
const Records = require('../models/workrecord');

// render trang tìm kiếm
exports.getSearch = (req, res, next) => {
    res.render('user/search', {
        pageTitle: 'Search',
        path: '/search',
        users: null
    });
};

// trả về kết quả tìm kiếm
exports.postSearch =  (req, res, next) => {
    // lấy giá trị từ input
    const input = req.body.search;
    const tags = req.body.tags;
    // tìm kiếm theo tag rồi render giao diện
        if(tags=== 'name'){
            User.find({name:{$regex:input,$options:'i'}},function(err,data){
                if(err){
                    next(new Error(err));
                }
                
                res.render('user/search',{
                    pageTitle: 'Search',
                    path:'/search',
                    users: data
                });
            })
        }
        if(tags === 'department'){
            User.find({department:{ $regex: input,$options:'i'}},function(err,data){
                if(err){
                    next(new Error(err));
                }
                
                res.render('user/search',{
                    pageTitle: 'Search',
                    path:'/search',
                    users: data
                });
            })
        }
};
// xem thời gian làm việc của staff từ đầu dến h
exports.getStaffRecords = (req, res, next) => {
    // lấy giá trị từ params và query
    const staffId = req.params.staffId;
    const page = +req.query.page || 1;
    // khai báo biến đếm và số lượng doc trả về mỗi trang
    const ITEMS_PER_PAGE = 1
    let totalItems;
    // tổng hợp và lưu thông tin cần thiết
    DayRecords.find({userId:staffId})
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
        // đếm tổng số ngày rồi render
        DayRecords.find({userId:staffId})
            .countDocuments()
            .then(numDoc=>{
                totalItems = numDoc;
                return DayRecords.find({userId:staffId})
                .skip((page -1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('records.recordId')
                .populate('registers.registerId')
                .populate('userId')
            })
            .then(data=>{
                res.render('manager/records',{
                    pageTitle:'Time Records',
                    path:'/timerecords',
                    users: data,
                    date:date,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                })
            })
    })
    .catch(err => next(new Error(err)));
};

// thay đổi hiển thị tháng
exports.postMonthStaff = (req, res, next) => {
    // lấy dữ liệu ô input
    const staffId = req.body.staffId;
    const monthRecords = req.body.monthRecords;
    // làm gần giống trên
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = 1
    let totalItems;

    DayRecords.find({
        userId:staffId,
        createdAt:{
            $gte: moment(monthRecords).startOf('month').toDate(),
            $lte: moment(monthRecords).endOf('month').toDate()
        }
    })
    .populate('records.recordId')
    .populate('registers.registerId')
    .then(result=>{
        if(!result) return;
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
        // filter file chỉ trong tháng được chọn hoặc trả về ngày đầu tiên làm nếu tháng được chọn ko có records nào
        DayRecords.find({userId:staffId,
            createdAt:{
                $gte: moment(monthRecords).startOf('month').toDate(),
                $lte: moment(monthRecords).endOf('month').toDate()
            }})
            .countDocuments()
            .then(numDoc=>{
                totalItems = numDoc;
                return DayRecords.find({userId:staffId})
                .skip((page -1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate('records.recordId')
                .populate('registers.registerId')
                .populate('userId')
            })
            .then(data=>{
                res.render('manager/records',{
                    pageTitle:'Time Records',
                    path:'/timerecords',
                    users: data,
                    date:date,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                })
            })
    })
    .catch(err => next(new Error(err)));
};

// xóa dữ liệu
exports.deleteRecords = (req, res, next) => {
    // lấy dữ liệu
    const staffId = req.body.staffId;
    const dayRecordsId = req.body.dayRecordsId;
    // check status nếu lock thì return undefined không thì tìm tất cả records trong ngày rồi xóa sau đấy xóa DayRecords
    User.findById(staffId).then(staff=>{
        if (staff.status === 'lock') return;
        return DayRecords.findById(dayRecordsId).then(dayRecords => {
            dayRecords.records.forEach(record => {
                Records.findByIdAndDelete(record.recordId);
            })
        })
    })
    .then(()=>{
        return DayRecords.findByIdAndDelete(dayRecordsId)
    })
    .then(()=>{
        res.redirect(`/manager/staffsrecord/${staffId}`);
    })
    .catch(err => next(new Error(err)));
};

// tạo locker thay đổi status của staff 
exports.lock = (req, res, next) => {
    const staffId = req.body.staffId;
    const locker =req.body.locker;


    User.findById(staffId).then(staff => {
        staff.status = locker;
        return staff.save();
    })
    .then(() => {
        res.redirect(`/manager/staffsrecord/${staffId}`);
    })
    .catch(err => next(new Error(err)));
}

// lấy thông tin đăng ký sức khỏe
exports.getStaffCovid = (req, res, next) => {
    const staffId = req.body.staffId;
    Health
    .findOne({userId:staffId})
    .populate('userId')
    .then(doc => {
        console.log(doc);
        res.render('manager/health', {
            pageTitle: 'StaffHealth',
            path: '/covid-19',
            doc:doc
        })
    }).catch(err => next(new Error(err)))
};

// trả về file pdf
exports.sendPdf = (req, res, next) => {
    const docId = req.params.docId;
    Health.findById(docId).populate('userId')
        .then(doc=>{
            if (!doc) {
                return next();
            }
            if(doc.userId.manager.managerId.toString() !== req.session.manager?._id?.toString()) {
                return next();
            }
            // setting Name và path
            const pdfName = 'staff-' + docId + '.pdf';
            const pdfPath = path.join('data','user', pdfName);
            const pdfDoc = new PDFDocument();
            const isPositive = doc.positiveWithCovid ? 'Có' : 'Không';
            // setting header mở giao diện pdf và cho xem mẫu
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + pdfName +'"');
            // tạo stream file
            pdfDoc.pipe(fs.createWriteStream(pdfPath));
            pdfDoc.pipe(res);
            // viết file pdf
            pdfDoc.fontSize(26)
                .text(`Tên nhân viên ${doc.userId.name}`, {align: 'center'});
            pdfDoc
                .text(`Thân nhiệt: ${doc.bodyheat}`,{align: 'center'});
            pdfDoc
                .text(`Đã tiêm : ${doc.vaccin.firstShot?.shottype} , ${doc.vaccin.secondShot?.shottype}`,{align: 'center'});
            pdfDoc
                .text(`${isPositive} dương tính với covid`,{align: 'center'});
            // kết thúc viết và call pipe(res)
            pdfDoc.end();
            

        })
        .catch(err => next(new Error(err)))
}