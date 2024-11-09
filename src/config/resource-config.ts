import Artist from '../models/artist';
import Vinyl from '../models/vinyl';
import Song from '../models/song';

export const resourceConfigs = {
  artist: {
    model: Artist,
    type: 'artist',
    relationshipMap: {
      vinyls: ['vinyl'],
      songs: ['song']
    }
  },
  vinyl: {
    model: Vinyl,
    type: 'vinyl',
    relationshipMap: {
      artists: ['artist'],
      songs: ['song']
    }
  },
  song: {
    model: Song,
    type: 'song',
    relationshipMap: {
      vinyl: ['vinyl'],
      artists: ['artist']
    }
  }
};