import React, { useEffect, useState } from 'react';
import '../style/menu.css';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item: '', price: '', required_points: '' });
  const [editingItem, setEditingItem] = useState(null); // for popup

  const fetchMenu = async () => {
    const res = await fetch('http://127.0.0.1:5000/list_menu', {
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
    const res = await fetch('http://127.0.0.1:5000/menu', {
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
    await fetch(`http://127.0.0.1:5000/update_menu/${editingItem.id}`, {
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
    await fetch(`http://127.0.0.1:5000/delete_item/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchMenu();
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <h3>Add item to the menu</h3>
        <div className="menu-form">
          <input name="item" placeholder="Item" value={form.item} onChange={handleInputChange} />
          <input name="price" placeholder="Price" value={form.price} onChange={handleInputChange} />
          <input
            name="required_points"
            placeholder="Points (0-100)"
            value={form.required_points}
            onChange={handleInputChange}
          />
          <button onClick={createItem}>Add</button>
        </div>

        {items.length > 0 ? (
          <ul className="menu-list">
            {items.map((item) => (
              <li key={item.id}>
                <span className="menu-item">
              <strong>{item.name}</strong> | 
              <span className="price">${item.price.toFixed(2)}</span> | 
              <span className="points"><strong>Required Points:</strong> {item.required_points}</span>
              </span>
                <div>
                  <button onClick={() => openEditPopup(item)}>Edit</button>
                  <button onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-items">No items to show.</p>
        )}
      </div>

      {editingItem && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Edit Menu Item</h3>
            <input
              name="name"
              placeholder="Item Name"
              value={editingItem.name}
              onChange={handleEditChange}
            />
            <input
              name="price"
              placeholder="Price"
              value={editingItem.price}
              onChange={handleEditChange}
            />
            <input
              name="required_points"
              placeholder="Required Points"
              value={editingItem.required_points}
              onChange={handleEditChange}
            />
            <div className="popup-buttons">
              <button className="save" onClick={saveEdit}>Save</button>
              <button className="cancel" onClick={closeEditPopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
