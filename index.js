const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const mongoConnect = require('./util/database').mongoConnect;

const errorController = require('./controllers/Err');
const userRoutes = require('./routes/user');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));

app.use(userRoutes);



app.use(errorController.get404);

// mongoConnect(()=>{
//     app.listen(3000);
// });

mongoose.connect('mongodb+srv://sontvfx11243:aoeXszMuk6HEIiNO@cluster0.anl8k.mongodb.net/management?retryWrites=true&w=majority')
    .then(result=>{
        User.findOne().then(user=>{
            if(!user){
                const user = new User({
                    name: 'Trần Vũ Sơn',
                    doB: '1996-11-26',
                    salaryScale: 1.0,
                    startDate: Date.now(),
                    department: 'IT',
                    annualLeave: 10,
                    imageUrl: 'https://scontent.fhan5-4.fna.fbcdn.net/v/t1.18169-9/12046856_700027436797279_8252472890310414108_n.jpg?_nc_cat=104&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=CRTckmp4ZzUAX--Tvl_&_nc_ht=scontent.fhan5-4.fna&oh=00_AT8gPa0I_meA9uXXZ-Yw6QekPyk17Gu0iZHty9tPx6OfWg&oe=624B6F62'
                });
                user.save();
            }
        })
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    });