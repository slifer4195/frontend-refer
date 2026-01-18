import React, { useEffect, useState } from 'react';
import '../style/menu.css';
import API_URL from '../config/api';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item: '', price: '', required_points: '' });
  const [editingItem, setEditingItem] = useState(null); // for popup

  const fetchMenu = async () => {
    const res = await fetch(`${API_URL}/list_menu`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!data.error) setItems(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createItem = async () => {
    const res = await fetch(`${API_URL}/menu`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: form.item,
        price: parseFloat(form.price),
        required_points: parseInt(form.required_points),
      }),
    });
    if (res.ok) {
      setForm({ item: '', price: '', required_points: '' });
      fetchMenu();
    }
  };

  const openEditPopup = (item) => {
    setEditingItem({ ...item }); // copy so we can edit without instantly updating
  };

  const closeEditPopup = () => {
    setEditingItem(null);
  };

  const handleEditChange = (e) => {
    setEditingItem({ ...editingItem, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    await fetch(`${API_URL}/update_menu/${editingItem.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: editingItem.name,
        price: parseFloat(editingItem.price),
        required_points: parseInt(editingItem.required_points),
      }),
    });
    setEditingItem(null);
    fetchMenu();
  };

  const deleteItem = async (id) => {
    await fetch(`${API_URL}/delete_item/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchMenu();
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <h1 className="menu-page-title">Menu Management</h1>
        <div className="add-item-section">
          <h3 className="add-item-title">Add New Item</h3>
          <div className="menu-form">
            <div className="form-group">
              <label>Item Name</label>
              <input name="item" placeholder="e.g., Free Coffee" value={form.item} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Required Points</label>
              <input
                name="required_points"
                type="number"
                placeholder="e.g., 10"
                value={form.required_points}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={createItem} className="add-item-btn">Add Item</button>
          </div>
        </div>

        <div className="menu-items-section">
          <h3 className="menu-items-title">Menu Items ({items.length})</h3>
          {items.length > 0 ? (
            <ul className="menu-list">
              {items.map((item) => (
                <li key={item.id} className="menu-item-card">
                  <div className="menu-item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <div className="item-details">
                      <div className="detail-badge points-badge">
                        <span className="detail-label">Points</span>
                        <span className="detail-value">{item.required_points}</span>
                      </div>
                      <div className="detail-badge price-badge">
                        <span className="detail-label">Price</span>
                        <span className="detail-value">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="menu-item-actions">
                    <button onClick={() => openEditPopup(item)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="delete-btn">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-items">
              <p>No menu items yet. Add your first item above!</p>
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="popup-overlay" onClick={closeEditPopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-title">Edit Menu Item</h3>
            <div className="popup-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  name="name"
                  placeholder="Item Name"
                  value={editingItem.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editingItem.price}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Required Points</label>
                <input
                  name="required_points"
                  type="number"
                  placeholder="Required Points"
                  value={editingItem.required_points}
                  onChange={handleEditChange}
                />
              </div>
            </div>
            <div className="popup-buttons">
              <button className="save" onClick={saveEdit}>Save Changes</button>
              <button className="cancel" onClick={closeEditPopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
