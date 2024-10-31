const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

exports.config = {
    name: 'ngl',
    author: 'Zishin Sama',
    description: 'Spam NGL anonymous messages to specific target',
    category: 'tools',
    usage: ['/ngl?u=&m=&a='],
};

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 8.0.0; en-us; SM-G935F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36',
];

let successCount = 0;
let failureCount = 0;

// Function to send POST request
const sendPostRequest = async (username, question) => {
    const deviceId = uuidv4();
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const data = `username=${encodeURIComponent(username)}&question=${encodeURIComponent(question)}&deviceId=${deviceId}&gameSlug=&referrer=`;

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': userAgent,
        'Referer': 'https://ngl.link/',
        'Origin': 'https://ngl.link',
    };

    try {
        await axios.post('https://ngl.link/api/submit', data, {
            headers,
            timeout: 10000,
        });
        successCount++;
    } catch (error) {
        failureCount++;
    }
};

exports.initialize = async ({ req, res }) => {
    const { u: user, m: message, a: amount } = req.query;

    // Validate required parameters
    if (!user || !message || !amount) {
        return res.status(400).send(JSON.stringify({
            result: {
                status: 400,
                message: 'Missing required query parameters: user, message, amount.',
                author: exports.config.author,
            },
        }, null, 2));
    }

    const requests = parseInt(amount, 10);
    if (isNaN(requests) || requests <= 0) {
        return res.status(400).send(JSON.stringify({
            result: {
                status: 400,
                message: 'Amount must be a positive integer.',
                author: exports.config.author,
            },
        }, null, 2));
    }

    // Sending requests
    for (let i = 0; i < requests; i++) {
        await sendPostRequest(user, message);
    }

    res.send(JSON.stringify({
        result: {
            status: 200,
            message: `Spamming to [${user}] completed with ${successCount} success out of ${requests} attempts.`,
            author: exports.config.author,
        },
    }, null, 2));
};