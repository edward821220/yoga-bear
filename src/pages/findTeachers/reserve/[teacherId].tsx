import styled from "styled-components";
import { useRouter } from "next/router";
import ReserveCalendar from "../../../components/calendar/reserveCalendar";

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 0;
`;

export default function Reserve() {
  const router = useRouter();
  const { teacherId } = router.query;
  return <Wrapper>{typeof teacherId === "string" && <ReserveCalendar teacherId={teacherId} />}</Wrapper>;
}
