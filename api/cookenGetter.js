const axios = require('axios');

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
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-language': 'en_US',
                'cache-control': 'max-age=0',
                'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': 'Windows',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1'
            }
        });

        const response = await session.get(url);
        const inspect = bs(response_body.text, 'html.parser')
      lsd_key = inspect.find('input', {'name': 'lsd'})['value']
      jazoest_key = inspect.find('input', {'name': 'jazoest'})['value']
      m_ts_key = inspect.find('input', {'name': 'm_ts'})['value']
      li_key = inspect.find('input', {'name': 'li'})['value']
      try_number_key = inspect.find('input', {'name': 'try_number'})['value']
      unrecognized_tries_key = inspect.find('input', {'name': 'unrecognized_tries'})['value']
      bi_xrwh_key = inspect.find('input', {'name': 'bi_xrwh'})['value']

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
        'authority': 'business.facebook.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'cache-control': 'max-age=0',
        'cookie': cookie,
        'referer': 'https://www.facebook.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.1.2; GT-I8552 Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36',
        'sec-ch-ua': '"Not?A_Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
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

exports.initialize = async ({ req, res }) => {
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