import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Artist from '../../models/artist';
import Vinyl from '../../models/vinyl';
import Song from '../../models/song';

const mongoURI = 'mongodb://localhost:27017/snapp';

type MusicBrainzData = {
  title: string;
  'artist-credit': Array<{
    artist: {
      name: string;
      type: string;
    };
  }>;
  media: Array<{
    tracks: Array<{
      number: string;
      title: string;
      length: number;
      'artist-credit'?: Array<{ artist: { name: string } }>;
    }>;
  }>;
  country?: string;
  'release-events'?: Array<{ date: string }>;
};

async function importJSONFile(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData: MusicBrainzData = JSON.parse(fileContent);

    // Extract main artists
    const artistDocs = await Promise.all(
      jsonData['artist-credit'].map(credit => 
        Artist.findOneAndUpdate(
          { label: credit.artist.name },
          { 
            label: credit.artist.name,
            type: credit.artist.type as 'Person' | 'Group'
          },
          { upsert: true, new: true }
        )
      )
    );

    // Create vinyl record
    const vinyl = await Vinyl.create({
      label: jsonData.title,
      year: jsonData['release-events']?.[0]?.date?.split('-')[0] || '',
      format: {
        size: '12', // Default values
        speed: '33'
      },
      country: jsonData.country,
      artists: artistDocs.map(a => a._id)
    });

    // Create songs
    if (jsonData.media?.[0]?.tracks) {
      await Promise.all(
        jsonData.media[0].tracks.map(async trackData => {
          // Handle song-specific artists if they exist
          const songArtists = trackData['artist-credit'] 
            ? await Promise.all(
                trackData['artist-credit'].map(credit =>
                  Artist.findOneAndUpdate(
                    { label: credit.artist.name },
                    { label: credit.artist.name, type: 'Person' },
                    { upsert: true, new: true }
                  )
                )
              )
            : artistDocs; // Use main artists if no song-specific artists

          return Song.create({
            number: trackData.number,
            label: trackData.title,
            length: trackData.length,
            vinyl: vinyl._id,
            artists: songArtists.map(a => a._id)
          });
        })
      );
    }

    console.log(`Imported: ${jsonData.title}`);
    return vinyl;
  } catch (error) {
    console.error(`Error importing ${filePath}:`, error);
    throw error;
  }
}

async function importAllJSON() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const jsonDir = path.join(__dirname, './json-data');
    const files = await fs.readdir(jsonDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      await importJSONFile(path.join(jsonDir, file));
    }

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importAllJSON();