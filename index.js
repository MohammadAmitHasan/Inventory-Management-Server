const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');

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

        // Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d',
            })
            res.send({ token })
        })

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

        // Update stock API
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

        // Add new item API
        app.post('/addItem', async (req, res) => {
            const doc = req.body;
            const result = await productCollection.insertOne(doc);
            res.send(result);
        })

        // Delete an item API
        app.delete('/deleteItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result);
        })

        // My Item API
        app.get('/myItem', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email }
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
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