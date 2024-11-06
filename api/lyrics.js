const { fetchQueryDetails, fetchLyrics } = require('searchlyrics');

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
  const song = req.query.q;

  if (!song) {
    return res.status(400).header('Content-Type', 'application/json').send(
      JSON.stringify({
        data: { error: 'Query parameter "q" is required' }
      }, null, 2)
    );
  }

  try {
    // Fetch song details based on query
    const queryResponse = await fetchQueryDetails(song);

    if (queryResponse.status !== 200 || !queryResponse.data.length) {
      return res.status(404).header('Content-Type', 'application/json').send(
        JSON.stringify({
          data: { error: 'Lyrics not found' }
        }, null, 2)
      );
    }

    // Get the first result's details
    const songDetails = queryResponse.data[0];

    // Fetch lyrics for the song
    const lyricsResponse = await fetchLyrics(songDetails.lyricsPath);

    // Return song details with lyrics after the artist
    res.header('Content-Type', 'application/json').send(
      JSON.stringify({
        data: {
          title: songDetails.songTitle,
          artist: songDetails.artistName,
          lyrics: lyricsResponse.lyrics,
          releaseDate: songDetails.releaseDate,
          thumbnail: songDetails.thumbnail,
          image: lyricsResponse.image
        },
        author: exports.config.author
      }, null, 2)
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).header('Content-Type', 'application/json').send(
      JSON.stringify({
        data: { error: 'An error occurred while fetching lyrics' }
      }, null, 2)
    );
  }
};
