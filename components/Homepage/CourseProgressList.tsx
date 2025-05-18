import React from "react";
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { AppText } from "@/components/AppText";
import { Course, Topic } from "@/types";

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
}

const chartSize = 160;

type CourseProgressListProps = {
  courses: Course[];
};

export default function CourseProgressList({ courses }: CourseProgressListProps) {
  const courseProgress: CourseProgress[] = courses.map((course) => {
    const total = course.topics.length;
    const completed = course.topics.filter((t) => t.done).length;
    const progress = total > 0 ? completed / total : 0;
    return {
      id: course.id,
      name: course.title || "Untitled",
      progress,
    };
  });

  if (courseProgress.length === 0) {
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
      {courseProgress.map((course) => (
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
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)", // Replaced shadow*
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
});