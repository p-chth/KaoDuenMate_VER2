import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions, TextStyle, ViewStyle } from "react-native";
import { Calendar } from "react-native-calendars";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { AppText } from "@/components/AppText";

const screenWidth = Dimensions.get("window").width;

type Event = {
  id: string;
  summary: string;
};

type EventsByDate = {
  [date: string]: Event[];
};

export default function LocalCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});

  useEffect(() => {
    const fetchEvents = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const assignmentSnapshot = await getDocs(
          collection(db, "users", user.uid, "assignments")
        );
        const examsSnapshot = await getDocs(
          collection(db, "users", user.uid, "exams")
        );

        const tempEvents: EventsByDate = {};

        const addEvent = (date: string, event: Event) => {
          if (!tempEvents[date]) tempEvents[date] = [];
          tempEvents[date].push(event);
        };

        assignmentSnapshot.forEach((doc) => {
          const data = doc.data();
          const dueDate = data.dueDate as string;
          if (!dueDate) return;
          addEvent(dueDate, {
            id: doc.id,
            summary: `Assignment: ${data.name}`,
          });
        });

        examsSnapshot.forEach((doc) => {
          const data = doc.data();
          const examDate = data.examDate as string;
          if (!examDate) return;
          addEvent(examDate, {
            id: doc.id,
            summary: `Exam: ${data.courseName}`,
          });
        });

        setEventsByDate(tempEvents);

        const todayStr = new Date().toISOString().slice(0, 10);
        if (tempEvents[todayStr]) {
          setSelectedDate(todayStr);
        } else {
          const firstDate = Object.keys(tempEvents)[0] || todayStr;
          setSelectedDate(firstDate);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const events = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...Object.keys(eventsByDate).reduce((acc, date) => {
            acc[date] = { marked: true };
            return acc;
          }, {} as { [date: string]: any }),
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: "#648DCB",
          },
        }}
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
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