import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MAX_QUERY } from "@/shared/constants/limits";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { useTranslation } from "@/i18n";
import { AppText } from "@/shared/components/AppText";
import { colors, fonts, radius, space } from "@/shared/theme";
import { assistantApi } from "../api/assistantApi";
import { ChatMessage } from "../types";

export function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { t, language } = useTranslation();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const answer = await assistantApi.ask(userMessage.text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-r", role: "assistant", text: answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-e",
          role: "assistant",
          text: apiErrorMessage(err, t, "assistant.failed"),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: space.lg, gap: space.sm, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={s.intro}>
            <View style={s.badge}>
              <Feather name="message-circle" size={26} color={colors.sea} />
            </View>
            <AppText variant="title" style={{ textAlign: "center" }}>
                            {t("assistant.title")}
            </AppText>
            <AppText color={colors.muted} style={{ textAlign: "center" }}>
                            {t("assistant.emptyMessage")}
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              s.bubble,
              item.role === "user" ? s.userBubble : s.assistantBubble,
            ]}
          >
            <AppText
              color={item.role === "user" ? colors.onSea : colors.ink}
            >
              {item.text}
            </AppText>
          </View>
        )}
      />
      <View style={s.inputRow}>
        <TextInput
          // See Input.tsx: the native hint does not refresh when only the
          // placeholder changes, so rebuild the field when the language does.
          key={language}
          style={s.input}
          placeholder={t("assistant.placeholder")}
          placeholderTextColor="#8B98A5"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          maxLength={MAX_QUERY}
          returnKeyType="send"
        />
        <Pressable
          style={[s.send, (sending || !input.trim()) && s.sendOff]}
          onPress={handleSend}
          disabled={sending || !input.trim()}
          accessibilityLabel={t("assistant.send")}
        >
          <Feather name="arrow-up" size={20} color={colors.onSea} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  intro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.xxl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.seaSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.image,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.sea },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: colors.chalk,
    borderRadius: radius.pill,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.sea,
    alignItems: "center",
    justifyContent: "center",
  },
  sendOff: { opacity: 0.4 },
});
