import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebaseConfig'; // Adjust path to your firebase.ts file

type Task = { id: number; title: string; done: boolean };
type Course = { id: number; title: string; tasks: Task[]; expanded: boolean };

export default function ProgressScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [editingTask, setEditingTask] = useState<{
    courseId: number;
    taskId: number;
  } | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState<string>('');
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state changes
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

  // Fetch courses from Firestore
  const fetchCourses = async (uid: string) => {
    try {
      setLoading(true); 
      const coursesCollection = collection(db, `users/${uid}/courses`);
      const querySnapshot = await getDocs(coursesCollection);
      const fetchedCourses: Course[] = querySnapshot.docs.map((doc) => ({
        id: Number(doc.id),
        title: doc.data().title,
        tasks: doc.data().tasks || [],
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
  

  // Add a new course
  const addCourse = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to add a course.');
      return;
    }
    const newCourse: Course = {
      id: Date.now(),
      title: `Course ${courses.length + 1}`,
      tasks: [],
      expanded: false,
    };
    try {
      const courseRef = doc(db, `users/${userId}/courses/${newCourse.id}`);
      await setDoc(courseRef, {
        title: newCourse.title,
        tasks: newCourse.tasks,
      });
      setCourses((prev) => [...prev, newCourse]);
    } catch (error) {
      console.error('Error adding course:', error);
      Alert.alert('Error', 'Failed to add course.');
    }
  };

  // Delete a course
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

  // Toggle task done status
  const toggleTaskDone = async (courseId: number, taskId: number) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              tasks: course.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        tasks: updatedCourses.find((c) => c.id === courseId)?.tasks,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  // Add a new task
  const addTask = async (courseId: number) => {
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to add a task.');
      return;
    }
    // Debug log to check courses and courseId
    console.log('addTask: courseId:', courseId, 'courses:', courses);
    
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      Alert.alert('Error', 'Course not found. Please try again.');
      return;
    }
    
    const newTask: Task = {
      id: Date.now(),
      title: `Task ${course.tasks.length + 1}`,
      done: false,
    };
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? { ...course, tasks: [...course.tasks, newTask] }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        tasks: updatedCourses.find((c) => c.id === courseId)?.tasks,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task.');
    }
  };

  // Delete a task
  const deleteTask = async (courseId: number, taskId: number) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              tasks: course.tasks.filter((t) => t.id !== taskId),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        tasks: updatedCourses.find((c) => c.id === courseId)?.tasks,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  // Toggle course expansion
  const toggleExpand = (id: number) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id
          ? { ...course, expanded: !course.expanded }
          : course
      )
    );
  };
  

  // Update task title
  const updateTaskTitle = async (
    courseId: number,
    taskId: number,
    newTitle: string
  ) => {
    if (!userId) return;
    try {
      const updatedCourses = courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              tasks: course.tasks.map((t) =>
                t.id === taskId ? { ...t, title: newTitle } : t
              ),
            }
          : course
      );
      const courseRef = doc(db, `users/${userId}/courses/${courseId}`);
      await updateDoc(courseRef, {
        tasks: updatedCourses.find((c) => c.id === courseId)?.tasks,
      });
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error updating task title:', error);
      Alert.alert('Error', 'Failed to update task title.');
    }
  };

  // Update course title
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

  const calculateCourseProgress = (tasks: Task[]) =>
    tasks.length ? tasks.filter((t) => t.done).length / tasks.length : 0;

  const calculateOverallProgress = () => {
    const allTasks = courses.flatMap((c) => c.tasks);
    return allTasks.length
      ? allTasks.filter((t) => t.done).length / allTasks.length
      : 0;
  };

  useEffect(() => {
    setOverallProgress(calculateOverallProgress());
  }, [courses]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.relativeWrapper}>
        {/* Circular Progress */}
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
                <Text style={styles.chartTitle}>Progress</Text>
                <Text style={styles.chartTitle}>chart</Text>
              </View>
            </View>
          </View>
        </View>

        {/* White Card Box */}
        <View style={styles.whiteCard}>
          <View style={{ marginTop: 50 }}></View>
          {courses.map((course) => {
            const courseProgress = calculateCourseProgress(course.tasks);
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
                      <Text style={styles.courseTitle}>{course.title}</Text>
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
                  <Text style={styles.percentText}>
                    {Math.round(courseProgress * 100)}%
                  </Text>
                </View>

                {course.expanded && (
                  <>
                    {course.tasks.map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <TouchableOpacity
                          onPress={() => toggleTaskDone(course.id, task.id)}
                        >
                          <Ionicons
                            name={task.done ? 'checkbox' : 'square-outline'}
                            size={20}
                            color="black"
                          />
                        </TouchableOpacity>

                        {editingTask?.courseId === course.id &&
                        editingTask?.taskId === task.id ? (
                          <TextInput
                            style={styles.taskInput}
                            value={editingTaskTitle}
                            onChangeText={setEditingTaskTitle}
                            onBlur={() => {
                              updateTaskTitle(
                                course.id,
                                task.id,
                                editingTaskTitle.trim() || task.title
                              );
                              setEditingTask(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              setEditingTask({
                                courseId: course.id,
                                taskId: task.id,
                              });
                              setEditingTaskTitle(task.title);
                            }}
                            style={{ flex: 1 }}
                          >
                            <Text style={styles.taskText}>{task.title}</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => deleteTask(course.id, task.id)}
                        >
                          <Ionicons name="trash-bin" size={20} color="#6C6868" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addTask(course.id)}>
                      <Text style={styles.addTaskText}>+ add task</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}

          <TouchableOpacity onPress={addCourse} disabled={loading} style={styles.addCourseButton}>
            <Text style={styles.addCourseText}>+ add course</Text>
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
    fontWeight: 'bold',
    fontFamily: 'Cochin',
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
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    fontSize: 16,
    flex: 1,
  },
  courseTitleInput: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Cochin',
    borderBottomWidth: 1,
    borderColor: '#888',
    paddingVertical: 2,
    flex: 1,
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
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  taskText: {
    flex: 1,
    fontFamily: 'Cochin',
  },
  taskInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#888',
    paddingVertical: 2,
  },
  addTaskText: {
    color: '#000',
    marginTop: 5,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
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
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
});