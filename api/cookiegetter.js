const axios = require('axios');

exports.config = {
    name: 'cookie',
    description: 'Retrieve Facebook session cookie using login credentials',
    usage: ['/cookie?email=&password='],
    author: 'Zishin Sama',
    category: 'tools'
};

async function getUserCookie(email, password) {
    const url = 'https://m.facebook.com';
    const loginUrl = `${url}/login.php`;

    try {
        const session = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 4.1.2; GT-I8552 Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-language': 'en_US',
                'cache-control': 'max-age=0'
            }
        });

        // Step 1: Get initial login page to retrieve cookies and hidden inputs
        const response = await session.get(url);
        const body = response.data;

        // Extract hidden input values for login form submission
        const lsd = body.match(/name="lsd" value="(.*?)"/)?.[1];
        const jazoest = body.match(/name="jazoest" value="(.*?)"/)?.[1];
        const m_ts = body.match(/name="m_ts" value="(.*?)"/)?.[1];
        const li = body.match(/name="li" value="(.*?)"/)?.[1];

        // Step 2: Prepare data payload with extracted hidden inputs
        const data = new URLSearchParams({
            lsd: lsd,
            jazoest: jazoest,
            m_ts: m_ts,
            li: li,
            email: email,
            pass: password,
            login: 'submit'
        });

        // Step 3: Submit login form
        const loginResponse = await session.post(loginUrl, data);

        // Retrieve the set-cookie header if login is successful
        const cookies = loginResponse.headers['set-cookie'];
        if (!cookies) return null;

        // Step 4: Parse cookies into structured format
        const cookieArray = cookies.map(cookie => {
            const parts = cookie.split('; ');
            const keyValue = parts[0].split('=');
            const key = keyValue[0];
            const value = keyValue[1];

            return {
                key: key,
                value: value,
                path: parts.find(part => part.startsWith('path='))?.split('=')[1] || '/',
                hostOnly: !parts.find(part => part.includes('Domain')),
                domain: '.facebook.com',
                creation: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
        });

        return cookieArray;
    } catch (error) {
        console.error('Error fetching user cookie:', error.message);
        return null;
    }
}

exports.initialize = async ({ req, res }) => {
    const { email, password } = req.query;

    // Check if email and password are provided
    if (!email || !password) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ error: 'Email and password are required' }, null, 2));
    }

    try {
        const cookieArray = await getUserCookie(email, password);

        if (!cookieArray) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).send(JSON.stringify({ error: 'Failed to retrieve user cookie' }, null, 2));
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({
            data: cookieArray
        }, null, 2));
    } catch (error) {
        console.error('Internal Server Error:', error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify({ error: 'Internal Server Error' }, null, 2));
    }
};