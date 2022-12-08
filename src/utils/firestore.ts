import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
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
export const createUserData = async (userId: string, userData: Record<string, string>) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, userData);
};
export const updateBearMoney = async (userId: string, bearMoney: number, addMoney: number) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    bearMoney: bearMoney + addMoney,
  });
};
export const updateTeacherData = async (
  userId: string,
  certificate: string,
  teacherIntroduction: string,
  teacherExperience: string
) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    identity: "teacher",
    certificate,
    teacher_introduction: teacherIntroduction,
    teacher_experience: teacherExperience,
    beTeacherTime: Date.now(),
  });
};
export const updateAvatar = async (userId: string, avatarURL: string) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    photoURL: avatarURL,
  });
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

export const getCoursesList = async () => {
  const videoCoursesRef = collection(db, "video_courses");
  const querySnapshot = await getDocs(videoCoursesRef);
  const results: {
    name: string;
    id: string;
    price: number;
    cover: string;
    reviews: { score: number; comments: string }[];
    launchTime: number;
  }[] = [];
  querySnapshot.forEach((data) => {
    const id = data.data().id as string;
    const name = data.data().name as string;
    const price = data.data().price as number;
    const cover = data.data().cover as string;
    const reviews = data.data().reviews as { score: number; comments: string }[];
    const launchTime = data.data().launchTime as number;
    results.push({
      id,
      name,
      price,
      cover,
      reviews,
      launchTime,
    });
  });
  return results;
};
export const getTeachersList = async () => {
  const usersRef = collection(db, "users");
  const teachersQuery = query(usersRef, where("identity", "==", "teacher"));
  const querySnapshot = await getDocs(teachersQuery);
  const results: {
    name: string;
    uid: string;
    reviews: { score: number }[];
    avatar: string;
    introduction: string;
    experience: string;
    beTeacherTime: number;
  }[] = [];
  querySnapshot.forEach((data) => {
    const uid = data.data().uid as string;
    const name = data.data().username as string;
    const reviews = data.data().reviews as { score: number }[];
    const avatar = data.data().photoURL as string;
    const introduction = data.data().teacher_introduction as string;
    const experience = data.data().teacher_experience as string;
    const beTeacherTime = data.data().beTeacherTime as number;
    results.push({
      uid,
      name,
      reviews: reviews || [],
      avatar,
      introduction,
      experience,
      beTeacherTime,
    });
  });
  return results;
};

interface CourseDataInterface {
  id: string;
  name: string;
  chapters: ChapterInterface[];
  introduction: string;
  introductionVideo: string;
  teacherId: string;
  cover: string;
  price: string;
  reviews: ReviewInterface[];
}

export const updateCartItem = async (userId: string, courseData: CourseDataInterface) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    cartItems: arrayUnion({
      id: courseData.id,
      name: courseData.name,
      cover: courseData.cover,
      price: courseData.price,
    }),
  });
};

interface CartItem {
  cover: string;
  name: string;
  price: string;
  id: string;
}

export const deleteCartItem = async (userId: string, item: CartItem) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    cartItems: arrayRemove({
      cover: item.cover,
      name: item.name,
      price: item.price,
      id: item.id,
    }),
  });
};

export const checkout = async (userId: string, bearMoney: number, subtotal: number, cartItems: CartItem[]) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    cartItems: [],
    bearMoney: bearMoney - subtotal,
  });
  await Promise.all(
    cartItems.map(async (item) => {
      await updateDoc(docRef, {
        boughtCourses: arrayUnion(item.id),
      });
    })
  );
};

export const getLaunchedVideoCourses = async (teacherId: string) => {
  const coursesRef = collection(db, "video_courses");
  const teachersQuery = query(coursesRef, where("teacher_id", "==", teacherId));
  const querySnapshot = await getDocs(teachersQuery);
  const launchedVideoCourses = querySnapshot.docs.map((course) => {
    const name = course.data().name as string;
    const cover = course.data().cover as string;
    const id = course.data().id as string;
    const reviews = course.data().reviews as { userId: string; score: number; comments: string }[];
    return { name, cover, id, reviews };
  });
  return launchedVideoCourses;
};

export const getMyVideoCourses = async (myVideoCourses: string[]) => {
  const results: { name: string; cover: string; id: string; reviews: ReviewInterface[] }[] = [];
  await Promise.all(
    myVideoCourses.map(async (id: string) => {
      const videoDocRef = doc(db, "video_courses", id);
      const data = await getDoc(videoDocRef);
      if (data.exists() && data) {
        const courseId = data.data().id as string;
        const name = data.data().name as string;
        const cover = data.data().cover as string;
        const reviews = data.data().reviews as ReviewInterface[];
        results.push({
          id: courseId,
          name,
          cover,
          reviews,
        });
      }
    })
  );
  return results;
};
export const createVideoCourse = async (courseData: {
  name: string;
  cover: string;
  price: number;
  introduction: string;
  introductionVideo: string;
  teacher_id: string;
  chapters: ChapterInterface[];
  reviews: ReviewInterface[];
}) => {
  const newVideoCoursesRef = doc(collection(db, "video_courses"));
  await setDoc(newVideoCoursesRef, {
    ...courseData,
    id: newVideoCoursesRef.id,
    launchTime: Date.now(),
  });
};
export const addVideoCourseReview = async (
  courseId: string,
  review: {
    userId: string;
    score: number;
    comments: string;
  }
) => {
  const courseRef = doc(db, "video_courses", courseId);
  await updateDoc(courseRef, {
    reviews: arrayUnion(review),
  });
};

interface PostInterface {
  id: string;
  time: string;
  title: string;
  content: string;
  preview?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  picPreview?: string;
  messages?: [];
  messagesQty: number;
  likes?: [];
  likesQty: number;
}

export const getAllArticles = async () => {
  const q = query(collection(db, "posts"), orderBy("time", "desc"));
  const querySnapshot = await getDocs(q);
  const results: PostInterface[] = querySnapshot.docs.map((data) => {
    const article = data.data() as PostInterface;
    const images = article?.content?.match(/<img.*?>/g);
    const paragraphs = article?.content?.match(/<p>.*?<\/p>/g);
    const messagesQty = article?.messages?.length || 0;
    const likesQty = article?.likes?.length || 0;
    let preview = "";
    let picPreview = "";
    if (paragraphs) preview = `${paragraphs[0].slice(3, -4)}...`;
    if (images) [picPreview] = images;
    const id = data.data().id as string;
    const title = data.data().title as string;
    const content = data.data().content as string;
    const authorId = data.data().author as string;
    return {
      id,
      time: new Date(data.data().time as string).toLocaleString(),
      title,
      content,
      authorId,
      preview,
      picPreview,
      messagesQty,
      likesQty,
    };
  });
  return results;
};

export const getArticle = async (articleId: string) => {
  const articleRef = doc(db, "posts", articleId);
  const articleSnap = await getDoc(articleRef);
  return articleSnap;
};

export const createArticle = async (articleData: { author: string; title: string; content: string; time: number }) => {
  const newPostRef = doc(collection(db, "posts"));
  await setDoc(newPostRef, { ...articleData, id: newPostRef.id });
};

export const deleteArticle = async (articleId: string) => {
  const articleRef = doc(db, "posts", articleId);
  await deleteDoc(articleRef);
};

interface MessageInterface {
  time: string | number;
  message: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  identity: string;
  likes: string[];
}
export const updateArticle = async (articleId: string, articleData: Record<string, string | MessageInterface[]>) => {
  const articleRef = doc(db, "posts", articleId);
  await updateDoc(articleRef, articleData);
};

export const createArticleMessage = async (
  articleId: string,
  message: { authorId: string; time: number; message: string; likes: string[] }
) => {
  const articleRef = doc(db, "posts", articleId);
  await updateDoc(articleRef, {
    messages: arrayUnion(message),
  });
};

export const likeArticle = async (articleId: string, userId: string) => {
  const articleRef = doc(db, "posts", articleId);
  await updateDoc(articleRef, { likes: arrayUnion(userId) });
};
export const dislikeArticle = async (articleId: string, userId: string) => {
  const articleRef = doc(db, "posts", articleId);
  await updateDoc(articleRef, { likes: arrayRemove(userId) });
};
