const express = require('express');
const lyricFinder = require('lyric-finder');

const app = express();
const port = 3000;

// Exporting config for the command
exports.config = {
    name: 'lyrics',
    author: 'Zishin Sama',
    description: 'Search for song lyrics based on song title.',
    category: 'search',
    usage: ['/lyrics?q=Rizzler'],
};

// Initialize function for the lyrics command
exports.initialize = async function ({ req, res }) {
    const { q } = req.query; // Expecting a query like ?q=song_title

    // Set the response header to application/json
    res.setHeader('Content-Type', 'application/json');

    if (!q) {
        return res.send(JSON.stringify({ error: "Please provide a query using ?q=song_title" }, null, 2));
    }

    try {
        // Use lyricFinder to find the lyrics
        const lyrics = await lyricFinder('', q); // No artist name provided, just the song title

        if (!lyrics) {
            return res.send(JSON.stringify({ error: "Lyrics not found." }, null, 2));
        }

        // Send the found lyrics in the response
        return res.send(JSON.stringify({ lyrics }, null, 2));
    } catch (error) {
        console.error("Error fetching lyrics:", error);
        return res.send(JSON.stringify({ error: "Failed to fetch lyrics." }, null, 2));
    }
};

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
