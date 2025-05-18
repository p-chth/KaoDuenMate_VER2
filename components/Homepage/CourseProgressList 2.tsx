import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ProgressChart } from "react-native-chart-kit";

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
}

const mockData: CourseProgress[] = [
  { id: "1", name: "Math", progress: 0.65 },
  { id: "2", name: "Physics", progress: 0.35 },
  { id: "3", name: "Chemistry", progress: 0.85 },
  { id: "4", name: "Biology", progress: 0.55 },
];

// 👇 Increase chart size here
const chartSize = 160;

export default function CourseProgressList({
  courses = mockData,
}: {
  courses?: CourseProgress[];
}) {
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
              strokeWidth={14} // thicker arc
              radius={40} // adjust to match size
              hideLegend
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(185, 225, 133, ${opacity})`,
                backgroundColor: "#fff",
                propsForBackgroundLines: {
                  stroke: "#BBBBBB", // base circle color
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
