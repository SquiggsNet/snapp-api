import { Schema, model } from 'mongoose';

const vinylSchema = new Schema({
  label: { type: String, required: true },
  artists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
});

const Vinyl = model('Vinyl', vinylSchema);

export default Vinyl;