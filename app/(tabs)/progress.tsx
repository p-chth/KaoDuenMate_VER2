import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { AppText } from '@/components/AppText';
import { db, auth } from '@/firebaseConfig';

type Topic = { id: number; title: string; done: boolean };
type Course = { id: number; title: string; topics: Topic[]; expanded: boolean };

export default function ProgressScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [editingTopic, setEditingTopic] = useState<{
    courseId: number;
    topicId: number;
  } | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState<string>('');
  const [editingTopicTitle, setEditingTopicTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchCourses(user.uid);
      } else {
        setUserId(null);
        setCourses([]);
        Alert.alert('Please sign in to access your courses.');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async (uid: string) => {
    try {
      setLoading(true);
      const coursesCollection = collection(db, `users/${uid}/courses`);
      const querySnapshot = await getDocs(coursesCollection);
      const fetchedCourses: Course[] = querySnapshot.docs.map((doc) => ({
        id: Number(doc.id),
        title: doc.data().title,
        topics: doc.data().topics || [],
        expanded: false,
      }));
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to add a course.');
      return;
    }
    const newCourse: Course = {
      id: Date.now(),
      title: `Course ${courses.length + 1}`,
      topics: [],
      expanded: false,
    };
    try {
      const courseRef = doc(db, `users/${userId}/courses/${newCourse.id}`);
      await setDoc(courseRef, {
        title: newCourse.title,
        topics: newCourse.topics,
      });
      setCourses((prev) => [...prev, newCourse]);
    } catch (error) {
      console.error('Error adding course:', error);
      Alert.alert('Error', 'Failed to add course.');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!userId) return;
    try {
      const courseRef = doc(db, `users/${userId}/courses/${id}`);
      await deleteDoc(courseRef);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      Alert.alert('Error', 'Failed to delete course.');
    }
  };

  const toggleTopicDone = async (courseId: number, topicId: number) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              topics: course.topics.map((t) =>
                t.id === topicId ? { ...t, done: !t.done } : t
              ),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        topics: updatedCourses.find((c) => c.id === courseId)?.topics,
      });
      setCourses(updatedCourses);
      if (updatedCourses.find((c) => c.id === courseId)?.topics.find((t) => t.id === topicId)?.done) {
        await updateStreak();
      }
    } catch (error) {
      console.error('Error toggling topic:', error);
      Alert.alert('Error', 'Failed to update topic.');
    }
  };

  const addTopic = async (courseId: number) => {
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to add a topic.');
      return;
    }
    console.log('addTopic: courseId:', courseId, 'courses:', courses);
    
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      Alert.alert('Error', 'Course not found. Please try again.');
      return;
    }
    
    const newTopic: Topic = {
      id: Date.now(),
      title: `Topic ${course.topics.length + 1}`,
      done: false,
    };
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? { ...course, topics: [...course.topics, newTopic] }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        topics: updatedCourses.find((c) => c.id === courseId)?.topics,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error adding topic:', error);
      Alert.alert('Error', 'Failed to add topic.');
    }
  };

  const deleteTopic = async (courseId: number, topicId: number) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              topics: course.topics.filter((t) => t.id !== topicId),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        topics: updatedCourses.find((c) => c.id === courseId)?.topics,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error deleting topic:', error);
      Alert.alert('Error', 'Failed to delete topic.');
    }
  };

  const toggleExpand = (id: number) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id
          ? { ...course, expanded: !course.expanded }
          : course
      )
    );
  };

  const updateTopicTitle = async (
    courseId: number,
    topicId: number,
    newTitle: string
  ) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              topics: course.topics.map((t) =>
                t.id === topicId ? { ...t, title: newTitle } : t
              ),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        topics: updatedCourses.find((c) => c.id === courseId)?.topics,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error updating topic title:', error);
      Alert.alert('Error', 'Failed to update topic title.');
    }
  };

  const updateCourseTitle = async (courseId: number, newTitle: string) => {
    if (!userId) return;
    try {
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, { title: newTitle });
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, title: newTitle } : course
        )
      );
    } catch (error) {
      console.error('Error updating course title:', error);
      Alert.alert('Error', 'Failed to update course title.');
    }
  };

  const updateStreak = async () => {
    if (!userId) return;
    const now = new Date('2025-05-18');
    const today = now.toISOString().split('T')[0];
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    let streak = userDoc.exists() && userDoc.data().streak ? userDoc.data().streak : 0;
    const lastActiveDate = userDoc.exists() && userDoc.data().lastActiveDate ? userDoc.data().lastActiveDate : null;
    const lastStreakUpdate = userDoc.exists() && userDoc.data().lastStreakUpdate ? userDoc.data().lastStreakUpdate : null;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStreakUpdate === today) {
      return;
    }

    if (!lastActiveDate || lastActiveDate < yesterdayStr) {
      streak = 1;
    } else if (lastActiveDate === today || lastActiveDate === yesterdayStr) {
      streak += 1;
    }

    try {
      await updateDoc(userRef, {
        streak: streak,
        lastActiveDate: today,
        lastStreakUpdate: today,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      Alert.alert('Error', 'Failed to update streak.');
    }
  };

  const calculateCourseProgress = (topics: Topic[]) =>
    topics.length ? topics.filter((t) => t.done).length / topics.length : 0;

  const calculateOverallProgress = () => {
    const allTopics = courses.flatMap((c) => c.topics);
    return allTopics.length
      ? allTopics.filter((t) => t.done).length / allTopics.length
      : 0;
  };

  useEffect(() => {
    setOverallProgress(calculateOverallProgress());
  }, [courses]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.relativeWrapper}>
        <View style={styles.progressCircleWrapper}>
          <View style={styles.chartContainer}>
            <View style={styles.backgroundCircle} />
            <AnimatedCircularProgress
              size={140}
              width={13}
              fill={overallProgress * 100}
              tintColor="#B9E184"
              backgroundColor="#C1C1C1"
              rotation={0}
            />
            <View style={styles.innerCircleWrapper}>
              <View style={styles.textContainer}>
                <AppText style={styles.chartTitle} bold>
                  Progress
                </AppText>
                <AppText style={styles.chartTitle} bold>
                  chart
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={{ marginTop: 50 }}></View>
          {courses.map((course) => {
            const courseProgress = calculateCourseProgress(course.topics);
            return (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(course.id)}
                    style={styles.dropdownIcon}
                  >
                    <Ionicons
                      name={
                        course.expanded ? 'chevron-down' : 'chevron-forward'
                      }
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>

                  {editingCourseId === course.id ? (
                    <TextInput
                      style={styles.courseTitleInput}
                      value={newCourseTitle}
                      onChangeText={setNewCourseTitle}
                      onBlur={() => {
                        updateCourseTitle(
                          course.id,
                          newCourseTitle.trim() || course.title
                        );
                        setEditingCourseId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setEditingCourseId(course.id);
                        setNewCourseTitle(course.title);
                      }}
                      style={{ flex: 1 }}
                    >
                      <AppText style={styles.courseTitle} bold>
                        {course.title}
                      </AppText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteCourse(course.id)}>
                    <Ionicons name="trash-bin" size={20} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { flex: courseProgress }]}
                    />
                    <View style={{ flex: 1 - courseProgress }} />
                  </View>
                  <AppText style={styles.percentText} bold>
                    {Math.round(courseProgress * 100)}%
                  </AppText>
                </View>

                {course.expanded && (
                  <>
                    {course.topics.map((topic) => (
                      <View key={topic.id} style={styles.topicItem}>
                        <TouchableOpacity
                          onPress={() => toggleTopicDone(course.id, topic.id)}
                        >
                          <Ionicons
                            name={topic.done ? 'checkbox' : 'square-outline'}
                            size={20}
                            color="black"
                          />
                        </TouchableOpacity>

                        {editingTopic?.courseId === course.id &&
                        editingTopic?.topicId === topic.id ? (
                          <TextInput
                            style={styles.topicInput}
                            value={editingTopicTitle}
                            onChangeText={setEditingTopicTitle}
                            onBlur={() => {
                              updateTopicTitle(
                                course.id,
                                topic.id,
                                editingTopicTitle.trim() || topic.title
                              );
                              setEditingTopic(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              setEditingTopic({
                                courseId: course.id,
                                topicId: topic.id,
                              });
                              setEditingTopicTitle(topic.title);
                            }}
                            style={{ flex: 1 }}
                          >
                            <AppText style={styles.topicText}>
                              {topic.title}
                            </AppText>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => deleteTopic(course.id, topic.id)}
                        >
                          <Ionicons name="trash-bin" size={20} color="#6C6868" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addTopic(course.id)}>
                      <AppText style={styles.addTopicText} bold>
                        + add topic
                      </AppText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}

          <TouchableOpacity onPress={addCourse} disabled={loading} style={styles.addCourseButton}>
            <AppText style={styles.addCourseText} bold>
              + add course
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FBEB77',
    alignItems: 'center',
    paddingBottom: 30,
  },
  relativeWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircleWrapper: {
    marginTop: 20,
    position: 'absolute',
    top: 0,
    zIndex: 10,
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  chartContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 95,
    backgroundColor: '#648dcb',
  },
  innerCircleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    color: 'white',
    fontSize: 20,
  },
  whiteCard: {
    marginTop: 130,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingTop: 40,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  courseCard: {
    backgroundColor: '#F3A261',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownIcon: {
    paddingRight: 5,
  },
  courseTitle: {
    fontSize: 16,
    flex: 1,
  },
  courseTitleInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#888',
    paddingVertical: 2,
    flex: 1,
    fontFamily: 'CheapAsChipsDEMO',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    flexDirection: 'row',
    backgroundColor: '#DDD',
    borderRadius: 3,
  },
  progressFill: {
    backgroundColor: '#648dcb',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 14,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  topicText: {
    flex: 1,
    fontSize: 14,
  },
  topicInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#888',
    paddingVertical: 2,
    fontFamily: 'CheapAsChipsDEMO',
  },
  addTopicText: {
    color: '#000',
    marginTop: 5,
    fontSize: 14,
  },
  addCourseButton: {
    marginTop: 20,
    marginHorizontal: 80,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    borderRadius: 10,
  },
  addCourseText: {
    fontSize: 18,
  },
});