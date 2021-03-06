// ./src/database/mongo.js

const mongoose = require('mongoose')

let database = null

//connect to database
async function startDatabase() {
	//var mongoDB should be an environment variable
	var mongoDB = 'mongodb+srv://senior:1234@seniordesign-dc4bp.mongodb.net/test?retryWrites\\\\=true&w\\\\=majority'
    mongoose.connect(mongoDB, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).
        catch(error => console.log(error))
    database = mongoose.connection
}

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))

async function getDatabase() {
    if (!database) await startDatabase()
    return database
}

module.exports = {
    getDatabase,
    startDatabase
}