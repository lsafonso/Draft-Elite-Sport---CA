import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../src/lib/supabaseClient';

export default function Index() {
  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('Supabase test:', { data, error });
    };

    testSupabaseConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Draft Elite Sport</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
