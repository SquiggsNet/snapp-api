import { createResourceRouter } from '../utils/route-factory';
import Vinyl from '../models/vinyl';

export default createResourceRouter({
  model: Vinyl,
  type: 'vinyl',
  relationshipMap: {
    artists: ['artist'],
    songs: ['song']
  }
});