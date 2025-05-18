import React from "react";
import { View, StyleSheet, Dimensions, ViewStyle, TextStyle } from "react-native";
import { AppText } from "@/components/AppText";
import { Assignment } from "@/types";

const screenWidth = Dimensions.get("window").width;

type TaskListProps = {
  assignments: Assignment[] | null | undefined;
};

export default function TaskList({ assignments }: TaskListProps) {
  const today = new Date().toISOString().slice(0, 10);
  const todayAssignments = (assignments || []).filter((a) => a.dueDate === today);

  return (
    <View style={styles.container}>
      <AppText style={styles.title} bold>🗓️ Daily Task</AppText>
      {todayAssignments.length === 0 ? (
        <AppText style={styles.task}>No tasks due today.</AppText>
      ) : (
        todayAssignments.map((task) => (
          <AppText key={task.id} style={styles.task}>
            • {task.name}
          </AppText>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  title: TextStyle;
  task: TextStyle;
}>({
  container: {
    width: screenWidth * 0.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Replaced shadow*
  },
  title: {
    fontSize: 18,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  task: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    color: "#000000",
    marginBottom: 4,
  },
});