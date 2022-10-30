import React from "react";
import { useRouter } from "next/router";

function StudentRoom() {
  const router = useRouter();
  const { room } = router.query;
  return <div>studentRoom{room}</div>;
}

export default StudentRoom;
