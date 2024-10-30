const axios = require('axios');
const cheerio = require('cheerio');

exports.config = {
    name: 'cooken',
    description: 'Get Facebook cookie and access token via login credentials',
    usage: ['/cooken?email=&password='],
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
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
            }
        });

        const response = await session.get(url);
        const $ = cheerio.load(response.data);

        const data = {
            lsd: $('input[name="lsd"]').val(),
            jazoest: $('input[name="jazoest"]').val(),
            m_ts: $('input[name="m_ts"]').val(),
            li: $('input[name="li"]').val(),
            try_number: $('input[name="try_number"]').val(),
            unrecognized_tries: $('input[name="unrecognized_tries"]').val(),
            bi_xrwh: $('input[name="bi_xrwh"]').val(),
            email: email,
            pass: password,
            login: 'submit'
        };

        const loginResponse = await session.post(loginUrl, new URLSearchParams(data));
        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        return cookieString.includes('c_user') ? cookieString : null;
    } catch (error) {
        console.error('Error fetching user cookie:', error.message);
        return null;
    }
}

async function getFacebookToken(cookie) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.1.2; GT-I8552 Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
        'Cookie': cookie,
        'Referer': 'https://www.facebook.com/'
    };

    try {
        const response = await axios.get('https://business.facebook.com/content_management', { headers });
        const tokenMatch = response.data.match(/EAAG\w+/);
        return tokenMatch ? tokenMatch[0] : null;
    } catch (error) {
        console.error('Error fetching Facebook token:', error.message);
        return null;
    }
}

exports.initialize = async ({req, res}) => {
    const { email, password } = req.query;

    // Check if email and password are provided
    if (!email || !password) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ error: 'Email and password are required' }, null, 2));
    }

    try {
        const cookie = await getUserCookie(email, password);

        if (!cookie) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).send(JSON.stringify({ error: 'Failed to retrieve user cookie' }, null, 2));
        }

        const accessToken = await getFacebookToken(cookie);

        if (!accessToken) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).send(JSON.stringify({ error: 'Failed to retrieve access token' }, null, 2));
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify({
            data: {
                cookie: cookie,
                accessToken: accessToken
            }
        }, null, 2));
    } catch (error) {
        console.error('Internal Server Error:', error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).send(JSON.stringify({ error: 'Internal Server Error' }, null, 2));
    }
};