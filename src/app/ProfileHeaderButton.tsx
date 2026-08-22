import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { RootStackParamList } from './RootNavigator';

function ProfileHeaderButton({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  return (
    <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8} style={styles.headerButton}>
      <Text style={styles.headerButtonIcon}>👤</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
  },
  headerButtonIcon: {
    fontSize: 20,
  },
});

export default ProfileHeaderButton;
