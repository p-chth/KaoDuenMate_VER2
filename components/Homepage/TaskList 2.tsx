import { View, Text, StyleSheet } from "react-native";
import { MonoText } from "../StyledText";
import { useState } from "react";

export default function TaskList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ Daily Task</Text>
      <Text style={styles.task}>• Finish React Native feature</Text>
      <Text style={styles.task}>• Review pull requests</Text>
      <Text style={styles.task}>• Study algorithms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF", // white background
    borderRadius: 16, // rounded corners
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // shadow for Android
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000", // black font
    marginBottom: 8,
  },
  task: {
    fontSize: 16,
    color: "#000000", // black font
    marginBottom: 4,
  },
});
