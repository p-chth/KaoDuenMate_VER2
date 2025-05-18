import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import TaskList from "@/components/Homepage/TaskList";
import DailyCount from "@/components/Homepage/DailyCount";
import Calendar from "@/components/Homepage/Calendar";
import DeadlineList from "@/components/Homepage/DeadlineList";
import CourseProgressList from "@/components/Homepage/CourseProgressList";
import {
  View,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { AppText } from "@/components/AppText";

const showAlert = (message: string) => {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Message", message);
  }
};

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.topContainer}>
        <View style={styles.wrapper}>
          <View style={styles.taskContainer}>
            <TaskList />
          </View>
          <View style={styles.countContainer}>
            <DailyCount />
          </View>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar />
      </View>

      <View>
        <AppText style={styles.upcomingContainer} bold>Upcoming Events</AppText>
        <View style={styles.deadlineContainer}>
          <DeadlineList />
        </View>
      </View>

      <View style={styles.courseProgressContainer}>
        <CourseProgressList />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create<{
  scrollContainer: ViewStyle;
  topContainer: ViewStyle;
  wrapper: ViewStyle;
  taskContainer: ViewStyle;
  countContainer: ViewStyle;
  calendarContainer: ViewStyle;
  upcomingContainer: TextStyle;
  deadlineContainer: ViewStyle;
  courseProgressContainer: ViewStyle;
}>({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#FBEB77",
    paddingBottom: 40,
    justifyContent: "center",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#FBEB77",
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  taskContainer: {
    flex: 1,
  },
  countContainer: {
    width: 100,
    marginRight: 10,
  },
  calendarContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  upcomingContainer: {
    backgroundColor: "#648DCB",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 16,
    color: "#fff",
    textAlign: "left",
    overflow: "hidden",
    alignSelf: "flex-start",
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "600",
    marginTop: 10,
  },
  deadlineContainer: {
    marginTop: 8,
  },
  courseProgressContainer: {
    marginTop: 8,
  },
});