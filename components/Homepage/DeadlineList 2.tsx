import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface Deadline {
  id: string;
  name: string;
  daysLeft: number;
}

interface DeadlineListProps {
  deadlines?: Deadline[];
}

const mockDeadlines: Deadline[] = [
  { id: "1", name: "Assignment 1", daysLeft: 2 },
  { id: "2", name: "Quiz 2", daysLeft: 5 },
  { id: "3", name: "Project Proposal", daysLeft: 7 },
  { id: "4", name: "Final Report", daysLeft: 10 },
];

export default function DeadlineList({
  deadlines = mockDeadlines,
}: DeadlineListProps) {
  // Big deadline = nearest deadline
  const [bigDeadline, ...smallDeadlines] = deadlines.sort(
    (a, b) => a.daysLeft - b.daysLeft
  );

  return (
    <View style={styles.container}>
      {bigDeadline && (
        <View style={styles.bigDeadlineContainer}>
          <Text style={styles.bigDeadlineName}>{bigDeadline.name}</Text>
          <Text style={styles.bigDeadlineDays}>D-{bigDeadline.daysLeft}</Text>
        </View>
      )}
      <View style={styles.smallDeadlinesContainer}>
        {smallDeadlines.map((d) => (
          <View key={d.id} style={styles.smallDeadlineItem}>
            <Text style={styles.smallDeadlineDays}>D-{d.daysLeft}</Text>
            <Text
              style={styles.smallDeadlineName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {d.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallDeadlinesContainer: {
    width: "50%", // half width of container
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
    fontWeight: "600",
    marginRight: 10,
    fontSize: 12, // smaller font size
    width: 40,
  },
  smallDeadlineName: {
    color: "white",
    fontWeight: "600",
    flexShrink: 1, // allow text to truncate if too long
    fontSize: 12, // smaller font size
  },
  bigDeadlineContainer: {
    width: "45%", // a bit less than 50% to keep spacing
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E03821",
  },
  bigDeadlineName: {
    fontSize: 18, // you can adjust if needed
    fontWeight: "bold",
    color: "#E03821",
    marginBottom: 12,
    textAlign: "center",
  },
  bigDeadlineDays: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E03821",
  },
});
