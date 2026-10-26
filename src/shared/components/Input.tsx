import { ComponentProps, ReactNode, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useTranslation } from "../../i18n";
import { colors, fonts, radius, space } from "../theme";

export function Input({
  label,
  error,
  icon,
  right,
  style,
  ...props
}: TextInputProps & {
  label?: string;
  error?: string;
  icon?: ComponentProps<typeof Feather>["name"];
  right?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const { language, direction } = useTranslation();

  return (
    <View style={{ marginBottom: space.md }}>
      {label && (
        <AppText variant="small" color={colors.muted} style={{ marginBottom: 6 }}>
          {label}
        </AppText>
      )}
      <View style={[s.field, focused && s.focused, !!error && s.invalid]}>
        {icon && <Feather name={icon} size={18} color={colors.muted} />}
        <TextInput
          {...props}
          // The native input keeps its old hint when only the `placeholder` prop
          // changes, so a new translation can sit invisible until the field is
          // focused. Keying on language + direction rebuilds the native view; the
          // value itself still lives in the parent's state.
          key={`${language}-${direction}`}
          placeholderTextColor="#8B98A5"
          style={[s.input, style]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {right}
      </View>
      {error && (
        <AppText variant="small" color={colors.tomato} style={{ marginTop: 4 }}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.input,
  },
  focused: { borderColor: colors.sea },
  invalid: { borderColor: colors.tomato },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
});
