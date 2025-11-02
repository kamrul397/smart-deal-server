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

    // ✅ GET route (to fetch all products)
    app.get("/products", async (req, res) => {
      const products = await productsCollection.find().toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
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
