import { useState, useRef } from "react";
import styled from "styled-components";
import Image from "next/image";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Play from "../../../public/play.png";
import Pause from "../../../public/pause.png";
import Forward from "../../../public/forward.png";
import Rewind from "../../../public/rewind.png";
import Voice from "../../../public/voice.png";
import Mute from "../../../public/mute.png";
import Speed from "../../../public/speed.png";
import FullScreenIcon from "../../../public/full-screen.png";
import FullWindow from "../../../public/full-window.png";

const VideoContainer = styled.div<{ isFullScreen: boolean; isFullWindow: boolean }>`
  position: ${(props) => (props.isFullWindow ? "fixed" : "relative")};
  top: ${(props) => props.isFullWindow && "0"};
  left: ${(props) => props.isFullWindow && "0"};
  z-index: ${(props) => props.isFullWindow && "88"};
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  background-color: ${(props) => props.theme.colors.color6};
  @media screen and (max-width: 1188px) {
    margin-bottom: 20px;
  }
  @media screen and (max-width: 760px) {
    width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "98vw")};
  }
  @media screen and (max-width: 600px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "300px")};
  }
  @media screen and (max-width: 500px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "240px")};
  }
`;

const Video = styled.video<{ isFullScreen: boolean; showToolBar: boolean; isFullWindow: boolean }>`
  width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "754px")};
  height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "417px")};
  margin-bottom: 20px;
  cursor: ${(props) => props.showToolBar === false && "none"};
  @media screen and (max-width: 760px) {
    width: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vw" : "98vw")};
  }
  @media screen and (max-width: 600px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "300px")};
  }
  @media screen and (max-width: 500px) {
    height: ${(props) => (props.isFullScreen || props.isFullWindow ? "100vh" : "240px")};
  }
`;
const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 740px;
  height: 60px;
  background-color: #00000050;
  padding: 10px 20px;
  @media screen and (max-width: 760px) {
    width: 98vw;
  }
  @media screen and (max-width: 555px) {
    padding: 10px 10px;
  }
`;
const PlayControls = styled.div`
  display: flex;
`;
const TimeControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;
const TimeProgressBarContainer = styled.div`
  background-color: #484848;
  border-radius: 15px;
  width: 360px;
  height: 15px;
  z-index: 30;
  position: relative;
  margin: 0 20px;
  cursor: pointer;
  @media screen and (max-width: 724px) {
    width: 300px;
  }
  @media screen and (max-width: 655px) {
    width: 250px;
  }
  @media screen and (max-width: 588px) {
    width: 180px;
  }
  @media screen and (max-width: 488px) {
    width: 120px;
  }
  @media screen and (max-width: 412px) {
    width: 80px;
  }
`;
const TimeProgressBar = styled.div`
  border-radius: 15px;
  background-color: ${(props) => props.theme.colors.color3};
  height: 100%;
  filter: brightness(110%);
`;
const ControlTime = styled.p`
  color: ${(props) => props.theme.colors.color1};
`;
const SnapshotContainer = styled.div`
  position: absolute;
  display: block;
  z-index: 1000;
  width: 150px;
  height: 80px;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
`;
const VoiceBarContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 1px;
  display: flex;
  flex-direction: column-reverse;
  width: 24px;
  height: 120px;
  background-color: #484848;
`;
const VoiceBar = styled.div<{ height: number }>`
  background-color: ${(props) => props.theme.colors.color3};
  width: 100%;
  height: ${(props) => props.height}%;
  filter: brightness(110%);
`;
const SpeedMenu = styled.ul`
  position: absolute;
  bottom: 20px;
  transform: translateX(-24px);
  display: flex;
  flex-direction: column;
  width: 88px;
  background-color: #484848;
  @media screen and (max-width: 488px) {
    width: 66px;
    transform: translate(-24px, 10px);
  }
`;
const SpeedOption = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.color1};
  font-size: 18px;
  line-height: 24px;
  height: 36px;
  padding: 5px;
  text-align: center;
  &:hover {
    background-color: ${(props) => props.theme.colors.color3};
  }
  @media screen and (max-width: 488px) {
    font-size: 15px;
    line-height: 20px;
  }
`;
const OtherControls = styled.div`
  display: flex;
`;
const PlayIcon = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;
const ControlIcon = styled.div`
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
  @media screen and (max-width: 555px) {
    width: 16px;
    height: 16px;
    &:last-child {
      margin-right: 0;
    }
  }
`;
const ControlIconFullWindow = styled(ControlIcon)`
  @media screen and (max-width: 760px) {
    display: none;
  }
`;
const SecondVideo = styled.video`
  display: none;
`;

function VideoPlayer({ src, handleSwitch }: { src: string; handleSwitch?: () => void }) {
  const handle = useFullScreenHandle();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFullWindow, setIsFullWindow] = useState(false);
  const [showToolBar, setShowToolBar] = useState(false);
  const [showVoiceBar, setShowVoiceBar] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [snapshot, setSnapshot] = useState("");
  const [voice, setVoice] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const videoHandler = (control: string) => {
    if (!videoRef.current) return;
    switch (control) {
      case "play": {
        videoRef.current.play();
        setIsPlaying(true);
        setVideoTime(videoRef.current.duration);
        break;
      }
      case "pause": {
        videoRef.current.pause();
        setIsPlaying(false);
        break;
      }
      case "forward": {
        videoRef.current.currentTime += 5;
        break;
      }
      case "rewind": {
        videoRef.current.currentTime -= 5;
        break;
      }
      case "mute": {
        setIsMute(true);
        videoRef.current.muted = true;
        break;
      }
      case "voice": {
        setIsMute(false);
        videoRef.current.muted = false;
        break;
      }
      default: {
        break;
      }
    }
  };
  const capture = (video: HTMLVideoElement) => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, w, h);
    return canvas;
  };

  return (
    <FullScreen
      handle={handle}
      onChange={(e) => {
        setIsFullScreen(e);
      }}
    >
      <VideoContainer
        isFullScreen={isFullScreen}
        isFullWindow={isFullWindow}
        onMouseOver={() => {
          setShowToolBar(true);
        }}
        onMouseOut={() => {
          setShowToolBar(false);
        }}
        onMouseMove={() => {
          clearTimeout(timeoutRef.current);
          setShowToolBar(true);
          timeoutRef.current = setTimeout(() => {
            setShowToolBar(false);
          }, 5000);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            videoHandler("forward");
          } else if (e.key === "ArrowLeft") {
            videoHandler("rewind");
          } else if (e.key === " ") {
            videoHandler(isPlaying ? "pause" : "play");
          }
        }}
      >
        <Video
          data-testid="video"
          src={src}
          autoPlay
          isFullScreen={isFullScreen}
          isFullWindow={isFullWindow}
          showToolBar={showToolBar}
          onEnded={handleSwitch}
          onClick={() => {
            if (isPlaying) {
              videoHandler("pause");
            } else {
              videoHandler("play");
            }
          }}
          onTimeUpdate={() => {
            if (!videoRef.current) return;
            setCurrentTime(videoRef.current?.currentTime);
            setProgress((videoRef.current.currentTime / videoTime) * 100);
            setVideoTime(videoRef.current.duration);
          }}
          ref={videoRef}
        />
        {showToolBar && (
          <ToolBar>
            <PlayControls>
              <ControlIcon
                onClick={() => {
                  videoHandler("rewind");
                }}
              >
                <Image src={Rewind} alt="rewind" fill sizes="contain" />
              </ControlIcon>
              {isPlaying === false ? (
                <ControlIcon
                  onClick={() => {
                    videoHandler("play");
                  }}
                >
                  <Image src={Play} alt="play" fill sizes="contain" />
                </ControlIcon>
              ) : (
                <ControlIcon
                  onClick={() => {
                    videoHandler("pause");
                  }}
                >
                  <Image src={Pause} alt="pause" fill sizes="contain" />
                </ControlIcon>
              )}
              <ControlIcon
                onClick={() => {
                  videoHandler("forward");
                }}
              >
                <Image src={Forward} alt="forward" fill sizes="contain" />
              </ControlIcon>
            </PlayControls>
            <TimeControls>
              <ControlTime>
                {`${Math.floor(currentTime / 60)}:${`0${Math.floor(currentTime % 60)}`.slice(-2)}`}
              </ControlTime>
              <TimeProgressBarContainer
                onClick={(e) => {
                  if (!videoRef.current) return;
                  const target = e.currentTarget as HTMLDivElement;
                  const timeAtProgressBar = (e.nativeEvent.offsetX / target.offsetWidth) * videoRef.current.duration;
                  videoRef.current.currentTime = timeAtProgressBar;
                  setCurrentTime(timeAtProgressBar);
                }}
                onMouseMove={(e) => {
                  if (!videoRef.current) return;
                  const target = e.currentTarget as HTMLDivElement;
                  const timeAtProgressBar = Number(
                    ((e.nativeEvent.offsetX / target.offsetWidth) * videoRef.current.duration).toFixed(2)
                  );
                  if (!secondVideoRef.current) return;
                  secondVideoRef.current.currentTime = timeAtProgressBar;
                  const canvas = capture(secondVideoRef.current);
                  setSnapshot(canvas?.toDataURL("image/jpeg", 0.1));
                }}
                onMouseOut={() => {
                  setSnapshot("");
                }}
              >
                <TimeProgressBar style={{ width: `${progress}%` }} />
                {snapshot && (
                  <SnapshotContainer ref={snapshotRef}>
                    <Image src={snapshot} alt="snapshot" fill sizes="contain" />
                  </SnapshotContainer>
                )}
              </TimeProgressBarContainer>
              <ControlTime>{`${Math.floor(videoTime / 60)}:${`0${Math.floor(videoTime % 60)}`.slice(-2)}`}</ControlTime>
            </TimeControls>
            <OtherControls>
              <ControlIcon
                onMouseOver={() => {
                  setShowVoiceBar(true);
                  if (!videoRef.current) return;
                  setVoice(videoRef.current.volume * 100);
                }}
                onMouseOut={() => {
                  setShowVoiceBar(false);
                }}
              >
                {showVoiceBar && (
                  <VoiceBarContainer
                    onClick={(e) => {
                      if (!videoRef.current) return;
                      if (e.target === e.currentTarget) {
                        const volume = Math.abs(e.nativeEvent.offsetY - 100);
                        videoRef.current.volume = volume / 100;
                        setVoice(volume);
                      } else {
                        const volume = Math.abs(e.nativeEvent.offsetY - voice);
                        videoRef.current.volume = volume / 100;
                        setVoice(volume);
                      }
                    }}
                  >
                    <VoiceBar height={voice} />
                  </VoiceBarContainer>
                )}
                <Image
                  src={isMute ? Mute : Voice}
                  alt="voice"
                  fill
                  sizes="contain"
                  onClick={() => {
                    videoHandler(isMute ? "voice" : "mute");
                  }}
                />
              </ControlIcon>
              <ControlIcon
                onMouseOver={() => {
                  setShowSpeedMenu(true);
                }}
                onMouseOut={() => {
                  setShowSpeedMenu(false);
                }}
              >
                {showSpeedMenu && (
                  <SpeedMenu>
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <SpeedOption
                        key={rate}
                        onClick={() => {
                          if (!videoRef.current) return;
                          videoRef.current.playbackRate = rate;
                          setSpeed(rate);
                        }}
                      >
                        {speed === rate && (
                          <PlayIcon>
                            <Image src={Play} alt="play" fill sizes="contain" />
                          </PlayIcon>
                        )}
                        {rate}x
                      </SpeedOption>
                    ))}
                  </SpeedMenu>
                )}
                <Image src={Speed} alt="speed" fill sizes="contain" />
              </ControlIcon>
              <ControlIconFullWindow
                onClick={() => {
                  if (isFullScreen) return;
                  if (!isFullWindow) {
                    setIsFullWindow(true);
                  } else {
                    setIsFullWindow(false);
                  }
                }}
              >
                <Image src={FullWindow} alt="full-window" fill sizes="contain" />
              </ControlIconFullWindow>
              <ControlIcon
                onClick={() => {
                  if (!isFullScreen) {
                    handle.enter();
                    setIsFullScreen(true);
                  } else {
                    handle.exit();
                    setIsFullScreen(false);
                  }
                }}
              >
                <Image src={FullScreenIcon} alt="full-screen" fill sizes="contain" />
              </ControlIcon>
            </OtherControls>
          </ToolBar>
        )}
      </VideoContainer>
      <SecondVideo src={src} ref={secondVideoRef} crossOrigin="anonymous" />
    </FullScreen>
  );
}

VideoPlayer.defaultProps = {
  handleSwitch: () => {},
};

export default VideoPlayer;
