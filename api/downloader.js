const nexo = require("nexo-aio-downloader");

exports.config = {
    name: 'downloader',
    author: 'Zishin Sama',
    description: 'Downloads media from various platforms such as Twitter, Instagram, Facebook, etc.',
    category: 'tools',
    usage: ['/downloader?url=']
};

const supportedPlatforms = {
    twitter: ["twitter.com", "x.com"],
    instagram: ["instagram.com"],
    facebook: ["facebook.com", "facebook.com/share/v/"],
    tiktok: ["tiktok.com", "vt.tiktok.com"],
    "google-drive": ["drive.google.com"],
    sfile: ["sfile.mobi"]
};

// Function to detect the platform and normalize the URL
const detectPlatformAndNormalizeUrl = (url) => {
    const platform = Object.keys(supportedPlatforms).find(platformKey =>
        supportedPlatforms[platformKey].some(pattern => url.includes(pattern))
    );

    if (platform) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        return { platform, url: url.replace(/^https?:\/\/(www\.)?/, 'https://') };
    }
    return { platform: null, url };
};

exports.initialize = async function ({ req, res }) {
    // Set the response header to application/json
    res.setHeader('Content-Type', 'application/json');

    try {
        const rawUrl = req.query.url;

        if (!rawUrl) {
            return res.send(JSON.stringify({ error: "Missing 'url' parameter. url=<your_link>" }, null, 2));
        }

        const { platform, url } = detectPlatformAndNormalizeUrl(rawUrl);
        if (!platform) {
            return res.send(JSON.stringify({ error: "Unsupported or invalid URL. Supported platforms: Twitter, Instagram, Facebook, TikTok, Google Drive, Sfile" }, null, 2));
        }

        // Attempt to download the media from the detected platform
        let result;
        switch (platform) {
            case 'twitter':
                result = await nexo.twitter(url);
                break;
            case 'instagram':
                result = await nexo.instagram(url);
                break;
            case 'facebook':
                result = await nexo.facebook(url);
                break;
            case 'tiktok':
                result = await nexo.tiktok(url);
                break;
            case 'google-drive':
                result = await nexo.googleDrive(url);
                break;
            case 'sfile':
                result = await nexo.sfile(url);
                break;
            default:
                return res.send(JSON.stringify({ error: "Unsupported URL" }, null, 2));
        }

        // Send the response with the platform and result
        return res.send(JSON.stringify({ platform, content: result }, null, 2));
    } catch (error) {
        console.error("Error downloading media from platform:", error);
        return res.send(JSON.stringify({ error: "Failed to download media. Please ensure the URL is correct and try again." }, null, 2));
    }
};
