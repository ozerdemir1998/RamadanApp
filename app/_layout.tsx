import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* (tabs) klasörünü ana ekran olarak yükle ve başlığı gizle */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quran-detail" options={{ headerShown: false }} />
      <Stack.Screen name="media-player" options={{ headerShown: false }} />
      <Stack.Screen name="special" options={{ headerShown: false }} />
    </Stack>
  );
}