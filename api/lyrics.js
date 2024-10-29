const { fetchQueryDetails, fetchLyrics } = require('searchlyrics');

exports.config = {
    name: 'lyrics',
    author: 'Zishin Sama',
    description: 'Search for song lyrics or details',
    category: 'search',
    usage: ['/lyrics?query=Last Rizzday Night Jelly House', '/lyrics?url=']
};

exports.initialize = async function ({ req, res }) {
    const { query, url } = req.query;

    if (query) {
        try {
            const response = await fetchQueryDetails(query);
            if (response.status === 200) {
                return res.json(response.data);
            } else {
                return res.status(404).json({ error: "No song details found." });
            }
        } catch (error) {
            console.error("Error fetching song details:", error);
            return res.status(500).json({ error: "Failed to fetch song details." });
        }
    }

    if (url) {
        try {
            const data = await fetchLyrics(url);
            return res.json({
                lyrics: data.lyrics,
                image: data.image
            });
        } catch (error) {
            console.error("Error fetching lyrics:", error);
            return res.status(500).json({ error: "Failed to fetch lyrics." });
        }
    }

    return res.status(400).json({
        error: "Please provide either ?query=song_name or ?url=any_song_lyrics_url"
    });
};