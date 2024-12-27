import mongoose from 'mongoose';
import Artist from '../../models/artist';
import Vinyl from '../../models/vinyl';
import Song from '../../models/song';

const mongoURI = 'mongodb://localhost:27017/snapp';

async function fixRelationships() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all songs
    const songs = await Song.find({}).lean();
    console.log(`Found ${songs.length} songs`);

    // Group by vinyl
    const vinylGroups = new Map();
    for (const song of songs) {
      const vinylId = song.vinyl.toString();
      if (!vinylGroups.has(vinylId)) {
        vinylGroups.set(vinylId, []);
      }
      vinylGroups.get(vinylId).push(song._id);
    }

    // Update vinyls
    console.log(`Updating ${vinylGroups.size} vinyls`);
    for (const [vinylId, songIds] of vinylGroups) {
      const result = await Vinyl.findByIdAndUpdate(
        vinylId,
        { songs: songIds },
        { new: true }
      );
      console.log(`Updated vinyl ${vinylId} with ${result?.songs?.length || 0} songs`);
    }

    // Group by artist
    const artistGroups = new Map();
    for (const song of songs) {
      for (const artistId of song.artists) {
        if (!artistGroups.has(artistId.toString())) {
          artistGroups.set(artistId.toString(), {
            songs: new Set(),
            vinyls: new Set()
          });
        }
        const group = artistGroups.get(artistId.toString());
        group.songs.add(song._id);
        group.vinyls.add(song.vinyl);
      }
    }

    // Update artists
    console.log(`Updating ${artistGroups.size} artists`);
    for (const [artistId, refs] of artistGroups) {
      const result = await Artist.findByIdAndUpdate(
        artistId,
        {
          songs: Array.from(refs.songs),
          vinyls: Array.from(refs.vinyls)
        },
        { new: true }
      );
      console.log(`Updated artist ${artistId} with ${result?.songs?.length || 0} songs and ${result?.vinyls?.length || 0} vinyls`);
    }

    // Verify updates
    const sampleVinyl = await Vinyl.findOne({}).lean();
    const sampleArtist = await Artist.findOne({}).lean();

    console.log('Sample vinyl after update:', {
      id: sampleVinyl?._id,
      songCount: sampleVinyl?.songs?.length || 0
    });
    console.log('Sample artist after update:', {
      id: sampleArtist?._id,
      songCount: sampleArtist?.songs?.length || 0,
      vinylCount: sampleArtist?.vinyls?.length || 0
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the fix
fixRelationships().catch(console.error);