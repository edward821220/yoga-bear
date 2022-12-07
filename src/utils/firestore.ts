import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface ChapterInterface {
  id: number;
  title: string;
  units: { id: number; title: string; video: string }[];
}
interface ReviewInterface {
  comments: string;
  score: number;
  userId: string;
}

export const getVideoCourse = async (courseId: string) => {
  const docRef = doc(db, "video_courses", courseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return {
      notFound: true,
    };
  }
  const id = docSnap.data().id as string;
  const name = docSnap.data().name as string;
  const chapters = docSnap.data().chapters as ChapterInterface[];
  const introduction = docSnap.data().introduction as string;
  const introductionVideo = docSnap.data().introductionVideo as string;
  const teacherId = docSnap.data().teacher_id as string;
  const cover = docSnap.data().cover as string;
  const price = docSnap.data().price as number;
  const reviews = docSnap.data().reviews as ReviewInterface[];
  const courseData = { id, name, chapters, introduction, introductionVideo, teacherId, cover, price, reviews };
  return courseData;
};

export const getUserData = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap;
};

interface CoursesListInterface {
  id: string;
  cover: string;
  name: string;
  price: number;
}
interface TeachersListInterface {
  id: string;
  avatar: string;
  name: string;
}
export const getRecommended = async () => {
  const coursesRef = collection(db, "video_courses");
  const queryCourses = await getDocs(query(coursesRef, where("price", "<", 2000), limit(9)));
  const coursesList: CoursesListInterface[] = [];
  queryCourses.forEach((data) => {
    const id = data.data().id as string;
    const cover = data.data().cover as string;
    const name = data.data().name as string;
    const price = data.data().price as number;
    coursesList.push({ id, cover, name, price });
  });

  const usersRef = collection(db, "users");
  const queryTeachers = await getDocs(query(usersRef, where("identity", "==", "teacher"), limit(10)));
  const teachersList: TeachersListInterface[] = [];
  queryTeachers.forEach((data) => {
    const id = data.data().uid as string;
    const avatar = data.data().photoURL as string;
    const name = data.data().username as string;
    teachersList.push({ id, avatar, name });
  });
  return { coursesList, teachersList };
};