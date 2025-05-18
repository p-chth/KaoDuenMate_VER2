import { useEffect, useState, useCallback } from 'react';
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useFocusEffect } from "expo-router";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import TaskList from "@/components/Homepage/TaskList";
import DailyCount from "@/components/Homepage/DailyCount";
import LocalCalendar from "@/components/Homepage/Calendar";
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
import { Assignment, Exam, Course } from "@/types";

const showAlert = (message: string) => {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Message", message);
  }
};

// Prop types for components
type TaskListProps = { assignments: Assignment[] };
type DailyCountProps = {};
type CalendarProps = { assignments: Assignment[]; exams: Exam[] };
type DeadlineListProps = { assignments: Assignment[]; exams: Exam[] };
type CourseProgressListProps = { courses: Course[] };

export default function HomeScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setAssignments([]);
        setExams([]);
        setCourses([]);
        setLoading(false);
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    // Assignments listener
    const assignmentsCollection = collection(db, `users/${userId}/assignments`);
    const unsubscribeAssignments = onSnapshot(assignmentsCollection, (snapshot) => {
      const fetchedAssignments: Assignment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed',
        dueDate: doc.data().dueDate || '',
      }));
      setAssignments(fetchedAssignments);
      console.log('Fetched assignments:', fetchedAssignments);
    }, (error) => {
      console.error('Error fetching assignments:', error);
      setError(`Failed to load assignments: ${error.message}`);
    });

    // Exams listener
    const examsCollection = collection(db, `users/${userId}/exams`);
    const unsubscribeExams = onSnapshot(examsCollection, (snapshot) => {
      const fetchedExams: Exam[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        courseName: doc.data().courseName || 'Unnamed',
        examDate: doc.data().examDate || '',
      }));
      setExams(fetchedExams);
      console.log('Fetched exams:', fetchedExams);
    }, (error) => {
      console.error('Error fetching exams:', error);
      setError(`Failed to load exams: ${error.message}`);
    });

    // Courses listener
    const coursesCollection = collection(db, `users/${userId}/courses`);
    const unsubscribeCourses = onSnapshot(coursesCollection, (snapshot) => {
      const fetchedCourses: Course[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || 'Untitled',
        topics: Array.isArray(doc.data().topics) ? doc.data().topics : [],
      }));
      setCourses(fetchedCourses);
      console.log('Fetched courses:', fetchedCourses);
    }, (error) => {
      console.error('Error fetching courses:', error);
      setError(`Failed to load courses: ${error.message}`);
    });

    setLoading(false);

    return () => {
      unsubscribeAssignments();
      unsubscribeExams();
      unsubscribeCourses();
    };
  }, [userId]);

  // Refresh UI on focus
  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen focused, refreshing UI');
      setAssignments([...assignments]);
      setExams([...exams]);
      setCourses([...courses]);
    }, [assignments, exams, courses])
  );

  if (loading) {
    return (
      <View style={styles.scrollContainer}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.scrollContainer}>
        <AppText style={styles.errorText}>{error}</AppText>
      </View>
    );
  }

  if (!userId) {
    return null; // Redirect handled by useEffect
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.topContainer}>
        <View style={styles.wrapper}>
          <View style={styles.taskContainer}>
            <TaskList assignments={assignments} />
          </View>
          <View style={styles.countContainer}>
            <DailyCount />
          </View>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <LocalCalendar assignments={assignments} exams={exams} />
      </View>

      <View>
        <AppText style={styles.upcomingContainer} bold>Upcoming Events</AppText>
        <View style={styles.deadlineContainer}>
          <DeadlineList assignments={assignments} exams={exams} />
        </View>
      </View>

      <View style={styles.courseProgressContainer}>
        <CourseProgressList courses={courses} />
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
  errorText: TextStyle;
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
  errorText: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    color: "red",
    textAlign: "center",
  },
});