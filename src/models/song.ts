import { Schema, model } from 'mongoose';

const songSchema = new Schema({
  number: { type: String, required: true }, // A1, B2 etc.
  label: { type: String, required: true },
  length: { type: Number },  // milliseconds
  vinyl: { type: Schema.Types.ObjectId, ref: 'Vinyl', required: true },
  artists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }]
});

const Song = model('Song', songSchema);

export default Song;