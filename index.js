const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

// Using middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const query = require('express/lib/middleware/query');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mhdxq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // Connect To database
        await client.connect();
        const productCollection = client.db('nim_database').collection('products');

        // Create all products API
        app.get('/products', async (req, res) => {
            const amount = req.query.amount;
            const query = {};
            let cursor;
            if (amount) {
                cursor = productCollection.find(query).limit(+amount);
            }
            else {
                cursor = productCollection.find(query);
            }

            const products = await cursor.toArray();
            res.send(products);
        })

        // Create specific product API
        app.get('/products/:id', async (req, res) => {
            const productId = req.params.id;
            const query = { _id: ObjectId(productId) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.put('/updateStock/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            const newAmount = req.body;
            console.log(newAmount)

            const updateDoc = {
                $set: newAmount
            }

            const result = await productCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })

    }
    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Nasah Inventory Management Server is Running')
})

app.listen(port, () => {
    console.log(`Nasah Inventory Management Server is Up and Running on ${port}`)
})