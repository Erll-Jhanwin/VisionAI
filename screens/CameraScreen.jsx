import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const insets = useSafeAreaInsets();

  if (!permission) {
    // 1. permission === null -> empty View (still loading)
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // 2. !permission.granted -> centered text + button calling requestPermission with platform wording
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {Platform.OS === 'ios'
            ? 'TaskFlow needs camera access. Tap below, then choose "Allow" in the dialog.'
            : 'TaskFlow needs camera access. Tap below to grant the permission.'}
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
      console.log('Photo captured successfully:', result.uri);
      navigation.navigate('Preview', { photoUri: result.uri, base64Image: result.base64 });
    } catch (error) {
      console.error('Failed to take picture:', error);
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* 3. permission.granted -> full-screen CameraView facing="back" */}
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Top bar with History Button */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity 
            style={styles.historyIconButton} 
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.historyButtonTextLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Overlay a circular Capture button with safe area aware padding */}
        <View style={[styles.overlayContainer, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.disabledButton]} 
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureInnerCircle} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    // bottom padding is set dynamically via insets
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#121214',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    color: '#E1E1E6',
    fontWeight: '500',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#5B3FA3',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#5B3FA3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  historyIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  historyButtonTextLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
