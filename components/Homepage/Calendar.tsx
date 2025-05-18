import React, { useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, TextStyle, ViewStyle } from "react-native";
import { Calendar as RNCalendar, CalendarProps as RNCalendarProps } from "react-native-calendars";
import { AppText } from "@/components/AppText";
import { Assignment, Exam } from "@/types";

const screenWidth = Dimensions.get("window").width;

type Event = {
  id: string;
  summary: string;
};

type EventsByDate = {
  [date: string]: Event[];
};

type LocalCalendarProps = {
  assignments: Assignment[];
  exams: Exam[];
};

export default function LocalCalendar({ assignments, exams }: LocalCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const eventsByDate: EventsByDate = {};

  assignments.forEach((a) => {
    if (a.dueDate) {
      if (!eventsByDate[a.dueDate]) eventsByDate[a.dueDate] = [];
      eventsByDate[a.dueDate].push({ id: a.id, summary: `Assignment: ${a.name}` });
    }
  });

  exams.forEach((e) => {
    if (e.examDate) {
      if (!eventsByDate[e.examDate]) eventsByDate[e.examDate] = [];
      eventsByDate[e.examDate].push({ id: e.id, summary: `Exam: ${e.courseName}` });
    }
  });

  // Set initial selected date
  if (!selectedDate) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const firstDate = Object.keys(eventsByDate)[0] || todayStr;
    setSelectedDate(firstDate);
  }

  const events = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const markedDates: RNCalendarProps['markedDates'] = {
    ...Object.keys(eventsByDate).reduce((acc, date) => {
      acc[date] = { marked: true };
      return acc;
    }, {} as { [date: string]: any }),
    [selectedDate]: {
      selected: true,
      marked: true,
      selectedColor: "#648DCB",
    },
  };

  return (
    <View style={styles.container}>
      <RNCalendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />
      <AppText style={styles.title} bold>Events on {selectedDate}</AppText>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.event}>
            <AppText style={styles.eventTitle} bold>{item.summary}</AppText>
          </View>
        )}
        ListEmptyComponent={
          <AppText style={styles.emptyText}>No events found.</AppText>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  title: TextStyle;
  event: ViewStyle;
  eventTitle: TextStyle;
  emptyText: TextStyle;
}>({
  container: {
    width: screenWidth - 40,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Replaced shadow*
  },
  title: {
    fontSize: 16,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "600",
    marginVertical: 12,
  },
  event: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: "CheapAsChipsDEMO",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "CheapAsChipsDEMO",
    textAlign: "center",
    marginTop: 20,
  },
});