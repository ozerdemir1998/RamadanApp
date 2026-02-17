import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
// iPhone 11 Pro / X: 375 x 812
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * Width-Percentage
 * Converts a width percentage to independent pixel (dp).
 * @param widthPercent The percentage of the screen width (string '50%' or number 50)
 */
export const wp = (widthPercent: number | string): number => {
    const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * Height-Percentage
 * Converts a height percentage to independent pixel (dp).
 * @param heightPercent The percentage of the screen height (string '50%' or number 50)
 */
export const hp = (heightPercent: number | string): number => {
    const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

/**
 * Scale function
 * Scales a size based on the width of the screen.
 * Useful for padding, margin, width, height.
 */
export const scale = (size: number): number => {
    return (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Vertical Scale function
 * Scales a size based on the height of the screen.
 * Useful for height, marginTop, marginBottom.
 */
export const verticalScale = (size: number): number => {
    return (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Moderate Scale function
 * Scales a size with a resize factor (default 0.5).
 * Useful for font sizes to avoid too large or too small text.
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

/**
 * Responsive Font Size
 * Alias for moderateScale, semantically clear for fonts.
 */
export const rf = (size: number): number => {
    return moderateScale(size);
};

/**
 * Responsive margin/padding alias
 * Use for generic spacing that should scale moderately.
 */
export const rem = (size: number): number => {
    return moderateScale(size);
};

export const SCREEN_DIMENSIONS = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
};
