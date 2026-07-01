import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';
import { analyzeImage, ANALYSIS_PROMPT } from '../lib/gemini';
import { detectObjects } from '../lib/roboflow';
import { PROMPTS } from '../lib/prompts';
import { supabase } from '../lib/supabase';

export default function ResultScreen({ route, navigation }) {
  const { base64Image, promptKey } = route.params;
  const [analysis, setAnalysis] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  function cleanJSONString(str) {
    let cleaned = str.trim();
    // Match ```json ... ``` or ``` ... ```
    const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (match) {
      cleaned = match[1];
    }
    return cleaned.trim();
  }

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      // 1. Call Gemini Analysis
      const prompt = PROMPTS[promptKey] || ANALYSIS_PROMPT;
      const result = await analyzeImage(base64Image, prompt);
      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textPart) {
        throw new Error('Empty response from Gemini');
      }
      
      const cleanedJsonText = cleanJSONString(textPart);
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(cleanedJsonText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON. Raw text was:', textPart);
        throw new Error('Invalid JSON format received from analysis API');
      }

      // Confirm all required fields are present in the parsed analysis
      if (!parsedAnalysis || !Array.isArray(parsedAnalysis.objects)) {
        throw new Error('Missing fields in analysis structure');
      }

      setAnalysis(parsedAnalysis);
      saveToHistory(parsedAnalysis);

      // 2. Call Roboflow Object Detection (optional phase, degrades gracefully)
      try {
        const found = await detectObjects(base64Image);
        setDetections(found);
      } catch (rfErr) {
        console.warn('Roboflow object detection failed silently:', rfErr);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Could not analyze this image. Please check your API key and network connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function saveToHistory(result) {
    if (!supabase) {
      console.warn('Supabase client is not initialized or configured. Skipping history save.');
      return;
    }
    try {
      const { error } = await supabase.from('analysis_history').insert({
        objects: result.objects.join(', '),
        context: result.context,
        recommendations: result.recommendations,
      });
      if (error) {
        console.warn('Failed to save to Supabase history:', error.message);
      } else {
        console.log('Saved to Supabase history successfully.');
      }
    } catch (err) {
      console.warn('Error saving to history:', err);
    }
  }

  // 1. Loading state (spinner + message)
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  // 2. Error state (friendly message + retry option)
  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Success state (never access analysis.* before confirming analysis is non-null)
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Gemini Results */}
        {analysis && (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Objects Detected (Gemini)</Text>
              <View style={styles.tagContainer}>
                {analysis.objects.map((obj, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{obj}</Text>
                  </View>
                ))}
                {analysis.objects.length === 0 && (
                  <Text style={styles.bodyText}>No objects identified.</Text>
                )}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Context & Setting</Text>
              <Text style={styles.bodyText}>{analysis.context}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <Text style={styles.bodyText}>{analysis.activities}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <Text style={styles.bodyText}>{analysis.recommendations}</Text>
            </View>
          </>
        )}

        {/* Roboflow Results */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Refined Object Detection (Roboflow)</Text>
          {detections.length === 0 ? (
            <Text style={styles.bodyTextSecondary}>No specific COCO objects detected above threshold.</Text>
          ) : (
            detections.map((d, i) => (
              <View key={i} style={styles.detectionRow}>
                <Text style={styles.detectionClass}>• {d.class}</Text>
                <Text style={styles.detectionConfidence}>{(d.confidence * 100).toFixed(1)}% confidence</Text>
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121214',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#A9A9B2',
    fontSize: 16,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#201A1A',
    borderColor: '#410002',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFDAD6',
    marginBottom: 12,
  },
  errorText: {
    color: '#FFB4AB',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#5B3FA3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#A9A9B2',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E1E1E6',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#C4C4CC',
  },
  bodyTextSecondary: {
    fontSize: 14,
    color: '#7C7C8A',
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tagText: {
    color: '#E1E1E6',
    fontSize: 14,
    fontWeight: '500',
  },
  detectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  detectionClass: {
    fontSize: 15,
    color: '#C4C4CC',
    fontWeight: '500',
  },
  detectionConfidence: {
    fontSize: 14,
    color: '#7C7C8A',
  },
  doneButton: {
    backgroundColor: '#5B3FA3',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5B3FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
