import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CloseButton from './CloseButton';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    subtitleStyle?: any;
    titleStyle?: any;
    leftIcon?: 'back' | 'menu' | 'close' | 'none';
    onLeftPress?: () => void;
    rightIcon?: React.ReactNode;
    noBorder?: boolean;
    centerTitle?: boolean;
}

export default function ScreenHeader({
    title,
    subtitle,
    subtitleStyle,
    titleStyle,
    leftIcon = 'back',
    onLeftPress,
    rightIcon,
    noBorder = false,
    centerTitle = false
}: ScreenHeaderProps) {

    const renderLeftIcon = () => {
        if (leftIcon === 'none' || leftIcon === 'close') return <View style={styles.iconPlaceholder} />;

        let iconName: keyof typeof Ionicons.glyphMap = "chevron-back";
        if (leftIcon === 'menu') iconName = "menu";

        return (
            <TouchableOpacity
                onPress={onLeftPress}
                style={styles.iconButton}
                activeOpacity={0.7}
                disabled={!onLeftPress}
            >
                {onLeftPress && <Ionicons name={iconName} size={28} color="#D4AF37" />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, noBorder && styles.noBorder]}>
            <View style={styles.leftContainer}>
                {renderLeftIcon()}
                {!centerTitle && (
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>{subtitle}</Text>}
                    </View>
                )}
            </View>

            {centerTitle && (
                <View style={styles.centerTitleContainer}>
                    <Text style={[styles.title, { textAlign: 'center' }, titleStyle]} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 5 }, subtitleStyle]} numberOfLines={1}>{subtitle}</Text>}
                </View>
            )}

            <View style={styles.rightContainer}>
                {rightIcon}
                {leftIcon === 'close' && <CloseButton onPress={onLeftPress!} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
        backgroundColor: 'transparent' // Gradient should be in the parent
    },
    noBorder: {
        borderBottomWidth: 0,
        borderBottomColor: 'transparent'
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        zIndex: 2
    },
    titleContainer: {
        marginLeft: 5,
        flex: 1,
        justifyContent: 'center'
    },
    centerTitleContainer: {
        position: 'absolute',
        left: 50, // Avoid overlapping back button
        right: 50,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4AF37',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textAlign: 'left'
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
        fontStyle: 'italic',
        textAlign: 'left'
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start', // Align icon to left
    },
    iconPlaceholder: {
        width: 0,
        height: 0
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2
    }
});
