const CobaltAPI = require("cobalt-api");

exports.config = {
    name: 'downloaderV2',
    author: 'Zishin Sama',
    description: 'Downloads media from YouTube using CobaltAPI.',
    category: 'tools',
    usage: ['/downloaderV2?url=']
};

exports.initialize = async function ({ req, res }) {
    try {
        let url = req.query.url;

        if (!url) {
            return res.status(400).json({ error: "Please add ?url=media_url_here" });
        }

        // Normalize the URL: ensure it starts with https://
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        const cobalt = new CobaltAPI(url);
        const result = await cobalt.sendRequest();

        if (result.status) {
            res.json({ content: result.data });
        } else {
            return res.status(400).json({ error: "Download failed: " + result.text });
        }
    } catch (error) {
        console.error("Error downloading media:", error);
        res.status(500).json({ error: "Failed to download media" });
    }
};
