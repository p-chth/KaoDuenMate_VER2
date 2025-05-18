import React, { useEffect, useState } from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { AppText } from "@/components/AppText";

interface Deadline {
  id: string;
  name: string;
  daysLeft: number;
}

export default function DeadlineList() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    const fetchDeadlines = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const getDaysLeft = (dateStr: string): number => {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);
        const timeDiff = targetDate.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      };

      try {
        const assignmentsSnap = await getDocs(
          collection(db, "users", user.uid, "assignments")
        );
        const examsSnap = await getDocs(
          collection(db, "users", user.uid, "exams")
        );

        const newDeadlines: Deadline[] = [];

        assignmentsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.dueDate) {
            const daysLeft = getDaysLeft(data.dueDate);
            if (daysLeft > 0) {
              newDeadlines.push({
                id: doc.id,
                name: data.name || "Unnamed Assignment",
                daysLeft,
              });
            }
          }
        });

        examsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.examDate) {
            const daysLeft = getDaysLeft(data.examDate);
            if (daysLeft > 0) {
              newDeadlines.push({
                id: doc.id,
                name: data.courseName || "Unnamed Exam",
                daysLeft,
              });
            }
          }
        });

        newDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);
        setDeadlines(newDeadlines);
      } catch (error) {
        console.error("Error fetching deadlines:", error);
      }
    };

    fetchDeadlines();
  }, []);

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