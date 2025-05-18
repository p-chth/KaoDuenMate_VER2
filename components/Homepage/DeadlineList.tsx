import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { AppText } from "@/components/AppText";
import { Assignment, Exam } from "@/types";

interface Deadline {
  id: string;
  name: string;
  daysLeft: number;
}

type DeadlineListProps = {
  assignments: Assignment[];
  exams: Exam[];
};

export default function DeadlineList({ assignments, exams }: DeadlineListProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysLeft = (dateStr: string): number => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const deadlines: Deadline[] = [
    ...assignments
      .filter((a) => a.dueDate)
      .map((a) => ({
        id: a.id,
        name: a.name || "Unnamed Assignment",
        daysLeft: getDaysLeft(a.dueDate),
      })),
    ...exams
      .filter((e) => e.examDate)
      .map((e) => ({
        id: e.id,
        name: e.courseName || "Unnamed Exam",
        daysLeft: getDaysLeft(e.examDate),
      })),
  ]
    .filter((d) => d.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (deadlines.length === 0) {
    return (
      <View style={styles.container}>
        <AppText style={styles.bigDeadlineName} bold>🎉 No upcoming deadlines</AppText>
      </View>
    );
  }

  const [bigDeadline, ...rest] = deadlines;
  const smallDeadlines = rest.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.bigDeadlineContainer}>
        <AppText style={styles.bigDeadlineName} bold>{bigDeadline.name}</AppText>
        <AppText style={styles.bigDeadlineDays} bold>D-{bigDeadline.daysLeft}</AppText>
      </View>
      <View style={styles.smallDeadlinesContainer}>
        {smallDeadlines.map((d) => (
          <View key={d.id} style={styles.smallDeadlineItem}>
            <AppText style={styles.smallDeadlineDays} bold>D-{d.daysLeft}</AppText>
            <AppText
              style={styles.smallDeadlineName}
              bold
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {d.name}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  smallDeadlinesContainer: ViewStyle;
  smallDeadlineItem: ViewStyle;
  smallDeadlineDays: TextStyle;
  smallDeadlineName: TextStyle;
  bigDeadlineContainer: ViewStyle;
  bigDeadlineName: TextStyle;
  bigDeadlineDays: TextStyle;
}>({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Added boxShadow
  },
  smallDeadlinesContainer: {
    width: "50%",
    justifyContent: "space-around",
  },
  smallDeadlineItem: {
    backgroundColor: "#B9E185",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  smallDeadlineDays: {
    color: "#E03821",
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "600",
    marginRight: 10,
    fontSize: 12,
    width: 40,
  },
  smallDeadlineName: {
    color: "white",
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "600",
    flexShrink: 1,
    fontSize: 12,
  },
  bigDeadlineContainer: {
    width: "45%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Added boxShadow
  },
  bigDeadlineName: {
    fontSize: 36,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
    color: "#E03821",
    marginBottom: 12,
    textAlign: "center",
  },
  bigDeadlineDays: {
    fontSize: 32,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
    color: "#E03821",
  },
});