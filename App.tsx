import React, { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

const LAST_URL_KEY = "lastVisitedUrl";
const defaultUrl = "https://chessarbiter.info/en/laws/intro";

const MyWebView = () => {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webviewRef = React.useRef<any>(null);

  useEffect(() => {
    const loadLastUrl = async () => {
      try {
        const lastUrl = await AsyncStorage.getItem(LAST_URL_KEY);
        if (lastUrl) {
          setUrl(lastUrl);
        }
      } finally {
        setLoading(false);
      }
    };
    loadLastUrl();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  const handleNavigationStateChange = async (navState: any) => {
    setCanGoBack(navState.canGoBack);
    try {
      await AsyncStorage.setItem(LAST_URL_KEY, navState.url);
    } catch (error) { }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      {loading ? (
        <ActivityIndicator size="large" style={styles.container} />
      ) : (
        <WebView
          ref={webviewRef}
          style={styles.container}
          source={{ uri: url }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}
    </SafeAreaView>
  );
};

const App = () => (
  <SafeAreaProvider>
    <MyWebView />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
});

export default App;
