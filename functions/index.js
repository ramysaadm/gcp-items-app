const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Reference to Firestore
const db = admin.firestore();

// Get all items
exports.getItems = functions
  .region('asia-south1')
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'GET') {
          return res.status(405).send('Method Not Allowed');
        }

        const snapshot = await db.collection('items').get();
        const items = [];

        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        return res.status(200).json(items);
      } catch (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({ error: 'Failed to fetch items' });
      }
    });
  });

// Get single item
exports.getItem = functions
  .region('asia-south1')
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'GET') {
          return res.status(405).send('Method Not Allowed');
        }

        const itemId = req.path.split('/')[1];

        if (!itemId) {
          return res.status(400).json({ error: 'Item ID is required' });
        }

        const doc = await db.collection('items').doc(itemId).get();

        if (!doc.exists) {
          return res.status(404).json({ error: 'Item not found' });
        }

        return res.status(200).json({
          id: doc.id,
          ...doc.data(),
        });
      } catch (error) {
        console.error('Error fetching item:', error);
        return res.status(500).json({ error: 'Failed to fetch item' });
      }
    });
  });

// Create item
exports.createItem = functions
  .region('asia-south1')
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          return res.status(405).send('Method Not Allowed');
        }

        const { name, description } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Item name is required' });
        }

        const item = {
          name,
          description: description || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('items').add(item);
        const newItem = {
          id: docRef.id,
          ...item,
          createdAt: new Date().toISOString(), // For immediate response
        };

        return res.status(201).json(newItem);
      } catch (error) {
        console.error('Error creating item:', error);
        return res.status(500).json({ error: 'Failed to create item' });
      }
    });
  });

// Update item
exports.updateItem = functions
  .region('asia-south1')
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'PUT') {
          return res.status(405).send('Method Not Allowed');
        }

        const itemId = req.path.split('/')[1];

        if (!itemId) {
          return res.status(400).json({ error: 'Item ID is required' });
        }

        const docRef = db.collection('items').doc(itemId);
        const doc = await docRef.get();

        if (!doc.exists) {
          return res.status(404).json({ error: 'Item not found' });
        }

        const updateData = {
          ...req.body,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();

        return res.status(200).json({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        });
      } catch (error) {
        console.error('Error updating item:', error);
        return res.status(500).json({ error: 'Failed to update item' });
      }
    });
  });

// Delete item
exports.deleteItem = functions
  .region('asia-south1')
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'DELETE') {
          return res.status(405).send('Method Not Allowed');
        }

        const itemId = req.path.split('/')[1];

        if (!itemId) {
          return res.status(400).json({ error: 'Item ID is required' });
        }

        const docRef = db.collection('items').doc(itemId);
        const doc = await docRef.get();

        if (!doc.exists) {
          return res.status(404).json({ error: 'Item not found' });
        }

        await docRef.delete();

        return res.status(200).json({ message: 'Item deleted successfully' });
      } catch (error) {
        console.error('Error deleting item:', error);
        return res.status(500).json({ error: 'Failed to delete item' });
      }
    });
  });
