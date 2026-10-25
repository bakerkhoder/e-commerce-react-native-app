import { Text, TextProps } from "react-native";
import { colors, typo, TypoVariant } from "../theme";

export function AppText({
  variant = "body",
  color = colors.ink,
  style,
  ...rest
}: TextProps & { variant?: TypoVariant; color?: string }) {
  return (
    <Text
      {...rest}
      style={[{ includeFontPadding: false }, typo[variant], { color }, style]}
    />
  );
}
