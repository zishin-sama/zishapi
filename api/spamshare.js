const axios = require('axios');

function createHeaders(cookie) {
    return {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate',
        'connection': 'keep-alive',
        'content-length': '0',
        'cookie': cookie,
        'host': 'graph.facebook.com'
    };
}

exports.config = {
    name: 'ss',
    author: 'Zishin Sama',
    description: 'Facebook SpamShare',
    category: 'tools',
    usage: ['/ss?cookie=&link=&amount=&delay=']
};

async function isPostId(url) {
    try {
        const response = await axios.post('https://id.traodoisub.com/api.php', { link: url });
        const postId = response.data.id;
        return postId;
    } catch (error) {
        console.error("Error fetching post ID:", error.message);
        return null;
    }
}

async function isCookieAlive(cookie) {
    const headers = {
        'authority': 'business.facebook.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'cache-control': 'max-age=0',
        'cookie': cookie,
        'referer': 'https://www.facebook.com/',
        'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
    };

    try {
        const response = await axios.get('https://business.facebook.com/content_management', { headers });
        return response.status === 200;
    } catch (error) {
        console.error("Error checking if the cookie is alive:", error.message);
        return false;
    }
}

async function spamShare(cookie, link, amount, delay) {
    const postId = await isPostId(link);
    if (!postId) {
        return { success: false, message: "Invalid post link." };
    }

    const headers = createHeaders(cookie);
    const shareEndpoint = `https://graph.facebook.com/me/feed?link=https://m.facebook.com/${postId}&published=0`;

    const results = [];
    for (let i = 0; i < amount; i++) {
        try {
            const response = await axios.post(shareEndpoint, {}, { headers });
            results.push({ attempt: i + 1, status: response.status });
            // Delay between shares
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        } catch (error) {
            results.push({ attempt: i + 1, status: 'error', message: error.message });
            break;
        }
    }
    return { success: true, results };
}

// API endpoint
exports.initialize = async ({ req, res }) => {
    const { cookie, link, amount, delay } = req.query;

    // Validate parameters
    if (!cookie || !link || !amount || !delay) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ success: false, message: "Missing parameters." }, null, 2));
    }

    const validAmount = parseInt(amount);
    const validDelay = parseInt(delay);

    if (isNaN(validAmount) || isNaN(validDelay) || validAmount <= 0 || validDelay < 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ success: false, message: "Invalid amount or delay." }, null, 2));
    }

    // Check if the cookie is alive
    if (await isCookieAlive(cookie)) {
        const result = await spamShare(cookie, link, validAmount, validDelay);
        return res.json(result);
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).send(JSON.stringify({ success: false, message: "Cookie is not valid." }, null, 2));
    }
};