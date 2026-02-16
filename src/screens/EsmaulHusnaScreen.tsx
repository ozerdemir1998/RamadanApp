import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ESMAUL_HUSNA, Esma } from '../data/esmaulHusnaData';

const { width } = Dimensions.get('window');

export default function EsmaulHusnaScreen() {
    const [selectedEsma, setSelectedEsma] = useState<Esma | null>(null);

    // --- DETAY GÖRÜNÜMÜ ---
    if (selectedEsma) {
        return (
            <LinearGradient
                colors={['#0F2027', '#203A43', '#2C5364']}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setSelectedEsma(null)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                        <Text style={styles.backButtonText}>Listeye Dön</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>

                    {/* BÜYÜK İKON / ARAPÇA */}
                    <View style={styles.detailIconContainer}>
                        <Text style={styles.detailArabicText}>{selectedEsma.arabic}</Text>
                    </View>

                    {/* İSİM */}
                    <Text style={styles.detailName}>{selectedEsma.name}</Text>

                    {/* AYIRAÇ */}
                    <View style={styles.divider} />

                    {/* FAZİLET / ANLAM */}
                    <View style={styles.infoSection}>
                        <Text style={styles.label}>Anlamı & Fazileti</Text>
                        <Text style={styles.detailMeaning}>{selectedEsma.meaning}</Text>
                    </View>

                    {/* ZİKİR SAYISI */}
                    <View style={styles.zikirBox}>
                        <Text style={styles.zikirText}>
                            Bu güzel isim, <Text style={styles.zikirHighlight}>{selectedEsma.zikir}</Text> kez zikredilmelidir.
                        </Text>
                    </View>

                </ScrollView>
            </LinearGradient>
        );
    }

    // --- LİSTE GÖRÜNÜMÜ ---
    const renderItem = ({ item }: { item: Esma }) => {
        return (
            <TouchableOpacity
                style={styles.simpleCard}
                onPress={() => setSelectedEsma(item)}
                activeOpacity={0.7}
            >
                <View style={styles.simpleCardContent}>
                    <View style={styles.simpleArabicBox}>
                        <Text style={styles.simpleArabic} numberOfLines={1} adjustsFontSizeToFit>{item.arabic}</Text>
                    </View>
                    <View style={styles.verticalSeparator} />
                    <Text style={styles.simpleName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Esmaül Hüsna</Text>
                <Text style={styles.headerSubtitle}>En Güzel İsimler O'nundur</Text>
            </View>

            <FlatList
                data={ESMAUL_HUSNA}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                numColumns={1} // Tek sütun liste
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        minHeight: 80,
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: 24, fontWeight: 'bold', color: '#D4AF37',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    headerSubtitle: {
        fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 5, fontStyle: 'italic'
    },

    // BACK BUTTON
    backButton: {
        position: 'absolute', left: 20, bottom: 20,
        flexDirection: 'row', alignItems: 'center'
    },
    backButtonText: { color: '#D4AF37', marginLeft: 5, fontSize: 16 },

    listContent: { padding: 20 },

    // SIMPLE LIST CARD
    simpleCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    simpleCardContent: {
        flexDirection: 'row', alignItems: 'center', padding: 15
    },
    simpleArabicBox: {
        width: 95, // Uzun isimler için genişlik artırıldı
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10
    },
    simpleArabic: {
        color: '#D4AF37',
        fontSize: 26, // Sabit ve dengeli boyut
        textAlign: 'center',
        includeFontPadding: false,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    verticalSeparator: {
        width: 1,
        height: 40,
        backgroundColor: '#D4AF37',
        marginRight: 15,
        opacity: 0.5
    },
    simpleName: { color: '#fff', fontSize: 18, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    // DETAIL VIEW STYLES
    detailContent: {
        alignItems: 'center', padding: 30
    },
    detailIconContainer: {
        width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)',
        marginBottom: 30
    },
    detailArabicText: {
        fontSize: 60, color: '#D4AF37',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    detailName: {
        fontSize: 32, fontWeight: 'bold', color: '#fff',
        marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    divider: {
        width: 50, height: 2, backgroundColor: '#D4AF37', marginVertical: 20, opacity: 0.5
    },
    infoSection: {
        width: '100%', alignItems: 'center', marginBottom: 30
    },
    label: {
        fontSize: 14, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10
    },
    detailMeaning: {
        fontSize: 18, color: 'rgba(255,255,255,0.9)',
        textAlign: 'center', lineHeight: 28
    },
    zikirBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20, borderRadius: 16,
        width: '100%', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    zikirText: {
        fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center'
    },
    zikirHighlight: {
        color: '#D4AF37', fontWeight: 'bold', fontSize: 18
    }
});
