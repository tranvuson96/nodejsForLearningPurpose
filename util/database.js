const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://sontvfx11243:aoeXszMuk6HEIiNO@cluster0.anl8k.mongodb.net/management?retryWrites=true&w=majority')
    .then(client=>{
        console.log('Connected');
        _db = client.db();
        callback();
    })
    .catch(err=>{
        console.log(err)
        throw err;
    });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

console.log(_db);

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;