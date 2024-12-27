import { Schema, model } from 'mongoose';

const vinylSchema = new Schema({
  label: { type: String, required: true },
  year: { type: String, required: true },
  format: {
    size: { type: String, enum: ['7', '10', '12'], required: true },
    speed: { type: String, enum: ['33', '45', '78'], required: true }
  },
  country: String,
  artists: [{ type: Schema.Types.ObjectId, ref: 'Artist', required: true }],
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
});

const Vinyl = model('Vinyl', vinylSchema);

export default Vinyl;