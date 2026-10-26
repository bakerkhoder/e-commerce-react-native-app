import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useTranslation } from "../../i18n";
import { colors, radius, space } from "../theme";

/**
 * The Arabic/English switch, on its own so it can appear anywhere — the Account screen
 * for signed-in users and the login screen for everyone else.
 */
export function LanguageSwitcher() {
  const { t, language, setLanguage } = useTranslation();

  const choose = async (next: "ar" | "en") => {
    if (next === language) return;
    const needsReload = await setLanguage(next);
    if (needsReload) {
      // Direction is baked into the native shell at launch; text switches instantly
      // but the layout only flips after a restart.
      Alert.alert(t("language.changedTitle"), t("language.changedMessage"));
    }
  };

  return (
    <View style={s.row}>
      <LanguageButton
        label={t("language.arabic")}
        active={language === "ar"}
        onPress={() => choose("ar")}
      />
      <LanguageButton
        label={t("language.english")}
        active={language === "en"}
        onPress={() => choose("en")}
      />
    </View>
  );
}

function LanguageButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[s.button, active && s.buttonActive]}
    >
      {active && <Feather name="check" size={16} color={colors.onSea} />}
      <AppText variant="button" color={active ? colors.onSea : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: space.sm },
  button: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buttonActive: { backgroundColor: colors.sea, borderColor: colors.sea },
});
