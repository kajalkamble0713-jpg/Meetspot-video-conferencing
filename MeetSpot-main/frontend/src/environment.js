// Use environment variable if available, otherwise use default
const server = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
        ? "https://meetspotbackend.onrender.com" 
        : "http://localhost:8000");

export default server;
