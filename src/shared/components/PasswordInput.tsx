import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

export function PasswordInput(props: TextInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        secureTextEntry={!visible}
      />
      <Pressable style={styles.icon} onPress={() => setVisible((v) => !v)}>
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#888"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", justifyContent: "center", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 15,
  },
  icon: { position: "absolute", right: 12 },
});
