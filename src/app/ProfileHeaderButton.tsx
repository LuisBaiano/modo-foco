import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet } from 'react-native';
import HeroIcon from './HeroIcon';
import type { RootStackParamList } from './RootNavigator';

/**
 * Botão de perfil usado no header de cada aba. Recebe a navegação do stack
 * raiz (não a da aba/tab) porque a tela de Perfil é empurrada por cima de
 * tudo, não é uma aba.
 */
function ProfileHeaderButton({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  return (
    <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8} style={styles.headerButton}>
      <HeroIcon name="userCircle" size={22} color="#374151" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
  },
});

export default ProfileHeaderButton;
