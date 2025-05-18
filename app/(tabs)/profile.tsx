import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { doc, collection, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { AppText } from '@/components/AppText';
import { db, auth } from '@/firebaseConfig';

const { width, height } = Dimensions.get('window');
const isDesktop = width > 768;
const referenceWidth = isDesktop ? 1200 : 414;
const referenceHeight = isDesktop ? 800 : 896;
const scaleFactor = Math.min(width / referenceWidth, height / referenceHeight);

const overviewBoxWidthPercentage = isDesktop ? 0.23 : 0.48;
const overviewBoxWidth = width * overviewBoxWidthPercentage;
const aspectRatio = isDesktop ? 2.5 : 1.5;
const overviewBoxHeight = overviewBoxWidth / aspectRatio;
const circleSize = Math.min(overviewBoxWidth, overviewBoxHeight) * 0.6;
const circleWidth = circleSize * 0.1;
const circleFontSize = circleSize * 0.25;

type Topic = { id: number; title: string; done: boolean };
type Course = { id: number; title: string; topics: Topic[] };
type UserData = { firstName: string; lastName: string; studentId: string; streak?: number; lastActiveDate?: string; lastStreakUpdate?: string };
type Assignment = { id: number; name: string; dueDate: string };
type Exam = { id: number; courseName: string; examDate: string };

const showAlert = (message: string) => {
  Alert.alert('Notification', message);
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editData, setEditData] = useState<UserData>({ firstName: '', lastName: '', studentId: '' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserData(user.uid);
        await fetchCalendarData(user.uid);
      } else {
        setUserId(null);
        setUserData(null);
        setCourses([]);
        setAssignments([]);
        setExams([]);
        showAlert('Please sign in to access your profile.');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const checkAndResetStreak = async (uid: string, userData: UserData) => {
    const now = new Date('2025-05-18');
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastActiveDate = userData.lastActiveDate || null;
    let streak = userData.streak || 0;

    if (lastActiveDate && lastActiveDate < yesterdayStr) {
      streak = 0;
      const userRef = doc(db, 'users', uid);
      try {
        await updateDoc(userRef, {
          streak: 0,
          lastActiveDate: today,
          lastStreakUpdate: undefined,
        });
        setUserData((prev) => prev ? { 
          ...prev, 
          streak: 0,
          lastActiveDate: today,
          lastStreakUpdate: undefined 
        } : prev);
      } catch (error) {
        console.error('Error resetting streak:', error);
        showAlert('Failed to reset streak.');
      }
    }
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        const userData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          studentId: data.studentId || '',
          streak: data.streak || 0,
          lastActiveDate: data.lastActiveDate || '',
          lastStreakUpdate: data.lastStreakUpdate || '',
        };
        setUserData(userData);
        setEditData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          studentId: data.studentId || '',
        });
        await checkAndResetStreak(uid, userData);
      } else {
        showAlert('User data not found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showAlert('Failed to load user data.');
    }
  };

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          studentId: data.studentId || '',
          streak: data.streak || 0,
          lastActiveDate: data.lastActiveDate || '',
          lastStreakUpdate: data.lastStreakUpdate || '',
        });
      }
    }, (error) => {
      console.error('Error listening to user data:', error);
      showAlert('Failed to load user data in real time.');
    });

    const coursesCollection = collection(db, `users/${userId}/courses`);
    const unsubscribeCourses = onSnapshot(
      coursesCollection,
      (querySnapshot) => {
        const fetchedCourses: Course[] = querySnapshot.docs.map((doc) => ({
          id: Number(doc.id),
          title: doc.data().title,
          topics: doc.data().topics || [],
        }));
        setCourses(fetchedCourses);
      },
      (error) => {
        console.error('Error listening to courses:', error);
        showAlert('Failed to load courses in real time.');
      }
    );

    const assignmentsCollection = collection(db, `users/${userId}/assignments`);
    const unsubscribeAssignments = onSnapshot(
      assignmentsCollection,
      (querySnapshot) => {
        const fetchedAssignments: Assignment[] = querySnapshot.docs.map((doc) => ({
          id: Number(doc.id),
          name: doc.data().name,
          dueDate: doc.data().dueDate,
        }));
        setAssignments(fetchedAssignments);
      },
      (error) => {
        console.error('Error listening to assignments:', error);
        showAlert('Failed to load assignments in real time.');
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeCourses();
      unsubscribeAssignments();
    };
  }, [userId]);

  const fetchCalendarData = async (uid: string) => {
    try {
      const examsCollection = collection(db, `users/${uid}/exams`);
      const examsSnapshot = await getDocs(examsCollection);
      const fetchedExams: Exam[] = examsSnapshot.docs.map((doc) => ({
        id: Number(doc.id),
        courseName: doc.data().courseName,
        examDate: doc.data().examDate,
      }));
      setExams(fetchedExams);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      showAlert('Failed to load calendar data.');
    }
  };

  const calculateOverallProgress = () => {
    const allTopics = courses.flatMap((c) => c.topics);
    return allTopics.length
      ? allTopics.filter((t) => t.done).length / allTopics.length
      : 0;
  };

  const calculateDDay = () => {
    const now = new Date('2025-05-18');
    const allDates = [
      ...assignments.map((a) => new Date(a.dueDate)),
      ...exams.map((e) => new Date(e.examDate)),
    ].filter((d) => !isNaN(d.getTime()));
    if (allDates.length === 0) return 'N/A';
    const earliestDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const diffTime = earliestDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays.toString() : '0';
  };

  const calculateAssignmentLeft = () => {
    return assignments.length;
  };

  useEffect(() => {
    setOverallProgress(calculateOverallProgress());
  }, [courses]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showAlert('Signed out successfully!');
      router.replace('/');
    } catch (error: any) {
      console.log('Sign out error:', error);
      showAlert(error.message || 'Failed to sign out');
    } finally {
      setIsSettingsVisible(false);
    }
  };

  const handleEditUserData = () => {
    setIsEditVisible(true);
  };

  const saveEditData = async () => {
    if (!userId) return;
    try {
      const userRef = doc(db, `users/${userId}`);
      await updateDoc(userRef, editData);
      setUserData({ ...userData, ...editData });
      setIsEditVisible(false);
      showAlert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
      showAlert('Failed to update profile.');
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setIsSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24 * scaleFactor} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileIcon}>
        <Ionicons name="person" size={60 * scaleFactor} color="#fff" />
      </View>

      <View style={styles.whiteCard}>
        <AppText style={styles.name} bold>
          {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
        </AppText>
        <AppText style={styles.studentId}>
          {userData ? userData.studentId : 'Loading...'}
        </AppText>
        <View style={styles.divider} />

        <AppText style={styles.sectionTitle} bold>
          Courses
        </AppText>
        <View style={styles.coursesGrid}>
          {courses.map((course) => (
            <View key={course.id} style={styles.courseBox}>
              <AppText
                style={styles.courseText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {course.title}
              </AppText>
            </View>
          ))}
          {Array.from({ length: Math.max(0, 8 - courses.length) }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.courseBox} />
          ))}
        </View>

        <AppText style={styles.sectionTitle} bold>
          Overview
        </AppText>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewBox}>
            <AppText style={styles.overviewText}>
              Streak: {userData?.streak || 0} days 🔥
            </AppText>
          </View>
          <View style={styles.overviewBox}>
            <TouchableOpacity onPress={() => router.push('/calendar')}>
              <AppText style={styles.overviewText}>
                D-Day: {calculateDDay()}
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.overviewBox}>
            <TouchableOpacity onPress={() => router.push('/calendar')}>
              <AppText style={styles.overviewText}>
                Assignment Left: {calculateAssignmentLeft()}
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.overviewBox}>
            <View style={styles.progressCircleWrapper}>
              <View style={styles.chartContainer}>
                <View style={styles.backgroundCircle} />
                <AnimatedCircularProgress
                  size={circleSize}
                  width={circleWidth}
                  fill={overallProgress * 100}
                  tintColor="#B9E184"
                  backgroundColor="#C1C1C1"
                  rotation={0}
                />
                <View style={styles.innerCircleWrapper}>
                  <AppText style={[styles.chartTitle, { fontSize: circleFontSize }]} bold>
                    {Math.round(overallProgress * 100)}%
                  </AppText>
                </View>
              </View>
            </View>
            <AppText style={styles.overviewText}>
              Progress
            </AppText>
          </View>
        </View>
      </View>

      <Modal
        isVisible={isSettingsVisible}
        onBackdropPress={() => setIsSettingsVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={handleEditUserData} style={styles.modalOption}>
            <AppText style={styles.modalText}>
              Edit User Data
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.modalOption}>
            <AppText style={styles.modalText}>
              Logout
            </AppText>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isEditVisible}
        onBackdropPress={() => setIsEditVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <AppText style={styles.modalTitle} bold>
            Edit Profile
          </AppText>
          <TextInput
            style={styles.input}
            value={editData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="First Name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={editData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Last Name"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={editData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
            placeholder="Student ID"
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={saveEditData} style={styles.modalOption}>
            <AppText style={styles.saveButtonText}>
              Save
            </AppText>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  header: ViewStyle;
  profileIcon: ViewStyle;
  settingsIcon: ViewStyle;
  whiteCard: ViewStyle;
  divider: ViewStyle;
  coursesGrid: ViewStyle;
  courseBox: ViewStyle;
  overviewGrid: ViewStyle;
  overviewBox: ViewStyle;
  progressCircleWrapper: ViewStyle;
  chartContainer: ViewStyle;
  backgroundCircle: ViewStyle;
  innerCircleWrapper: ViewStyle;
  modal: ViewStyle;
  modalContent: ViewStyle;
  modalOption: ViewStyle;
  saveButton: ViewStyle;
  name: TextStyle;
  studentId: TextStyle;
  sectionTitle: TextStyle;
  courseText: TextStyle;
  overviewText: TextStyle;
  chartTitle: TextStyle;
  modalText: TextStyle;
  modalTitle: TextStyle;
  input: TextStyle;
  saveButtonText: TextStyle;
}>({
  container: {
    flexGrow: 1,
    backgroundColor: '#FBEB77',
    padding: isDesktop ? 40 * scaleFactor : 20 * scaleFactor,
    paddingBottom: isDesktop ? 100 * scaleFactor : 80 * scaleFactor,
    paddingTop: 0,
  },
  header: {
    position: 'absolute',
    top: 20 * scaleFactor,
    right: 20 * scaleFactor,
    zIndex: 10,
  },
  profileIcon: {
    width: 90 * scaleFactor,
    height: 90 * scaleFactor,
    borderRadius: 50 * scaleFactor,
    backgroundColor: '#F3A261',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 50 * scaleFactor,
    left: '50%',
    marginLeft: -45 * scaleFactor,
    zIndex: 5,
  },
  settingsIcon: {
    padding: 5 * scaleFactor,
  },
  whiteCard: {
    marginTop: 100 * scaleFactor,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 50 * scaleFactor,
    padding: 20 * scaleFactor,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontSize: isDesktop ? 30 * scaleFactor : 24 * scaleFactor,
    textAlign: 'center',
  },
  studentId: {
    fontSize: isDesktop ? 20 * scaleFactor : 16 * scaleFactor,
    color: '#555',
    textAlign: 'center',
    marginVertical: 5 * scaleFactor,
  },
  divider: {
    height: 1 * scaleFactor,
    backgroundColor: '#000',
    marginVertical: 10 * scaleFactor,
  },
  sectionTitle: {
    fontSize: isDesktop ? 24 * scaleFactor : 20 * scaleFactor,
    marginVertical: 10 * scaleFactor,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20 * scaleFactor,
  },
  courseBox: {
    width: isDesktop ? '18%' : '22%',
    aspectRatio: 1,
    backgroundColor: '#B9E184',
    marginBottom: 10 * scaleFactor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5 * scaleFactor,
  },
  courseText: {
    color: '#fff',
    fontSize: isDesktop ? 16 * scaleFactor : 16 * scaleFactor,
    textAlign: 'center',
    paddingHorizontal: 5 * scaleFactor,
    paddingVertical: 2 * scaleFactor,
    flexWrap: 'wrap' as const,
    maxWidth: '90%',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewBox: {
    width: isDesktop ? '23%' : '48%',
    aspectRatio: isDesktop ? 2.5 : 1.5,
    backgroundColor: '#648dcb',
    marginBottom: 15 * scaleFactor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10 * scaleFactor,
  },
  progressCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
    width: circleSize,
    height: circleSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#F3A261',
  },
  innerCircleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    color: '#fff',
  },
  overviewText: {
    color: '#fff',
    fontSize: isDesktop ? 18 * scaleFactor : 16 * scaleFactor,
    marginTop: 5 * scaleFactor,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: isDesktop ? 30 * scaleFactor : 20 * scaleFactor,
    borderTopLeftRadius: 10 * scaleFactor,
    borderTopRightRadius: 10 * scaleFactor,
  },
  modalOption: {
    paddingVertical: 15 * scaleFactor,
    borderBottomWidth: 1 * scaleFactor,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: isDesktop ? 18 * scaleFactor : 16 * scaleFactor,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: isDesktop ? 24 * scaleFactor : 20 * scaleFactor,
    marginBottom: 15 * scaleFactor,
    textAlign: 'center',
  },
  input: {
    height: 40 * scaleFactor,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5 * scaleFactor,
    marginBottom: 10 * scaleFactor,
    paddingHorizontal: 10 * scaleFactor,
    fontSize: isDesktop ? 16 * scaleFactor : 14 * scaleFactor,
    fontFamily: 'CheapAsChipsDEMO',
  },
  saveButton: {
    backgroundColor: '#648dcb',
    paddingVertical: 10 * scaleFactor,
    borderRadius: 5 * scaleFactor,
    alignItems: 'center',
    marginTop: 10 * scaleFactor,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: isDesktop ? 16 * scaleFactor : 14 * scaleFactor,
    textAlign: 'center',
  },
});