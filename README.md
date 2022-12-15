# Yoga Bear

#### [Website URL](https://yoga-bear.vercel.app/)

##### Test Account :

| email           | password |
| --------------- | -------- |
| jeany@gmail.com | jeany123 |

## Intro

Yoga Bear is a C2C platform that matches yoga instructors with those interested in learning yoga.  
You can take yoga courses online, offline, or through videos.  
[Demo Video](https://drive.google.com/file/d/1-i_b_hHjgJBYPsL0q9M4yLUWrf2o1are/view?usp=share_link)
![img](https://i.imgur.com/bFbe4Sd.png)

## Techniques

- Built the website by [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/). (applied SSG, SSR, and CSR on different pages).
- Implemented group video chat with Next.js [serverless function](https://vercel.com/docs/concepts/functions/serverless-functions), [Pusher.js](https://pusher.com/) (WebSockets server library), and [WebRTC](https://webrtc.org/).
- Made a customized video player for the course room. (included window full screen, full screen, thumbnail on time-progress-bar, forward, rewind, speed control, and voice control functions.)
- Enabled users to launch video courses and upload course covers, member avatars, and article pictures through [Firebase Cloud Storage](https://firebase.google.com/products/storage).
- Compressed images (<1MB) before users uploaded to improve loading speed and reduce storage costs with [browser-image-compression](https://www.npmjs.com/package/browser-image-compression).
- Integrated a text editor which can upload images with [React-Quill](https://www.npmjs.com/package/react-quill) and [Firebase Cloud Storage](https://firebase.google.com/products/storage).
- Used [Firebase Firestore](https://firebase.google.com/products/firestore) for data management (included users, courses, and articles data.).
- Provided a calendar with reserving, reviewing, and joining room functions integrated for users to schedule their online and offline courses by [React-Scheduler](https://devexpress.github.io/devextreme-reactive/react/scheduler/) and [Material-UI](https://mui.com/).
- Used [EmailJS](https://www.emailjs.com/) to send confirmation mail after buying or reserving courses.
- Wrote some unit tests, integration tests (for React functional components), and snapshot tests by [Jest](https://jestjs.io/) with [React-Testing-Library](https://testing-library.com/docs/react-testing-library/intro/).
- Managed global states by [Recoil](https://recoiljs.org/) and treated nested states as immutable via [Immer](https://immerjs.github.io/immer/).
- Used [ESLint](https://eslint.org/) [(Airbnb config)](https://www.npmjs.com/package/eslint-config-airbnb) to lint my code.

![img](https://i.imgur.com/1ruwn00.png)

## Sitemap

![img](https://i.imgur.com/JBTmfIi.png)

## Features

### Member System

Users can sign up and login by email and select their identities (teacher or student).
![img](https://i.imgur.com/oSua5gf.png)

### Payment System

Users can input a fake credit card to top-up bear money.  
Bear money can reserve online, offline courses or buy video courses.
![img](https://i.imgur.com/24dO2T6.png)

### Browse All Video Courses

Users can browse all video courses and buy the course they like.
![img](https://i.imgur.com/GebeAg7.png)

### Browse All Teachers

Users can browse all teachers and reserve their courses.
![img](https://i.imgur.com/VLY8C18.png)

### Calendar

Students can use calendar to reserve and review online, offline courses and enter the video-call room.  
Teachers cna use calendar to arrange their online, offline courses and enter the video-call room.
![img](https://i.imgur.com/3VIyYpK.png)

### MyCourses

Uses can browse all courses they bought and all courses they reserved on myCourses page.
![img](https://i.imgur.com/IKejd0g.png)

### Video Course Room

Users can enter the video course room which they have bought.
![img](https://i.imgur.com/Bok1yWJ.png)

### Video-Call Course Room

Users can enter the video-call course room which they have reserved.
![img](https://i.imgur.com/S0eB7Km.png)

### Forum

Users can post articles, leave messages, and click the like button on forum page.
![img](https://i.imgur.com/VXxDfKq.png)
