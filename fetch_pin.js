const https = require('https');

const url = 'https://www.pinterest.com/pin/1131177631449821124/';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Searching content for video or other links...');
    
    // Look for mp4
    const mp4Links = data.match(/https:\/\/[a-zA-Z0-9.-]+\.pinimg\.com\/[a-zA-Z0-9_./-]+\.mp4/gi) || [];
    console.log('MP4 links:', Array.from(new Set(mp4Links)));
    
    // Look for originals
    const originals = data.match(/https:\/\/[a-zA-Z0-9.-]+\.pinimg\.com\/originals\/[a-zA-Z0-9_./-]+/gi) || [];
    console.log('Originals links:', Array.from(new Set(originals)));

    // Look for pinimg links
    const pinimg = data.match(/https:\/\/[a-zA-Z0-9.-]+\.pinimg\.com\/[a-zA-Z0-9_./-]+/gi) || [];
    const filtered = pinimg.filter(l => l.includes('fb/7c/9c') || l.includes('fb7c9c'));
    console.log('Related links:', Array.from(new Set(filtered)));
  });
}).on('error', (err) => {
  console.error('Error fetching pin:', err);
});
