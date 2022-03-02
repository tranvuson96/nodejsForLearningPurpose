const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://sontvfx11243:aoeXszMuk6HEIiNO@cluster0.anl8k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(client=>{
        console.log('Connected');
        cb(client);
    })
    .catch(err=>console.log(err));
}

module.exports = mongoConnect;