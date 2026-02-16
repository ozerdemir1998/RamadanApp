import { AlarmSettings, STORAGE_KEY, defaultSettings, registerForPushNotificationsAsync } from '@/services/notificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- İKON ---
const ICON_PATTERN = require('../../assets/icons/adhan.png');

const VAKITLER = [
    { key: 'Imsak', label: 'İmsak', sub: 'Sahur Vakti', icon: 'weather-sunset-up' },
    { key: 'Gunes', label: 'Güneş', sub: 'Kerahat Vakti', icon: 'weather-sunny' },
    { key: 'Ogle', label: 'Öğle', sub: 'Öğle Namazı', icon: 'white-balance-sunny' },
    { key: 'Ikindi', label: 'İkindi', sub: 'İkindi Namazı', icon: 'weather-partly-cloudy' },
    { key: 'Aksam', label: 'Akşam', sub: 'İftar Vakti', icon: 'weather-sunset-down' },
    { key: 'Yatsa', label: 'Yatsı', sub: 'Yatsı Namazı', icon: 'weather-night' },
];

// İstenilen dakika seçenekleri
const OFFSET_OPTIONS = [0, 5, 10, 15, 30, 45];

export default function AlarmsScreen() {
    const [settings, setSettings] = useState<AlarmSettings>(defaultSettings);

    // Modal Yönetimi
    const [modalVisible, setModalVisible] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
        registerForPushNotificationsAsync();
    }, []);

    const loadSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } catch (e) {
            console.log("Ayar yükleme hatası");
        }
    };

    const saveSettings = async (newSettings: AlarmSettings) => {
        setSettings(newSettings);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    };

    // Switch aç/kapa
    const toggleSwitch = (vakitKey: string) => {
        const current = settings[vakitKey] || { enabled: false, offset: 0 };
        const willEnable = !current.enabled;

        const newSettings = {
            ...settings,
            [vakitKey]: { ...current, enabled: willEnable }
        };

        saveSettings(newSettings);

        // Eğer açılıyorsa direkt menüyü göster
        if (willEnable) {
            openModal(vakitKey);
        }
    };

    // Süre seçimi (Modal içinden)
    const selectOffset = (offset: number) => {
        if (editingKey) {
            const current = settings[editingKey];
            const newSettings = {
                ...settings,
                [editingKey]: { ...current, offset: offset }
            };
            saveSettings(newSettings);
            setModalVisible(false); // Seçince kapat
        }
    };

    const openModal = (key: string) => {
        setEditingKey(key);
        setModalVisible(true);
    };

    // Yardımcı fonksiyon: Dakika metni
    const getOffsetLabel = (offset: number) => {
        if (offset === 0) return "Tam Vaktinde";
        return `${offset} dk önce`;
    };

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={{ flex: 1 }}
        >
            {/* Arkaplan Deseni */}
            <View style={styles.backgroundPatternContainer} pointerEvents="none">
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { left: -150 }]} />
                <Image source={ICON_PATTERN} style={[styles.bgPatternImage, { right: -150 }]} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* HEADER */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <MaterialCommunityIcons name="bell-ring" size={28} color="#D4AF37" />
                            <View style={styles.verticalLine} />
                            <Text style={styles.headerTitle}>Bildirimler</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionDesc}>
                        Vakitler için bildirim ayarlarını buradan yönetebilirsiniz.
                    </Text>

                    {VAKITLER.map((item) => {
                        const setting = settings[item.key] || { enabled: false, offset: 0 };

                        return (
                            <View key={item.key} style={[styles.alarmCard, setting.enabled && styles.activeAlarmCard]}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                    style={styles.cardGradient}
                                >
                                    <View style={styles.cardHeader}>

                                        {/* SOL Taraf: İkon + Metinler */}
                                        <View style={styles.titleSection}>
                                            <View style={[styles.iconBox, setting.enabled && styles.activeIconBox]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={setting.enabled ? '#0F2027' : 'rgba(255,255,255,0.3)'}
                                                />
                                            </View>
                                            <View>
                                                <Text style={[styles.cardTitle, setting.enabled && styles.activeText]}>{item.label}</Text>
                                                {/* Eğer aktifse seçili süreyi göster, değilse alt başlığı göster */}
                                                {setting.enabled ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <MaterialCommunityIcons name="clock-outline" size={12} color="#D4AF37" style={{ marginRight: 4 }} />
                                                        <Text style={styles.activeInfoText}>
                                                            {getOffsetLabel(setting.offset)}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.cardSub}>{item.sub}</Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* SAĞ Taraf: Düzenle Butonu + Switch */}
                                        <View style={styles.rightSection}>
                                            {setting.enabled && (
                                                <TouchableOpacity
                                                    style={styles.editButton}
                                                    onPress={() => openModal(item.key)}
                                                >
                                                    <MaterialCommunityIcons name="pencil" size={20} color="#D4AF37" />
                                                </TouchableOpacity>
                                            )}

                                            <Switch
                                                trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(212, 175, 55, 0.3)" }}
                                                thumbColor={setting.enabled ? "#D4AF37" : "#f4f3f4"}
                                                onValueChange={() => toggleSwitch(item.key)}
                                                value={setting.enabled}
                                                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                                            />
                                        </View>

                                    </View>
                                </LinearGradient>
                            </View>
                        );
                    })}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>

            {/* --- SEÇİM MODALI --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Bildirim Zamanı Seçin</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalOptionsGrid}>
                                    {OFFSET_OPTIONS.map((min) => {
                                        const isActive = editingKey ? settings[editingKey]?.offset === min : false;
                                        return (
                                            <TouchableOpacity
                                                key={min}
                                                style={[styles.modalOption, isActive && styles.modalOptionActive]}
                                                onPress={() => selectOffset(min)}
                                            >
                                                <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                                                    {min === 0 ? "Tam Vakti" : `${min} dk önce`}
                                                </Text>
                                                {isActive && (
                                                    <MaterialCommunityIcons name="check-circle" size={16} color="#0F2027" />
                                                )}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    // ARKAPLAN
    backgroundPatternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bgPatternImage: { position: 'absolute', width: 300, height: 300, opacity: 0.05, tintColor: '#D4AF37', resizeMode: 'contain' },

    // HEADER
    content: { padding: 20 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    verticalLine: { width: 1, height: 24, backgroundColor: '#D4AF37', marginHorizontal: 12 },
    headerTitle: { fontSize: 24, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#D4AF37' },
    sectionDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    // KART
    alarmCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.15)',
    },
    activeAlarmCard: {
        borderColor: '#D4AF37', // Altın Sarısı
        borderWidth: 1.5,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 5, // Android için parlama efekti
    },
    cardGradient: { padding: 16 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    iconBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    activeIconBox: { backgroundColor: '#D4AF37' },

    cardTitle: { fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
    activeText: { color: '#fff' },
    cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 },

    activeInfoText: { fontSize: 13, color: '#D4AF37', fontWeight: 'bold', marginTop: 2 },

    editButton: {
        padding: 8,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 8,
        marginRight: 5
    },

    // MODAL STİLLERİ
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#203A43',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 18,
        color: '#D4AF37',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    modalOptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between'
    },
    modalOption: {
        width: '48%', // İki kolonlu yapı
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    modalOptionActive: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37'
    },
    modalOptionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600'
    },
    modalOptionTextActive: {
        color: '#0F2027',
        fontWeight: 'bold'
    }
});