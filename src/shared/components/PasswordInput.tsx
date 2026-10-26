import { useState } from "react";
import { Pressable, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Input } from "./Input";
import { useTranslation } from "../../i18n";
import { colors } from "../theme";

export function PasswordInput(
  props: TextInputProps & { label?: string; error?: string },
) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  return (
    <Input
      {...props}
      icon="lock"
      secureTextEntry={!visible}
      autoCapitalize="none"
      right={
        <Pressable
          hitSlop={10}
          onPress={() => setVisible((v) => !v)}
          accessibilityLabel={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        >
          <Feather
            name={visible ? "eye-off" : "eye"}
            size={18}
            color={colors.muted}
          />
        </Pressable>
      }
    />
  );
}
