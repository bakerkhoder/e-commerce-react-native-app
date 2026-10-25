import { useState } from "react";
import { Pressable, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Input } from "./Input";
import { colors } from "../theme";

export function PasswordInput(
  props: TextInputProps & { label?: string; error?: string },
) {
  const [visible, setVisible] = useState(false);
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
          accessibilityLabel={visible ? "Hide password" : "Show password"}
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
