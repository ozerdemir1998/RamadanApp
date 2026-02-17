import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CloseButtonProps {
    onPress: () => void;
    style?: ViewStyle;
    dark?: boolean; // If true, use dark background for light modals
}

export default function CloseButton({ onPress, style, dark = false }: CloseButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, dark && styles.darkButton, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name="close" size={24} color={dark ? "#D4AF37" : "#D4AF37"} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    darkButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderColor: 'rgba(0,0,0,0.1)'
    }
});
