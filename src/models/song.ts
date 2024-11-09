import { Schema, model } from 'mongoose';

const songSchema = new Schema({
  disc: { type: Number },
  label: { type: String, required: true },
  length: { type: String },
  side: { type: String },
  vinyl: { type: Schema.Types.ObjectId, ref: 'Vinyl' },
  artists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }]
});

const Song = model('Song', songSchema);

export default Song;