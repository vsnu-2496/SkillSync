const axios = require('axios');

const testApi = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/questions/ping');
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
  }
};

testApi();
