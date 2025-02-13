import axios from 'axios';

export async function* generateTextStream(prompt) {
    let data = JSON.stringify({
        "model": "deepseek-coder:1.3b",
        "model": "deepseek-coder:latest",
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
