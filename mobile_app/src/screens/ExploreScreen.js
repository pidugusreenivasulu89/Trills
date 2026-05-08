import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Star, Search, Users, Clock, Briefcase } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function ExploreScreen({ navigation }) {
    const [venues, setVenues] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [spaceFilter, setSpaceFilter] = useState('any');
    const [seatFilter, setSeatFilter] = useState('any');
    const [timeFilter, setTimeFilter] = useState('any');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await axios.get(ENDPOINTS.VENUES);
            setVenues(res.data);
        } catch (e) { console.log(e); }
    };

    const spaceOptions = [
        { value: 'any', label: 'Any spot' },
        { value: 'meeting_room', label: 'Meeting room' },
        { value: 'single_chair', label: 'Desk' },
        { value: 'group_table', label: 'Team table' },
        { value: 'table', label: 'Dining table' },
    ];

    const seatOptions = [
        { value: 'any', label: 'Any size' },
        { value: '1', label: '1+' },
        { value: '2', label: '2+' },
        { value: '4', label: '4+' },
        { value: '6', label: '6+' },
        { value: '8', label: '8+' },
    ];

    const timeOptions = ['any', '09:00', '11:00', '14:00', '16:00', '19:00'];

    const filtered = venues.filter(venue => {
        const query = searchQuery.trim().toLowerCase();
        const matchesType = filter === 'all' || venue.type === filter;
        const matchesSearch = !query || [venue.name, venue.category, venue.description, venue.address]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(query));
        const matchesSpace = spaceFilter === 'any' || venue.tables?.some(asset => asset.type === spaceFilter);
        const matchesSeats = seatFilter === 'any' || venue.tables?.some(asset => Number(asset.capacity || 0) >= Number(seatFilter));
        const matchesTime = timeFilter === 'any' || venue.tables?.some(asset => asset.slots?.includes(timeFilter));

        return matchesType && matchesSearch && matchesSpace && matchesSeats && matchesTime;
    });

    const renderAssetLabel = (asset) => {
        if (asset.type === 'meeting_room') return 'Meeting room';
        if (asset.type === 'single_chair') return 'Desk';
        if (asset.type === 'group_table') return 'Team table';
        return 'Table';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search venues, areas, cuisines..."
                        style={styles.searchInput}
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
                    {['all', 'restaurant', 'coworking'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.filterBtn, filter === t && styles.activeFilter]}
                            onPress={() => setFilter(t)}
                        >
                            <Text style={[styles.filterText, filter === t && styles.activeFilterText]}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.filterGroup}>
                    <View style={styles.filterLabelRow}>
                        <Briefcase size={15} color="#64748b" />
                        <Text style={styles.filterLabel}>Space</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {spaceOptions.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.subFilterBtn, spaceFilter === option.value && styles.activeSubFilter]}
                                onPress={() => setSpaceFilter(option.value)}
                            >
                                <Text style={[styles.subFilterText, spaceFilter === option.value && styles.activeSubFilterText]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.filterGroup}>
                    <View style={styles.filterLabelRow}>
                        <Users size={15} color="#64748b" />
                        <Text style={styles.filterLabel}>Seats</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {seatOptions.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.compactBtn, seatFilter === option.value && styles.activeSubFilter]}
                                onPress={() => setSeatFilter(option.value)}
                            >
                                <Text style={[styles.subFilterText, seatFilter === option.value && styles.activeSubFilterText]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.filterGroup}>
                    <View style={styles.filterLabelRow}>
                        <Clock size={15} color="#64748b" />
                        <Text style={styles.filterLabel}>Time</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {timeOptions.map(time => (
                            <TouchableOpacity
                                key={time}
                                style={[styles.compactBtn, timeFilter === time && styles.activeSubFilter]}
                                onPress={() => setTimeFilter(time)}
                            >
                                <Text style={[styles.subFilterText, timeFilter === time && styles.activeSubFilterText]}>
                                    {time === 'any' ? 'Any' : time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {filtered.map(venue => (
                    <TouchableOpacity key={venue.id || venue._id} style={styles.card} onPress={() => navigation.navigate('VenueDetail', { venue })}>
                        <Image source={{ uri: venue.image }} style={styles.cardImg} />
                        <View style={styles.cardBody}>
                            <View style={styles.row}>
                                <Text style={styles.cardName}>{venue.name}</Text>
                                <View style={styles.rating}>
                                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                    <Text style={styles.ratingText}>{venue.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardMeta}>{venue.category} | Budget {venue.priceRange}</Text>
                            <View style={styles.assetRow}>
                                {(venue.tables || []).slice(0, 3).map(asset => (
                                    <Text key={`${venue.id || venue._id}-${asset.number}`} style={styles.assetChip}>
                                        {renderAssetLabel(asset)} | {asset.capacity}
                                    </Text>
                                ))}
                            </View>
                            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('VenueDetail', { venue })}>
                                <Text style={styles.bookBtnText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No matching spaces</Text>
                        <Text style={styles.emptyText}>Try a different seating type, time, or seat count.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: '#0f172a' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#0f172a' },
    filters: { flexDirection: 'row' },
    filterBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', marginRight: 10, backgroundColor: '#f1f5f9' },
    activeFilter: { backgroundColor: '#4B184C' },
    filterText: { fontWeight: '600', color: '#64748b' },
    activeFilterText: { color: '#fff' },
    filterGroup: { marginTop: 16 },
    filterLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    filterLabel: { color: '#64748b', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    subFilterBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8, backgroundColor: '#fff' },
    compactBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8, backgroundColor: '#fff' },
    activeSubFilter: { backgroundColor: '#4B184C', borderColor: '#4B184C' },
    subFilterText: { fontWeight: '700', color: '#475569', fontSize: 12 },
    activeSubFilterText: { color: '#fff' },
    list: { padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    cardImg: { width: '100%', height: 180 },
    cardBody: { padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    cardName: { fontSize: 18, fontWeight: '700', color: '#0f172a', flex: 1 },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
    cardMeta: { color: '#64748b', fontSize: 14, marginTop: 4 },
    assetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    assetChip: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, color: '#475569', fontSize: 11, fontWeight: '700' },
    bookBtn: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    bookBtnText: { color: '#4B184C', fontWeight: '700', textAlign: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    emptyText: { marginTop: 8, color: '#64748b', textAlign: 'center', lineHeight: 20 }
});
