import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [editingItem, setEditingItem] = useState(null);

  // API URLs for Cloud Functions
  const BASE_URL = 'https://asia-south1-gcp-items-demo.cloudfunctions.net';
  const API = {
    getItems: `${BASE_URL}/getItems`,
    getItem: `${BASE_URL}/getItem`,
    createItem: `${BASE_URL}/createItem`,
    updateItem: `${BASE_URL}/updateItem`,
    deleteItem: `${BASE_URL}/deleteItem`,
  };

  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.getItems);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(`Error fetching items: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new item
  const handleCreateItem = async (e) => {
    e.preventDefault();

    if (!newItem.name.trim()) {
      alert('Item name is required!');
      return;
    }

    try {
      const response = await fetch(API.createItem, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const createdItem = await response.json();
      setItems([...items, createdItem]);
      setNewItem({ name: '', description: '' });
    } catch (err) {
      setError(`Error creating item: ${err.message}`);
    }
  };

  // Delete an item
  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API.deleteItem}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      setError(`Error deleting item: ${err.message}`);
    }
  };

  // Set up item for editing
  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Update an item
  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (!editingItem.name.trim()) {
      alert('Item name is required!');
      return;
    }

    try {
      const response = await fetch(`${API.updateItem}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const updatedItem = await response.json();

      setItems(
        items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );

      setEditingItem(null);
    } catch (err) {
      setError(`Error updating item: ${err.message}`);
    }
  };

  // Load items when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Cloud Functions + Firestore Demo</h1>
        <p>
          Google Cloud Platform Demo with{' '}
          <span className="green-text">Firestore</span> + React
        </p>
      </header>

      <main>
        <section className="form-section">
          {editingItem ? (
            <>
              <h2>Edit Item</h2>
              <form onSubmit={handleUpdateItem}>
                <div className="form-group">
                  <label htmlFor="edit-name">Name:</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description:</label>
                  <textarea
                    id="edit-description"
                    value={editingItem.description || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="button-group">
                  <button type="submit" className="update-btn">
                    Update Item
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2>Add New Item</h2>
              <form onSubmit={handleCreateItem}>
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                  />
                </div>

                <button type="submit">Create Item</button>
              </form>
            </>
          )}
        </section>

        <section className="items-section">
          <h2>Items</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="error">{error}</div>
          ) : items.length === 0 ? (
            <p>No items found. Add one above!</p>
          ) : (
            <ul className="items-list">
              {items.map((item) => (
                <li key={item.id} className="item-card">
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <small>
                      Created: {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="item-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
