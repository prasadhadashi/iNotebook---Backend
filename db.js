// const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/"

// const connectToMongo = ()=>{
//     mongoose.connect(mongoURI, ()=>{
//         console.log("Connected to MongoDB successfully");
//     })
// }

// module.exports = connectToMongo;

const mongoose = require('mongoose');
//In mongoURI after a localhost port inotebook  dbtabel is created 
const mongoURI = "mongodb://localhost:27017/inotebook";

const connectToMongo = () => {
    return mongoose.connect(mongoURI)
        .then(() => {
            console.log("Connected to MongoDB successfully");
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
        });
}

module.exports = connectToMongo;