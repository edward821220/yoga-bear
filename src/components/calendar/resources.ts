const levelData = [
  {
    text: "初學者",
    id: 1,
    color: "#FFE15D",
  },
  {
    text: "一般練習者",
    id: 2,
    color: "#F49D1A",
  },
  {
    text: "進階練習者",
    id: 3,
    color: "#DC3535",
  },
];
const LearningModeData = [
  {
    text: "一對一視訊課",
    id: 1,
    color: "#153462",
  },
  {
    text: "一對一實體課",
    id: 2,
    color: "#7FB77E",
  },
  {
    text: "一對多實體課",
    id: 3,
    color: "#4FA095",
  },
];

const resources = [
  {
    fieldName: "課程難度",
    title: "Level",
    instances: levelData,
  },
  {
    fieldName: "上課方式",
    title: "LearningMode",
    instances: LearningModeData,
  },
];

export default resources;
