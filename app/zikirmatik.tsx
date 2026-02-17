import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ZikirmatikScreen from '../src/screens/ZikirmatikScreen';

export default function ZikirmatikRoute() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: '#0F2027' }}>
            <ZikirmatikScreen onClose={() => router.back()} />
        </View>
    );
}
