import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ProgressChart } from "react-native-chart-kit";

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
}

const chartSize = 160;

export default function CourseProgressList() {
  const [courses, setCourses] = useState<CourseProgress[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const coursesSnap = await getDocs(
          collection(db, "users", user.uid, "courses")
        );

        const fetchedCourses: CourseProgress[] = [];

        coursesSnap.forEach((doc) => {
          const data = doc.data();
          const taskArray = Array.isArray(data.tasks) ? data.tasks : [];

          console.log("Course:", data.title, "Tasks:", taskArray);

          const total = taskArray.length;
          const completed = taskArray.filter((t: any) => t.done).length;
          const progress = total > 0 ? completed / total : 0;

          fetchedCourses.push({
            id: doc.id,
            name: data.title || "Untitled",
            progress,
          });
        });

        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    fetchCourses();
  }, []);

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
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.percentText}>
                {Math.round(course.progress * 100)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "600",
    color: "#000",
  },
  percentText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
