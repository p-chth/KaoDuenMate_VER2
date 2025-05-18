import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const screenWidth = Dimensions.get("window").width;

interface Assignment {
  id: string;
  name: string;
  dueDate: string; // format: "yyyy-mm-dd"
}

export default function TaskList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Utility to format today as yyyy-mm-dd
  const getTodayFormatted = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const auth = getAuth();

    // Listen for user auth state
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

      console.log("Fetched today assignments:", todayAssignments);

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ Daily Task</Text>

      {assignments.length === 0 ? (
        <Text style={styles.task}>No tasks due today.</Text>
      ) : (
        assignments.map((task) => (
          <Text key={task.id} style={styles.task}>
            • {task.name}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  task: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 4,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
