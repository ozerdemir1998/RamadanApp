
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';

const ICON_PATTERN = require('../../assets/icons/pattern.png');

const SURAHS = [
    { id: 1, title: 'Fatiha Suresi', subtitle: 'Her rekatta okunur (1. Sure)', arabicTitle: 'الفاتحة' },
    { id: 105, title: 'Fil Suresi', subtitle: 'Elem tera keyfe... (105. Sure)', arabicTitle: 'الفيل' },
    { id: 106, title: 'Kureyş Suresi', subtitle: 'Li iylâfi Kurayş... (106. Sure)', arabicTitle: 'قريش' },
    { id: 107, title: 'Maun Suresi', subtitle: 'Eraeytellezî... (107. Sure)', arabicTitle: 'الماعون' },
    { id: 108, title: 'Kevser Suresi', subtitle: 'İnnâ a\'taynâ... (108. Sure)', arabicTitle: 'الكوثر' },
    { id: 109, title: 'Kafirun Suresi', subtitle: 'Kul yâ eyyühel kâfirûn... (109. Sure)', arabicTitle: 'الكافرون' },
    { id: 110, title: 'Nasr Suresi', subtitle: 'İzâ câe nasrullah... (110. Sure)', arabicTitle: 'النصر' },
    { id: 111, title: 'Tebbet Suresi', subtitle: 'Tebbet yedâ ebî leheb... (111. Sure)', arabicTitle: 'المسد' },
    { id: 112, title: 'İhlas Suresi', subtitle: 'Kul hüvellâhü ehad... (112. Sure)', arabicTitle: 'الإخلاص' },
    { id: 113, title: 'Felak Suresi', subtitle: 'Kul eûzü birabbil felak... (113. Sure)', arabicTitle: 'الفلق' },
    { id: 114, title: 'Nas Suresi', subtitle: 'Kul eûzü birabbinnâs... (114. Sure)', arabicTitle: 'الناس' },
];

export default function NamazSureleriScreen() {
    const router = useRouter();

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Kuran Detay sayfasına yönlendir
                router.push({
                    pathname: '/quran-detail',
                    params: {
                        surahId: item.id,
                        surahName: item.title,
                        initialMode: 'list' // Liste modu varsayılan olsun
                    }
                });
            }}
        >
            <View style={styles.contentWrapper}>
                <View style={styles.arabicBox}>
                    <Text style={styles.arabicText}>{item.arabicTitle}</Text>
                    <View style={styles.verticalSeparator} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            <View style={styles.backgroundPatternContainer} pointerEvents="none">
                <Image
                    source={ICON_PATTERN}
                    style={[styles.bgPatternImage, { left: -150 }]}
                    contentFit="contain"
                    tintColor="#D4AF37"
                />
                <Image
                    source={ICON_PATTERN}
                    style={[styles.bgPatternImage, { right: -150 }]}
                    contentFit="contain"
                    tintColor="#D4AF37"
                />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScreenHeader
                    title="Namaz Sureleri"
                    onLeftPress={() => router.back()}
                    centerTitle
                />

                <FlatList
                    data={SURAHS}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05 },

    listContent: {
        padding: 20
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 15,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    arabicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 80,
        marginRight: 15,
    },
    arabicText: {
        color: '#D4AF37',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginRight: 10
    },
    verticalSeparator: {
        width: 2,
        height: 30,
        backgroundColor: '#D4AF37',
        opacity: 0.5,
        borderRadius: 1
    },
    textContainer: {
        flex: 1
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 4
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12
    }
});
