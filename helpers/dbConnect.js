import { MongoClient } from "mongodb";


const connect = async () => {

    const {
        MONGO_SCHEME: scheme,
        MONGO_USER: user,
        MONGO_PASS: password,
        MONGO_HOST: host,
        MONGO_DB: dbName
    } = process.env;

    const mongoURL = scheme + user + ":" + password + "@" + host;
    const dbClient = new MongoClient(mongoURL);

    await dbClient.connect();
    const db = await dbClient.db(dbName);
    console.log("Connected to Database");

    return db;
}

export let dbClient;

const main = async () => {
    dbClient = await connect();
}

export default await main();