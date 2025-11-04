const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://kamrulislam25262800_db_user:6MCVX0UtsJnacF9h@cluster0.wdszlbv.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("smart_db");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    const userCollection = db.collection("users");

    // USERS API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      } else {
        console.log("Adding new user:", user);
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
    });

    // ✅ GET route (to fetch all products)
    app.get("/products", async (req, res) => {
      console.log(req.query);

      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // latest-products API
    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      // If invalid, try match as string (temporary)
      let query;
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { _id: id }; // fallback string search
      }

      const product = await productsCollection.findOne(query);
      if (!product) return res.status(404).send({ error: "Product not found" });
      res.send(product);
    });

    // ✅ POST route (to add a new product)
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
      // const query = { _id: new require("mongodb").ObjectId(id) };
      // const result = await productsCollection.deleteOne(query);
      // res.send(result);
    });

    // bids collection APIs
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const bids = await cursor.toArray();
      res.send(bids);
    });

    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      const bids = await bidsCollection
        .find(query)
        .sort({ bid_price: -1 })
        .toArray();

      if (bids.length === 0) {
        return res
          .status(404)
          .send({ error: "No bids found for this product" });
      }

      res.send(bids);
    });

    // POST route to submit a new bid
    app.post("/bids", async (req, res) => {
      const bid = req.body;
      try {
        const result = await bidsCollection.insertOne(bid);
        res.send(result);
      } catch (error) {
        console.error("Error inserting bid:", error);
        res.status(500).send({ error: "Failed to insert bid" });
      }
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    console.log("Connected to MongoDB ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Smart Deals Server is Running");
});

// app.get("/about", (req, res) => {
//   res.send("About Smart Deals Server");
// });

app.listen(port, () => {
  console.log(`Smart Deals Server is running on port: ${port}`);
});
