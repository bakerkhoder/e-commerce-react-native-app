import { Text, TextProps } from "react-native";
import { useTranslation } from "../../i18n";
import { colors, typo, TypoVariant } from "../theme";

export function AppText({
  variant = "body",
  color = colors.ink,
  style,
  ...rest
}: TextProps & { variant?: TypoVariant; color?: string }) {
  const { direction } = useTranslation();

  return (
    <Text
      {...rest}
      // writingDirection drives alignment for the *language*, not the layout: without it
      // English text inside an RTL shell hugs the wrong edge. Callers can still override
      // textAlign per element (buttons centre their own label).
      style={[
        { includeFontPadding: false, writingDirection: direction },
        typo[variant],
        { color },
        style,
      ]}
    />
  );
}
