import { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { assistantApi } from "../api/assistantApi";
import { ChatMessage } from "../types";

export function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: 'Hi! Ask me what we carry — e.g. "do you have anything organic?"',
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-e",
          role: "assistant",
          text: "Sorry, I couldn't process that right now.",
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
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={
                item.role === "user" ? styles.userText : styles.assistantText
              }
            >
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about our products..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={styles.sendButton}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendText}>{sending ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "80%", borderRadius: 12, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: "#111", alignSelf: "flex-end" },
  assistantBubble: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
  userText: { color: "#fff" },
  assistantText: { color: "#111" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "600" },
});
