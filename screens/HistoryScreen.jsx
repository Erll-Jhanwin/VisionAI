import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function HistoryScreen({ navigation }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory(isRefreshingCall = false) {
    if (!supabase) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefreshingCall) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select()
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error.message);
      } else {
        setRows(data ?? []);
      }
    } catch (err) {
      console.error('Fetch history exception:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Handle case where Supabase is not configured
  if (!supabase) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>History Not Configured</Text>
            <Text style={styles.cardText}>
              Supabase history database credentials are not set in your .env file.
            </Text>
            <Text style={styles.cardInstructions}>
              Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env, then restart your development server.
            </Text>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    // Format timestamp nicely
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{formattedDate}</Text>
        </View>
        
        <Text style={styles.sectionLabel}>Objects:</Text>
        <Text style={styles.cardObjects} numberOfLines={2}>
          {item.objects || 'No objects recorded.'}
        </Text>
        
        <Text style={styles.sectionLabel}>Context:</Text>
        <Text style={styles.cardContext} numberOfLines={3}>
          {item.context || 'No context recorded.'}
        </Text>

        {item.recommendations && (
          <>
            <Text style={styles.sectionLabel}>Recommendation:</Text>
            <Text style={styles.cardContext} numberOfLines={2}>
              {item.recommendations}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={() => loadHistory(true)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No analysis history found.</Text>
            <Text style={styles.emptySubtitle}>Perform your first analysis to see it here!</Text>
            <TouchableOpacity 
              style={[styles.actionButton, { marginTop: 24 }]} 
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.actionButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121214',
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
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E1E1E6',
    marginBottom: 12,
  },
  cardText: {
    color: '#A9A9B2',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardInstructions: {
    color: '#7C7C8A',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#5B3FA3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    paddingBottom: 6,
  },
  cardDate: {
    color: '#7C7C8A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionLabel: {
    color: '#7C7C8A',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 2,
  },
  cardObjects: {
    color: '#E1E1E6',
    fontSize: 15,
    fontWeight: '600',
  },
  cardContext: {
    color: '#C4C4CC',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: '#E1E1E6',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#7C7C8A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
