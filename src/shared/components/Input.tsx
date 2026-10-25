import { ComponentProps, ReactNode, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
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
