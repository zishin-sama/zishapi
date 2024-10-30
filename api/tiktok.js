const axios = require("axios");

exports.config = {
    name: 'tiktok',
    author: 'Zishin Sama',
    description: 'Download Tiktok Video',
    category: 'tools',
    usage: ['/tiktok?url=https://vt.tiktok.com/ZSjY1k4KH/']
};

exports.initialize = async function ({ req, res }) {
    // Set the response header to application/json
    res.setHeader('Content-Type', 'application/json');

    try {
        const link = req.query.url;
        if (!link) {
            return res.send(JSON.stringify({ error: "Missing url parameter or missing value." }, null, 2));
        }

        const response = await axios({
            method: 'POST',
            url: 'https://tikwm.com/api/feed/search',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'current_language=en',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
            },
            data: {
                keywords: link,
                count: 50,
                cursor: 0,
                HD: 1
            }
        });

        const videos = response.data.data.videos;
        if (videos.length === 0) {
            return res.send(JSON.stringify({ error: "No videos found." }, null, 2));
        }

        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee];

        const result = {
            title: videorndm.title,
            cover: videorndm.cover,
            origin_cover: videorndm.origin_cover,
            no_watermark: videorndm.play,
            watermark: videorndm.wmplay,
            music: videorndm.music
        };

        // Send the result as a JSON response
        res.send(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error fetching TikTok videos:", error);
        res.send(JSON.stringify({ error: "Failed to fetch TikTok videos" }, null, 2));
    }
};
