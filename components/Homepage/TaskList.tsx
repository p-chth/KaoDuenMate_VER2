import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { AppText } from "@/components/AppText";

const screenWidth = Dimensions.get("window").width;

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
}

export default function TaskList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getTodayFormatted = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAssignments(currentUser.uid);
      } else {
        setAssignments([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAssignments = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const assignmentsRef = collection(db, "users", uid, "assignments");
      const snapshot = await getDocs(assignmentsRef);

      const today = getTodayFormatted();

      const todayAssignments: Assignment[] = snapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            dueDate: data.dueDate,
          } as Assignment;
        })
        .filter((assignment) => assignment.dueDate === today);

      setAssignments(todayAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <AppText style={styles.errorText}>{error}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.title} bold>🗓️ Daily Task</AppText>

      {assignments.length === 0 ? (
        <AppText style={styles.task}>No tasks due today.</AppText>
      ) : (
        assignments.map((task) => (
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
  center: ViewStyle;
  title: TextStyle;
  task: TextStyle;
  errorText: TextStyle;
}>({
  container: {
    width: screenWidth * 0.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
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
  errorText: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    color: "red",
  },
});