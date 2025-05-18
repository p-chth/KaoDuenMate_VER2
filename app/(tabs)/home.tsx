// app/home.tsx
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import TaskList from "@/components/Homepage/TaskList";
import DailyCount from "@/components/Homepage/DailyCount";
import Calendar from "@/components/Homepage/Calendar";
import DeadlineList from "@/components/Homepage/DeadlineList";
import CourseProgressList from "@/components/Homepage/CourseProgressList";
import { View, Text, Alert, Platform, StyleSheet } from "react-native";

const showAlert = (message: string) => {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Message", message);
  }
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.taskContainer}>
          <TaskList />
        </View>
        <View style={styles.countContainer}>
          <DailyCount dayCount={8} />
        </View>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar />
      </View>
      <View>
        <Text style={styles.upcomingContainer}>Upcoming Events</Text>
        <View style={styles.deadlineContainer}>
          <DeadlineList />
        </View>
      </View>
      <View style={styles.courseProgressContainer}>
        <CourseProgressList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FBEB77",
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  taskContainer: {
    flex: 1,
  },
  countContainer: {
    width: 100,
    marginRight: 10,
  },
  calendarContainer: {
    width: 250,
    justifyContent: "center",
    alignContent: "center",
  },
  upcomingContainer: {
    backgroundColor: "#648DCB",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 16,
    color: "#fff",
    textAlign: "left",
    overflow: "hidden",
    alignSelf: "flex-start", // fit to text width
    fontWeight: "600",
    fontSize: 16,
    marginTop: 10,
  },
  deadlineContainer: {
    marginTop: 8,
  },
  courseProgressContainer: {
    marginTop: 8,
  },
});
