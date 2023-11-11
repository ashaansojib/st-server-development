const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 9988
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSNAME}@cluster0.ig4lnta.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const customerLists = client.db('sujon-telecom').collection('customers');
        const productList = client.db('sujon-telecom').collection('products');
        const loginUsers = client.db('st-login-users').collection('users');
        // customers api
        app.get('/customer-list', async (req, res) => {
            const query = await customerLists.find().toArray();
            res.send(query)
        });
        app.post('/create-customer', async (req, res) => {
            const query = req.body;
            query.createdAt = new Date;
            const result = await customerLists.insertOne(query);
            res.send(result);
        });
        app.delete('/remove-customer/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await customerLists.deleteOne(query);
            res.send(result)
        });
        // changing thinking /specifiq-product-list/654233c84ce2df7ea94f852f
        app.get('/specifiq-product-list/:id', async (req, res) => {
            const userID = req.params.id;
            const result = await productList.find({ customerID: userID }).toArray();
            res.send(result)
        });
        app.post('/add-specifiq-product', async (req, res) => {
            const product = req.body;
            product.createdAt = new Date;
            const result = await productList.insertOne(product);
            res.send(result)
        });
        app.delete('/remove-specifiq-product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productList.deleteOne(query);
            res.send(result);
        });
        // login users handle
        app.get('/login-users', async (req, res) => {
            const result = await loginUsers.find().toArray();
            res.send(result);
        });
        app.post('/store-users', async (req, res) => {
            const user = req.body;
            const existUser = await loginUsers.findOne({ email: user.email });
            if (existUser) {
                return res.send("User Already Added!")
            }
            const result = await loginUsers.insertOne(user);
            res.send(result);
        });
        app.patch('/update-user-role/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log(id, data);
            const query = { _id: new ObjectId(id) };
            // Check if the user already has a role
            const existingUser = await loginUsers.findOne(query);
            if (!existingUser) {
                return res.status(404).send({ error: 'User not found' });
              }
              // If the user already has a role, update it; otherwise, add the role
              const updateInfo = {
                role: existingUser.role ? data.role : 'admin',
              };
              const result = await loginUsers.updateOne(query, updateInfo);
              res.send(result);
        });
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("The server is running..")
});
app.listen(port, async (req, res) => {
    console.log(port, "the server running")
});