const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // replace if using Atlas

// MongoDB client
const client = new MongoClient(uri);

let collection;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('civicIntel');       // your database
    collection = db.collection('voicemails'); // your collection
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

// GET endpoint for voicemails with search & pagination
app.get('/api/voicemails', async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    // Build Mongo query for search across multiple fields
    const query = search
      ? {
          $or: [
            { category: { $regex: search, $options: "i" } },
            { region: { $regex: search, $options: "i" } },
            { sentiment: { $regex: search, $options: "i" } },
            { text: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Count total matching documents
    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limitInt);

    // Fetch only documents for this page
    const voicemails = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();

    res.json({
      voicemails,
      total,
      page: pageInt,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server works!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
