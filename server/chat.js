const axios = require('axios');
const fs = require('fs');

async function* generateTextStream(prompt) {
    let data = JSON.stringify({
        "model": "deepseek-coder:6.7b",
        "prompt": prompt
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:11434/api/generate',
        headers: { 
            'Content-Type': 'application/json'
        },
        data: data,
        responseType: 'stream'
    };

    const response = await axios.request(config);
    for await (const chunk of response.data) {
        try {
            const parsed = JSON.parse(chunk.toString());
            yield parsed.response;
        } catch (_) {
            // handle partial chunks or invalid JSON
        }
    }
}

module.exports = { generateTextStream };

// Example usage: read tokens as they arrive
// (async () => {
//     for await (const output of generateTextStream("why sky is blue")) {
//         process.stdout.write(output);
//     }
// })();
