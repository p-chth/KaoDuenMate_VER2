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
  ScrollView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { collection, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebaseConfig';

const { width, height } = Dimensions.get('window');
const isDesktop = width > 768;
const scaleFactor = Math.min(width / (isDesktop ? 1200 : 414), height / (isDesktop ? 800 : 896));

type Assignment = { id: number; name: string; dueDate: string };
type Exam = { id: number; courseName: string; examDate: string };

export default function CalendarScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'assignment' | 'exam' | null>(null);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentDate, setNewAssignmentDate] = useState<Date | null>(null);
  const [newExamCourse, setNewExamCourse] = useState('');
  const [newExamDate, setNewExamDate] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
        fetchEvents(user.uid);
      } else {
        setUserId(null);
        setFirstName(null);
        setAssignments([]);
        setExams([]);
        Alert.alert('Please sign in to access your calendar.');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFirstName(userData.firstName || null);
      } else {
        console.warn('User document not found in Firestore');
        setFirstName(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setFirstName(null);
    }
  };

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

  const handleWebDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<Date | null>>,
  ) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    setter(date);
  };

  // Calculate the next 7 days starting from today (May 18, 2025)
  const today = new Date('2025-05-18');
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date,
      formattedDate: date.toISOString().split('T')[0], // e.g., "2025-05-18"
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Sun"
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`, // e.g., "5/18"
    };
  });

  // Group events by date for the next 7 days
  const eventsByDate = next7Days.map((day) => {
    const dayEvents = [
      ...assignments.filter((a) => a.dueDate === day.formattedDate),
      ...exams.filter((e) => e.examDate === day.formattedDate),
    ];
    return { day, events: dayEvents };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>
          Hello, {firstName || 'Guest'}{'\n'}Upcoming Events This Week
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.daysList}>
          {eventsByDate.map(({ day, events }, index) => (
            <View
              key={index}
              style={[
                styles.dayColumn,
                index === eventsByDate.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <Text style={styles.dateLabel}>{day.dateLabel}</Text>
              <View style={styles.eventsArea}>
                {events.length > 0 ? (
                  events.map((event) => (
                    <View
                      key={event.id}
                      style={[
                        styles.eventBox,
                        'name' in event ? styles.assignmentBox : styles.examBox,
                      ]}
                    >
                      <Text style={styles.eventText}>
                        {'name' in event ? event.name : event.courseName}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noEventsText}>No tasks</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    padding: 10 * scaleFactor,
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10 * scaleFactor,
  },
  headerText: {
    fontSize: 20 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10 * scaleFactor,
  },
  scrollView: {
    flexGrow: 1,
  },
  daysList: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: '90%',
    borderRadius: 10 * scaleFactor,
    overflow: 'hidden',
    paddingBottom: 50 * scaleFactor,
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 5 * scaleFactor,
    minHeight: 100 * scaleFactor,
  },
  dayLabel: {
    fontSize: 16 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateLabel: {
    fontSize: 14 * scaleFactor,
    color: '#666',
    textAlign: 'center',
  },
  eventsArea: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 5 * scaleFactor,
  },
  eventBox: {
    padding: 5 * scaleFactor,
    marginVertical: 2 * scaleFactor,
    borderRadius: 5 * scaleFactor,
  },
  assignmentBox: {
    backgroundColor: '#e6f3ff',
  },
  examBox: {
    backgroundColor: '#ffe6e6',
  },
  eventText: {
    fontSize: 14 * scaleFactor,
  },
  noEventsText: {
    fontSize: 14 * scaleFactor,
    color: '#999',
    textAlign: 'center',
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
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 10,
  },
});