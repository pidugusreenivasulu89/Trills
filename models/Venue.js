import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['restaurant', 'coworking', 'event_space'], required: true },
    description: String,
    address: String,
    image: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    category: String,
    priceRange: { type: String, default: '$$' },
    capacity: { type: Number, default: 20 },
    bookedCount: { type: Number, default: 0 },
    layout: {
        rows: { type: Number, default: 5 },
        cols: { type: Number, default: 5 }
    },
    tables: [{
        number: Number,
        type: { type: String, enum: ['table', 'single_chair', 'meeting_room', 'group_table'], default: 'table' },
        capacity: Number,
        row: Number,
        col: Number,
        isWindowSide: { type: Boolean, default: false },
        isQuietZone: { type: Boolean, default: false },
        slots: { type: [String], default: [] }
    }],
    amenities: [String],
    website: String,
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '22:00' }
});

export default mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
