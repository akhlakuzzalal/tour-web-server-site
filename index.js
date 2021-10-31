const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Connect With MongoDB Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rolps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
   try {
      await client.connect();
      const database = client.db('Tourism');
      const tourCollection = database.collection('tours');
      const hotelCollection = database.collection('hotel');
      const ordersCollection = database.collection('orders');

      // POST Method
      app.post('/tours', async (req, res) => {
         const doc = req.body;
         const result = await tourCollection.insertOne(doc);
         res.json(result);
      });

      app.post('/hotels', async (req, res) => {
         const doc = req.body;
         const result = await hotelCollection.insertOne(doc);
         res.json(result);
      });


      // Update Order Or Insert Order
      app.put('/orders', async (req, res) => {
         const orderDetail = req.body;
         const filter = { email: orderDetail.email };
         const option = { upsert: true };
         const updateDoc = {
            $set: {
               address: orderDetail.address,
               from: orderDetail.from,
               order: orderDetail.order,
               phone: orderDetail.phone,
               name: orderDetail.name,
               stutus: orderDetail.stutus
            },
         };
         const result = await ordersCollection.updateOne(filter, updateDoc, option);
         res.json(result);
      });

      // Update Stutus
      app.put('/orders/:id', async (req, res) => {
         const id = req.params.id;
         const filter = { _id: ObjectId(id) };
         const option = { upsert: true };
         const updateDoc = {
            $set: {
               stutus: req.body.stutus
            },
         };
         const result = await ordersCollection.updateOne(filter, updateDoc, option);
         res.json(result);
      })


      // Get Method
      app.get('/tours', async (req, res) => {
         const cursor = tourCollection.find({});
         const allTours = await cursor.toArray();
         res.json(allTours);
      });

      app.get('/hotels', async (req, res) => {
         const cursor = hotelCollection.find({});
         const allTours = await cursor.toArray();
         res.json(allTours);
      });

      app.get('/orders', async (req, res) => {
         const cursor = ordersCollection.find({});
         const orders = await cursor.toArray();
         res.json(orders);
      })

      // single get Method
      app.get('/tours/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await tourCollection.findOne(query);
         res.json(result);
      })

      // POST method For Get Orsers by Id
      app.post('/tours/orders', async (req, res) => {
         const names = req.body;
         const query = { name: { $in: names } };
         const orders = await tourCollection.find(query).toArray();
         res.json(orders);
      })

      // post for Customer order Get
      app.post('/orders', async (req, res) => {
         const mail = req.body;
         const query = { email: { $in: mail } };
         const orders = await ordersCollection.find(query).toArray();
         res.json(orders);
      })
   }
   finally {
      // await client.close();
   }
}
run().catch(console.dir);


app.get('/', (req, res) => {
   res.send('running Tourism Server');
});

app.listen(port, () => {
   console.log('server is running on Localhost:', port)
});