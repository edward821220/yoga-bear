import { useRef, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import Button from "../../../public/member.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 50px;
`;
const VideoDiv = styled.div`
  width: 100vw;
  height: 100vh;
`;
const Video = styled.video``;
const ControlsContatiner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  background-color: transparent;
  margin-top: -50vw;
  padding: 0 40px;
  z-index: 20;
`;
const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding-top: 18rem;
  margin: auto;
`;
const ControlIcons = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  cursor: pointer;
  margin-left: 10rem;
  margin-right: 10rem;
`;
const ControlIconsSmall = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  margin-left: 10rem;
  margin-right: 10rem;
  cursor: pointer;
`;
const TimeControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  position: absolute;
  bottom: 4rem;
  margin-left: 10vw;
`;
const TimeProgressBarContainer = styled.div`
  background-color: gray;
  border-radius: 15px;
  width: 75vw;
  height: 5px;
  z-index: 30;
  position: relative;
  margin: 0 20px;
`;
const TimeProgressBar = styled.div`
  border-radius: 15px;
  background-color: indigo;
  height: 100%;
`;
const ControlTime = styled.p`
  color: white;
`;

function Player() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoHandler = (control) => {
    if (control === "play") {
      videoRef.current.play();
      setPlaying(true);
      setVideoTime(videoRef.duration);
    } else if (control === "pause") {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const fastForward = () => {
    videoRef.current.currentTime += 5;
  };

  const revert = () => {
    videoRef.current.currentTime -= 5;
  };

  setInterval(() => {
    setCurrentTime(videoRef.current?.currentTime);
    setProgress((videoRef.current?.currentTime / videoTime) * 100);
  }, 1000);

  return (
    <Wrapper>
      <VideoDiv className="Player">
        <Video
          ref={videoRef}
          src="https://firebasestorage.googleapis.com/v0/b/yoga-bear-5faab.appspot.com/o/%E5%BE%8C%E5%BD%8E%E4%B8%80%E4%B8%8B%2F12.%20%E8%BC%AA%E5%BC%8F.MP4?alt=media&token=55c3dc56-0c23-4c60-864c-8cd005248638"
          controls
        />

        <ControlsContatiner>
          <Controls>
            <ControlIcons>
              <Image onClick={revert} alt="" src={Button} fill sizes="contain" />
            </ControlIcons>
            <ControlIconsSmall>
              {playing ? (
                <Image onClick={() => videoHandler("pause")} alt="" src={Button} fill sizes="contain" />
              ) : (
                <Image onClick={() => videoHandler("play")} alt="" src={Button} fill sizes="contain" />
              )}
            </ControlIconsSmall>
            <ControlIcons>
              <Image className="controlsIcon" onClick={fastForward} alt="" src={Button} />
            </ControlIcons>
          </Controls>
        </ControlsContatiner>

        <TimeControls className="timecontrols">
          <ControlTime className="controlsTime">
            {`${Math.floor(currentTime / 60)}:${`0${Math.floor(currentTime % 60)}`.slice(-2)}`}
          </ControlTime>
          <TimeProgressBarContainer className="time_progressbarContainer">
            <TimeProgressBar style={{ width: `${progress}%` }} className="time_progressBar" />
          </TimeProgressBarContainer>
          <ControlTime>{`${Math.floor(videoTime / 60)}:${`0${Math.floor(videoTime % 60)}`.slice(-2)}`}</ControlTime>
        </TimeControls>
      </VideoDiv>
    </Wrapper>
  );
}

export default Player;
