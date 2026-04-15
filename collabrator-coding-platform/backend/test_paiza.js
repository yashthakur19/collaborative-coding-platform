const axios = require('axios');

async function testPaiza() {
  try {
    const res = await axios.post('http://api.paiza.io/runners/create', {
      source_code: 'console.log("hello paiza");',
      language: 'javascript',
      api_key: 'guest'
    });
    
    console.log("Created:", res.data);
    
    let details;
    while(true) {
      await new Promise(r => setTimeout(r, 1000));
      const res2 = await axios.get(`http://api.paiza.io/runners/get_details?id=${res.data.id}&api_key=guest`);
      details = res2.data;
      if (details.status === 'completed') break;
    }
    
    console.log("Details:", details.stdout);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testPaiza();
