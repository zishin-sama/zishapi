const CobaltAPI = require("cobalt-api");

exports.config = {
    name: 'downloaderV2',
    author: 'Zishin Sama',
    description: 'Downloads media from YouTube using CobaltAPI.',
    category: 'tools',
    usage: ['/downloaderV2?url=']
};

exports.initialize = async function ({ req, res }) {
    // Set the response header to application/json
    res.setHeader('Content-Type', 'application/json');

    try {
        let url = req.query.url;

        if (!url) {
            return res.send(JSON.stringify({ error: "Please add ?url=media_url_here" }, null, 2));
        }

        // Normalize the URL: ensure it starts with https://
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        const cobalt = new CobaltAPI(url);
        const result = await cobalt.sendRequest();

        if (result.status) {
            return res.send(JSON.stringify({ content: result.data }, null, 2));
        } else {
            return res.send(JSON.stringify({ error: "Download failed: " + result.text }, null, 2));
        }
    } catch (error) {
        console.error("Error downloading media:", error);
        return res.send(JSON.stringify({ error: "Failed to download media" }, null, 2));
    }
};
