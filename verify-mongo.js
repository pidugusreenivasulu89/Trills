const { MongoClient, ServerApiVersion } = require('mongodb');

// I am testing WITHOUT the < > brackets as those are usually placeholders
const uri = "mongodb+srv://pidugusreenivasulu89_db_user:ZDD9BIj8MEpsnYFU@trills.fttx4.mongodb.net/?appName=Trills";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Connection failed!");
        console.error(err);
    } finally {
        await client.close();
    }
}
run();
