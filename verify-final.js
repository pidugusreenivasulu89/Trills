const { MongoClient, ServerApiVersion } = require('mongodb');

// URI provided by user
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
        console.log("Testing connection with password provided...");
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("SUCCESS: Connection working locally!");
    } catch (err) {
        console.error("FAILURE: Still getting error:");
        console.error(err.message);
    } finally {
        await client.close();
    }
}
run();
