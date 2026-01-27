import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: String, // Storing as string YYYY-MM-DD for simplicity based on existing app
    time: String,
    venueId: { type: String, ref: 'Venue' },
    price: Number,
    image: String,
    category: String
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
