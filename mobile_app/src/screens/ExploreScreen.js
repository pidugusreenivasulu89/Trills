import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Star, Filter, Search } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function ExploreScreen({ navigation }) {
    const [venues, setVenues] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await axios.get(ENDPOINTS.VENUES);
            setVenues(res.data);
        } catch (e) { console.log(e); }
    };

    const filtered = filter === 'all' ? venues : venues.filter(v => v.type === filter);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput placeholder="Search venues..." style={styles.searchInput} placeholderTextColor="#94a3b8" />
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
                            <Text style={styles.cardMeta}>{venue.category} • Budget {venue.priceRange}</Text>
                            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('VenueDetail', { venue })}>
                                <Text style={styles.bookBtnText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    filters: { flexDirection: 'row' },
    filterBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', marginRight: 10, backgroundColor: '#f1f5f9' },
    activeFilter: { backgroundColor: '#4B184C' },
    filterText: { fontWeight: '600', color: '#64748b' },
    activeFilterText: { color: '#fff' },
    list: { padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    cardImg: { width: '100%', height: 180 },
    cardBody: { padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardName: { fontSize: 18, fontWeight: '700' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
    cardMeta: { color: '#64748b', fontSize: 14, marginTop: 4 },
    bookBtn: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    bookBtnText: { color: '#4B184C', fontWeight: '700', textAlign: 'center' }
});
