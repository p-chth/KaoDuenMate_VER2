import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebaseConfig';

const { width, height } = Dimensions.get('window');
const isDesktop = width > 768;
const scaleFactor = Math.min(width / (isDesktop ? 1200 : 414), height / (isDesktop ? 800 : 896));

type Assignment = { id: number; name: string; dueDate: string };
type Exam = { id: number; courseName: string; examDate: string };

export default function CalendarScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'assignment' | 'exam' | null>(null);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentDate, setNewAssignmentDate] = useState<Date | null>(null);
  const [newExamCourse, setNewExamCourse] = useState('');
  const [newExamDate, setNewExamDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<(Assignment | Exam)[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchEvents(user.uid);
      } else {
        setUserId(null);
        setAssignments([]);
        setExams([]);
        Alert.alert('Please sign in to access your calendar.');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchEvents = async (uid: string) => {
    try {
      const assignmentsCollection = collection(db, `users/${uid}/assignments`);
      const assignmentsSnapshot = await getDocs(assignmentsCollection);
      const fetchedAssignments: Assignment[] = assignmentsSnapshot.docs.map((doc) => ({
        id: Number(doc.id),
        name: doc.data().name,
        dueDate: doc.data().dueDate,
      }));
      setAssignments(fetchedAssignments);

      const examsCollection = collection(db, `users/${uid}/exams`);
      const examsSnapshot = await getDocs(examsCollection);
      const fetchedExams: Exam[] = examsSnapshot.docs.map((doc) => ({
        id: Number(doc.id),
        courseName: doc.data().courseName,
        examDate: doc.data().examDate,
      }));
      setExams(fetchedExams);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events.');
    }
  };

  const addAssignment = async () => {
    if (!userId || !newAssignmentName || !newAssignmentDate) return;
    const formattedDate = newAssignmentDate.toISOString().split('T')[0];
    const newAssignment: Assignment = {
      id: Date.now(),
      name: newAssignmentName,
      dueDate: formattedDate,
    };
    try {
      const assignmentRef = doc(db, `users/${userId}/assignments/${newAssignment.id}`);
      await setDoc(assignmentRef, {
        name: newAssignment.name,
        dueDate: newAssignment.dueDate,
      });
      setAssignments((prev) => [...prev, newAssignment]);
      resetModal();
    } catch (error) {
      console.error('Error adding assignment:', error);
      Alert.alert('Error', 'Failed to add assignment.');
    }
  };

  const addExam = async () => {
    if (!userId || !newExamCourse || !newExamDate) return;
    const formattedDate = newExamDate.toISOString().split('T')[0];
    const newExam: Exam = {
      id: Date.now(),
      courseName: newExamCourse,
      examDate: formattedDate,
    };
    try {
      const examRef = doc(db, `users/${userId}/exams/${newExam.id}`);
      await setDoc(examRef, {
        courseName: newExam.courseName,
        examDate: newExam.examDate,
      });
      setExams((prev) => [...prev, newExam]);
      resetModal();
    } catch (error) {
      console.error('Error adding exam:', error);
      Alert.alert('Error', 'Failed to add exam.');
    }
  };

  const resetModal = () => {
    setModalType(null);
    setNewAssignmentName('');
    setNewAssignmentDate(null);
    setNewExamCourse('');
    setNewExamDate(null);
    setIsModalVisible(false);
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    const eventsOnDate = [
      ...assignments.filter((a) => a.dueDate === date),
      ...exams.filter((e) => e.examDate === date),
    ];
    setSelectedEvents(eventsOnDate);
  };

  const handleWebDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<Date | null>>,
  ) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    setter(date);
  };

  const markedDates: { [key: string]: { marked: boolean; dotColor: string } } = {};
  assignments.forEach((assignment) => {
    markedDates[assignment.dueDate] = { marked: true, dotColor: 'red' };
  });
  exams.forEach((exam) => {
    markedDates[exam.examDate] = { marked: true, dotColor: 'blue' };
  });

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => handleDayPress(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#648dcb',
          todayTextColor: '#648dcb',
          arrowColor: '#648dcb',
        }}
      />
        {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>Events on {selectedDate}</Text>
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <Text key={event.id} style={styles.eventText}>
                {'name' in event
                  ? `Assignment: ${event.name} - ${event.dueDate}`
                  : `Exam: ${event.courseName} - ${event.examDate}`}
              </Text>
            ))
          ) : (
            <Text>No events on this date</Text>
          )}
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      <Modal isVisible={isModalVisible} onBackdropPress={resetModal}>
        <View style={styles.modalContent}>
          {!modalType ? (
            <>
              <TouchableOpacity onPress={() => setModalType('assignment')}>
                <Text style={styles.modalOption}>Add Assignment</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalType('exam')}>
                <Text style={styles.modalOption}>Add Exam</Text>
              </TouchableOpacity>
            </>
          ) : modalType === 'assignment' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Assignment Name"
                value={newAssignmentName}
                onChangeText={setNewAssignmentName}
              />
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={styles.webDateInput}
                  onChange={(e) => handleWebDateChange(e, setNewAssignmentDate)}
                  value={
                    newAssignmentDate
                      ? newAssignmentDate.toISOString().split('T')[0]
                      : ''
                  }
                />
              ) : (
                <DatePicker
                  date={newAssignmentDate || new Date()}
                  onDateChange={setNewAssignmentDate}
                  mode="date"
                />
              )}
              <TouchableOpacity onPress={addAssignment} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Assignment</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Course Name"
                value={newExamCourse}
                onChangeText={setNewExamCourse}
              />
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={styles.webDateInput}
                  onChange={(e) => handleWebDateChange(e, setNewExamDate)}
                  value={newExamDate ? newExamDate.toISOString().split('T')[0] : ''}
                />
              ) : (
                <DatePicker
                  date={newExamDate || new Date()}
                  onDateChange={setNewExamDate}
                  mode="date"
                />
              )}
              <TouchableOpacity onPress={addExam} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Exam</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBEB77',
    padding: 20 * scaleFactor,
  },
  selectedDateContainer: {
    marginTop: 20 * scaleFactor,
    padding: 10 * scaleFactor,
    backgroundColor: '#fff',
    borderRadius: 10 * scaleFactor,
  },
  selectedDateText: {
    fontSize: 18 * scaleFactor,
    fontWeight: 'bold',
    marginBottom: 10 * scaleFactor,
  },
  eventText: {
    fontSize: 16 * scaleFactor,
    marginVertical: 5 * scaleFactor,
  },
  fab: {
    position: 'absolute',
    bottom: 20 * scaleFactor,
    right: 20 * scaleFactor,
    backgroundColor: '#648dcb',
    width: 50 * scaleFactor,
    height: 50 * scaleFactor,
    borderRadius: 25 * scaleFactor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20 * scaleFactor,
    borderRadius: 10 * scaleFactor,
  },
  modalOption: {
    fontSize: 18 * scaleFactor,
    marginVertical: 10 * scaleFactor,
    fontFamily: 'Cochin',
  },
  input: {
    height: 40 * scaleFactor,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5 * scaleFactor,
    marginBottom: 10 * scaleFactor,
    paddingHorizontal: 10 * scaleFactor,
    fontFamily: 'Cochin',
  },
  webDateInput: {
    height: 40 * scaleFactor,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5 * scaleFactor,
    marginBottom: 10 * scaleFactor,
    paddingHorizontal: 10 * scaleFactor,
    fontSize: 16 * scaleFactor,
    fontFamily: 'Cochin',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#648dcb',
    paddingVertical: 10 * scaleFactor,
    borderRadius: 5 * scaleFactor,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16 * scaleFactor,
    fontFamily: 'Cochin',
  },
});