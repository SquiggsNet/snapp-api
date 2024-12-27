import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import Artist from '../../models/artist';
import Vinyl from '../../models/vinyl';
import Song from '../../models/song';

const mongoURI = 'mongodb://localhost:27017/snapp';

const importCSVData = async () => {
  const artistsMap = new Map<string, any>();
  const vinylsMap = new Map<string, any>();

  const processRow = async (row: any) => {
    const { Album, Artist: artistName, Disc: disc, Side: side, Song: songName, Length } = row;

    let artist = artistsMap.get(artistName);
    if (!artist) {
      artist = new Artist({ label: artistName, vinyls: [], songs: [] });
      await artist.save();
      artistsMap.set(artistName, artist);
    }

    let vinyl = vinylsMap.get(Album);
    if (!vinyl) {
      vinyl = new Vinyl({ label: Album, artist: [artist._id], songs: [] });
      await vinyl.save();
      vinylsMap.set(Album, vinyl);
      artist.vinyls.push(vinyl._id);
      await artist.save();
    }

    const song = new Song({ disc, label: songName, length: Length || 'Unknown', side, vinyl: vinyl._id, artists: [artist._id] });
    await song.save();
    vinyl.songs.push(song._id);
    await vinyl.save();
    artist.songs.push(song._id);
    await artist.save();
  };

  return new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream('src/records-exploration-ideation.csv')
      .pipe(csv())
      .on('data', (row) => {
        stream.pause(); // Pause the stream to process the current row
        processRow(row).then(() => {
          stream.resume(); // Resume the stream after processing the row
        }).catch((error) => {
          stream.destroy(error); // Destroy the stream on error
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

mongoose.connect(mongoURI).then(async () => {
  console.log('Connected to MongoDB');
  try {
    await importCSVData();
  } catch (error) {
    console.error('Error processing CSV file', error);
  } finally {
    await mongoose.disconnect();
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});