// API Configuration
// Change this to switch between local and production environments

const API_URL = process.env.REACT_APP_API_URL || 'https://api.bluepoint.click';

// For local development, set REACT_APP_API_URL=http://127.0.0.1:5000 in .env file
// For production, this will use https://api.bluepoint.click

export default API_URL;
