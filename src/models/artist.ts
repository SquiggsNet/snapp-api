import { Schema, model } from 'mongoose';

const artistSchema = new Schema({
  type: { type: String, enum: ['Person', 'Group'], required: true },
  label: { type: String, required: true },
  vinyls: [{ type: Schema.Types.ObjectId, ref: 'Vinyl' }],
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
});

const Artist = model('Artist', artistSchema);

export default Artist;