import { createResourceRouter } from '../utils/route-factory';
import Song from '../models/song';

export default createResourceRouter({
  model: Song,
  type: 'song',
  relationshipMap: {
    vinyl: ['vinyl'],
    artists: ['artist'],
  }
});