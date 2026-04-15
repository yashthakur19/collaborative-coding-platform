const axios = require('axios');
async function testWand() {
    try {
        const r = await axios.post('https://wandbox.org/api/compile.json', { code: 'console.log("hello test");', compiler: 'nodejs-head' });
        console.log(r.data);
    } catch(e) {
        console.log(e.message);
    }
}
testWand();
