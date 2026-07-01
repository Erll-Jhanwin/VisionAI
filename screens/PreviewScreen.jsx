import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';


export default function PreviewScreen({ route, navigation }) {
  const { photoUri, base64Image: initialBase64 } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('academic'); // Default persona
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  async function handleAnalyze() {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      navigation.navigate('Result', { base64Image: initialBase64, promptKey: selectedPersona });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Captured image display with tablet dimension constraints */}
      <Image 
        source={{ uri: photoUri }} 
        style={[
          styles.preview,
          {
            maxWidth: isTablet ? 600 : '100%',
            alignSelf: 'center',
            width: '100%',
          }
        ]} 
      />

      {/* Persona Selection Container */}
      <View style={styles.personaContainer}>
        <Text style={styles.personaTitle}>Choose Analysis Persona</Text>
        <View style={styles.personaRow}>
          <TouchableOpacity
            style={[
              styles.personaButton,
              selectedPersona === 'academic' && styles.activePersonaButton,
            ]}
            onPress={() => setSelectedPersona('academic')}
            disabled={isProcessing}
          >
            <Text
              style={[
                styles.personaButtonText,
                selectedPersona === 'academic' && styles.activePersonaButtonText,
              ]}
            >
              Academic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaButton,
              selectedPersona === 'safety' && styles.activePersonaButton,
            ]}
            onPress={() => setSelectedPersona('safety')}
            disabled={isProcessing}
          >
            <Text
              style={[
                styles.personaButtonText,
                selectedPersona === 'safety' && styles.activePersonaButtonText,
              ]}
            >
              Safety
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaButton,
              selectedPersona === 'inventory' && styles.activePersonaButton,
            ]}
            onPress={() => setSelectedPersona('inventory')}
            disabled={isProcessing}
          >
            <Text
              style={[
                styles.personaButtonText,
                selectedPersona === 'inventory' && styles.activePersonaButtonText,
              ]}
            >
              Inventory
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.retakeButton, isProcessing && styles.disabledButton]} 
          onPress={() => !isProcessing && navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.analyzeButton, isProcessing && styles.disabledButton]}
          onPress={handleAnalyze}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyze</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  personaContainer: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  personaTitle: {
    color: '#7C7C8A',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  personaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personaButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  activePersonaButton: {
    borderColor: '#5B3FA3',
    backgroundColor: '#5B3FA3',
  },
  personaButtonText: {
    color: '#7C7C8A',
    fontSize: 13,
    fontWeight: '600',
  },
  activePersonaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#3E424B',
    paddingVertical: 16,
    borderRadius: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  analyzeButton: {
    flex: 2,
    backgroundColor: '#5B3FA3',
    paddingVertical: 16,
    borderRadius: 14,
    marginLeft: 12,
    alignItems: 'center',
    shadowColor: '#5B3FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
