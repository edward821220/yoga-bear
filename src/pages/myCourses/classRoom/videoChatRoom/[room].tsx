import React, { useState, useRef, useEffect, useContext } from "react";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import Head from "next/head";
import { useRouter } from "next/router";
import Peer from "simple-peer";
import styled from "styled-components";
import { AuthContext } from "../../../../contexts/authContext";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1280px;
  height: calc(100vh - 100px);
  padding: 20px;
  margin: 0 auto;
`;
const VideoContainer = styled.div`
  width: 48%;
  height: auto;
  margin-bottom: 20px;
  @media screen and (max-width: 688px) {
    width: 100%;
  }
`;
const StyledVideo = styled.video`
  max-width: 100%;
  transform: scaleX(-1);
  margin-bottom: 10px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 0 0 5px #00000050;
`;
const User = styled.p`
  text-align: center;
`;
const ButtonWrapper = styled.div``;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  min-width: 50px;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
`;

function Video({ peer }: { peer: Peer.Instance }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    peer.on("stream", (stream) => {
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
    });
  }, [peer]);

  return <StyledVideo playsInline autoPlay ref={videoRef} />;
}

function Group() {
  const router = useRouter();
  const { room } = router.query;
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [peers, setPeers] = useState<{ peerID: string; peerName: string; peer: Peer.Instance }[]>([]);
  const connectedRef = useRef<string[]>([]);
  const peersRef = useRef<{ peerID: string; peerName: string; peer: Peer.Instance }[]>([]);
  const pusherRef = useRef<Pusher>();
  const channelRef = useRef<PresenceChannel>();
  const userVideo = useRef<HTMLVideoElement>(null);
  const userStream = useRef<MediaStream>();
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (!userData.uid || typeof room !== "string") return;

    const inviteAllPeers = (members: Members) => {
      Object.values(members.members as { uid: string; username: string }[]).forEach((member) => {
        if (member.uid === userData.uid) return;
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: userStream.current,
          config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
        });
        peer.on("signal", (callerSignal) => {
          channelRef.current?.trigger(`client-sendingSignal-${member.uid}`, {
            callerId: userData.uid,
            callerName: userData.username,
            callerSignal,
          });
        });
        peersRef.current.push({
          peerID: member.uid,
          peerName: member.username,
          peer,
        });
      });
      setPeers(peersRef.current);
    };

    const addNewComingPeer = (callerData: { callerId: string; callerName: string; callerSignal: Peer.SignalData }) => {
      peersRef.current = peersRef.current.filter((peer) => peer.peerID !== callerData.callerId);
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: userStream.current,
      });
      peer.on("signal", (receiverSignal) => {
        channelRef.current?.trigger(`client-returningSignal-${callerData.callerId}`, {
          receiverSignal,
          receiverId: userData.uid,
          callerId: callerData.callerId,
        });
        console.log("回覆新人訊息");
      });
      peer.signal(callerData.callerSignal);
      peersRef.current.push({
        peerID: callerData.callerId,
        peerName: callerData.callerName,
        peer,
      });
      setPeers(peersRef.current);
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!userVideo.current) return;
      userVideo.current.srcObject = stream;
      userStream.current = stream;
    });

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: { username: userData.username, uid: userData.uid },
      },
    });

    channelRef.current = pusherRef.current.subscribe(`presence-${room}`) as PresenceChannel;

    channelRef.current.bind("pusher:subscription_succeeded", (members: Members) => {
      if (members.count === 1) return;
      console.log("我來惹，對裡面的人發個邀請");
      inviteAllPeers(members);
    });

    channelRef.current.bind(
      `client-sendingSignal-${userData.uid}`,
      (callerData: { callerId: string; callerName: string; callerSignal: Peer.SignalData }) => {
        console.log("收到新人的邀請惹！");
        addNewComingPeer(callerData);
      }
    );

    channelRef.current.bind(
      `client-returningSignal-${userData.uid}`,
      (payload: { receiverSignal: Peer.SignalData; callerId: string; receiverId: string }) => {
        if (connectedRef.current.includes(payload.receiverId)) return;
        console.log("裡面的人答應我了");
        const item = peersRef.current.find((p) => p.peerID === payload.receiverId);
        if (!item) return;
        item.peer.signal(payload.receiverSignal);
        connectedRef.current?.push(item.peerID);
      }
    );

    channelRef.current.bind("pusher:member_removed", (member: { info: { uid: string } }) => {
      const { uid } = member.info;
      console.log("有人落跑!");
      peersRef.current = peersRef.current.filter((peer) => peer.peerID !== uid);
      setPeers(peersRef.current);
    });

    return () => {
      userStream.current?.getTracks().forEach((track) => {
        track.stop();
      });
      if (pusherRef.current) pusherRef.current.unsubscribe(`presence-${room}`);
    };
  }, [userData, room]);

  const leaveRoom = () => {
    channelRef.current?.trigger("client-leave", userData.uid);
    userStream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    if (typeof room === "string" && pusherRef.current) {
      pusherRef.current.unsubscribe(`presence-${room}`);
    }
    router.push(userData.identity === "teacher" ? "/myCourses/teacherCalendar" : "/myCourses/studentCalendar");
  };
  const toggleMediaStream = (type: "video" | "audio", state: boolean) => {
    userStream.current?.getTracks().forEach((track) => {
      if (track.kind === type) {
        track.enabled = !state; // eslint-disable-line no-param-reassign
      }
    });
  };

  const toggleMic = () => {
    toggleMediaStream("audio", micActive);
    setMicActive((prev) => !prev);
  };

  const toggleCamera = () => {
    toggleMediaStream("video", cameraActive);
    setCameraActive((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>視訊課教室 - Yoga Bear</title>
      </Head>
      <Container>
        <VideoContainer>
          <StyledVideo muted ref={userVideo} autoPlay playsInline />
          <ButtonWrapper>
            <Button onClick={toggleCamera} type="button">
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
            <Button onClick={toggleMic} type="button">
              {micActive ? "Mute Mic" : "UnMute Mic"}
            </Button>
            <Button onClick={leaveRoom} type="button">
              Leave
            </Button>
          </ButtonWrapper>
        </VideoContainer>

        {peers.map((peer) => (
          <VideoContainer key={peer.peerID}>
            <Video peer={peer.peer} />
            <User>{peer.peerName}</User>
          </VideoContainer>
        ))}
      </Container>
    </>
  );
}

export default Group;
