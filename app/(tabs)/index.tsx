import { useReducer, useState, type Dispatch } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MAX_TEXT, progress, reducer, SAMPLE_LISTS, type Action, type Checklist } from "../../lib/checklists";

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function ChecklistsScreen() {
  const [lists, dispatch] = useReducer(reducer, SAMPLE_LISTS);
  const [title, setTitle] = useState("");

  const addList = () => {
    dispatch({ type: "addList", id: newId(), title });
    setTitle("");
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.newList}>
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="New checklist title"
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={addList}
          maxLength={MAX_TEXT}
          accessibilityLabel="New checklist title"
        />
        <Pressable style={styles.iconButton} onPress={addList} accessibilityRole="button" accessibilityLabel="Create checklist">
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      {lists.length === 0 && <Text style={styles.empty}>No checklists yet.</Text>}
      {lists.map((list) => (
        <ChecklistCard key={list.id} list={list} dispatch={dispatch} />
      ))}
    </ScrollView>
  );
}

function ChecklistCard({ list, dispatch }: { list: Checklist; dispatch: Dispatch<Action> }) {
  const [text, setText] = useState("");
  const p = progress(list);
  const addItem = () => {
    dispatch({ type: "addItem", listId: list.id, id: newId(), text });
    setText("");
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{list.title}</Text>
        <Text style={styles.count}>
          {p.done}/{p.total}
        </Text>
      </View>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: p.total, now: p.done }}>
        <View style={[styles.fill, { width: `${p.ratio * 100}%` }]} />
      </View>

      {list.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Pressable
            style={styles.itemToggle}
            onPress={() => dispatch({ type: "toggleItem", listId: list.id, itemId: item.id })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
          >
            <Ionicons name={item.done ? "checkbox" : "square-outline"} size={22} color="#4A90D9" />
            <Text style={[styles.itemText, item.done && styles.itemDone]}>{item.text}</Text>
          </Pressable>
          <Pressable
            onPress={() => dispatch({ type: "removeItem", listId: list.id, itemId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.text}`}
            hitSlop={10}
          >
            <Ionicons name="close" size={20} color="#999" />
          </Pressable>
        </View>
      ))}

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="Add item"
          value={text}
          onChangeText={setText}
          onSubmitEditing={addItem}
          maxLength={MAX_TEXT}
          accessibilityLabel={`Add item to ${list.title}`}
        />
        <Pressable style={styles.iconButton} onPress={addItem} accessibilityRole="button" accessibilityLabel="Add item">
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <ActionLink label="Uncheck all" onPress={() => dispatch({ type: "reset", listId: list.id })} />
        <ActionLink label="Clear done" onPress={() => dispatch({ type: "clearDone", listId: list.id })} />
        <ActionLink label="Delete list" danger onPress={() => dispatch({ type: "removeList", listId: list.id })} />
      </View>
    </View>
  );
}

function ActionLink({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}>
      <Text style={[styles.action, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  newList: { flexDirection: "row", gap: 8, padding: 16 },
  flex: { flex: 1 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  iconButton: { width: 46, borderRadius: 8, backgroundColor: "#4A90D9", alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: "#888", marginTop: 24 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 16, gap: 8, elevation: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: "700", color: "#333" },
  count: { fontSize: 14, color: "#666", fontWeight: "600" },
  track: { height: 8, backgroundColor: "#E3ECF7", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#4A90D9" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  itemToggle: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  itemText: { flex: 1, fontSize: 16, color: "#333" },
  itemDone: { color: "#999", textDecorationLine: "line-through" },
  actions: { flexDirection: "row", gap: 16, marginTop: 4 },
  action: { color: "#4A90D9", fontWeight: "600", fontSize: 13 },
  danger: { color: "#B00020" },
});
