import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from "../src/context/FavoritesContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FavoritesProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            presentation: 'modal', // iOS ve Android için aşağıdan yukarı açılış
            animation: 'slide_from_bottom', // Emin olmak için
          }}
        >
          {/* (tabs) klasörünü ana ekran olarak yükle ve başlığı gizle */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false, presentation: 'card', animation: 'default' }} />
          <Stack.Screen name="quran-detail" />
          <Stack.Screen name="media-player" />
          <Stack.Screen name="special" />
          <Stack.Screen name="nafile-list" />
          <Stack.Screen name="nafile-detail" />
          <Stack.Screen name="recipes" />
          <Stack.Screen name="recipe-detail" />
          <Stack.Screen name="favorites" />
        </Stack>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}