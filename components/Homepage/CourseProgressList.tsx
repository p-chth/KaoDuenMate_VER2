import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ProgressChart } from "react-native-chart-kit";
import { AppText } from "@/components/AppText";

interface Topic {
  id: number;
  title: string;
  done: boolean;
}

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
}

const chartSize = 160;

export default function CourseProgressList() {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const coursesSnap = await getDocs(
          collection(db, "users", user.uid, "courses")
        );

        console.log("Number of courses fetched:", coursesSnap.size);

        const fetchedCourses: CourseProgress[] = [];

        coursesSnap.forEach((doc) => {
          const data = doc.data();
          const topicArray: Topic[] = Array.isArray(data.topics) ? data.topics : [];

          console.log(`Course: ${data.title || "Untitled"}`);
          console.log("Topics:", topicArray);

          const total = topicArray.length;
          const completed = topicArray.filter((t) => t.done === true).length;
          const progress = total > 0 ? completed / total : 0;

          console.log(`Total topics: ${total}, Completed: ${completed}, Progress: ${progress}`);

          fetchedCourses.push({
            id: doc.id,
            name: data.title || "Untitled",
            progress,
          });
        });

        setCourses(fetchedCourses);
      } catch (error: any) {
        console.error("Error fetching course progress:", error);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyText}>Loading courses...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.errorText}>{error}</AppText>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyText}>No courses found</AppText>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    >
      {courses.map((course) => (
        <View key={course.id} style={styles.courseBox}>
          <View style={{ width: chartSize, height: chartSize }}>
            <ProgressChart
              data={{ data: [course.progress] }}
              width={chartSize}
              height={chartSize}
              strokeWidth={14}
              radius={40}
              hideLegend
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(185, 225, 133, ${opacity})`,
                backgroundColor: "#fff",
                propsForBackgroundLines: {
                  stroke: "#BBBBBB",
                },
              }}
              style={{ position: "absolute" }}
            />
            <View style={styles.overlay}>
              <AppText style={styles.courseName} bold>{course.name}</AppText>
              <AppText style={styles.percentText} bold>
                {Math.round(course.progress * 100)}%
              </AppText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create<{
  listContainer: ViewStyle;
  courseBox: ViewStyle;
  overlay: ViewStyle;
  courseName: TextStyle;
  percentText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  errorText: TextStyle;
}>({
  listContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  courseBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overlay: {
    position: "absolute",
    top: chartSize / 2 - 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  courseName: {
    fontSize: 14,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "600",
    color: "#000",
  },
  percentText: {
    fontSize: 18,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
    color: "#000",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    color: "#000",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    color: "red",
  },
});