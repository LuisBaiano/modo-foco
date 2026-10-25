import { Pressable, StyleSheet, Text, View } from 'react-native';
import HeroIcon from './HeroIcon';
import type { Palette } from './ThemeContext';

type Props = {
  count: number;
  colors: Palette;
  onCancel: () => void;
  onDelete: () => void;
};

/** Barra fixa no rodapé que aparece durante o modo de seleção múltipla. */
function SelectionActionBar({ count, colors, onCancel, onDelete }: Props) {
  const styles = createStyles(colors);
  return (
    <View style={styles.bar}>
      <Pressable onPress={onCancel} hitSlop={8}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
      <Text style={styles.countText}>{count} selecionado{count === 1 ? '' : 's'}</Text>
      <Pressable style={styles.deleteButton} onPress={onDelete} hitSlop={8}>
        <HeroIcon name="trash" size={20} color={colors.danger} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    countText: {
      color: colors.text,
      fontWeight: '700',
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dangerBg,
    },
  });
}

export default SelectionActionBar;
