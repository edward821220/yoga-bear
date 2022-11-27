import React, { useState, useRef, useEffect, useContext } from "react";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import Peer from "simple-peer";
import styled from "styled-components";
import { AuthContext } from "../../../contexts/authContext";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const pusherRef = useRef<Pusher>();
  const channelRef = useRef<PresenceChannel>();
  const userVideo = useRef<HTMLVideoElement>(null);
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const videoConstraints = {
      height: window.innerHeight / 2,
      width: window.innerWidth / 2,
    };

    if (!userData.username) return;
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: { username: userData.username, uid: userData.uid },
      },
    });
    channelRef.current = pusherRef.current.subscribe(`presence-group`) as PresenceChannel;

    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then((stream) => {
      if (!channelRef.current) return;
      channelRef.current.bind("pusher:subscription_succeeded", (members: Members) => {
        console.log("我來惹");
        if (members.count === 1) {
          console.log("裡面看起來只有我一個人");
        }
        if (!userVideo.current) return;
        userVideo.current.srcObject = stream;
        const allPeers: Peer.Instance[] = [];
        /* eslint-disable @typescript-eslint/no-unsafe-argument */
        Object.values(members.members).forEach((member: any) => {
          if (member.uid === userData.uid) return;
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
          });
          peer.on("signal", (callerSignal) => {
            console.log("對裡面的人發出邀請");
            channelRef.current?.trigger(`client-sendingSignal-${member.uid as string}`, {
              callerId: userData.uid,
              callerSignal,
            });
          });
          peersRef.current.push({
            peerID: member.uid,
            peer,
          });
          allPeers.push(peer);
          console.log("裡面的人");
          console.log(allPeers);
        });
        setPeers(allPeers);
      });

      channelRef.current.bind(
        `client-sendingSignal-${userData.uid}`,
        (payload: { callerId: string; callerSignal: Peer.SignalData }) => {
          console.log("收到新人的邀請惹！");
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
          });
          peer.on("signal", (receiverSignal) => {
            channelRef.current?.trigger(`client-returningSignal-${payload.callerId}`, {
              receiverSignal,
              receiverId: userData.uid,
              callerId: payload.callerId,
            });
            console.log("回覆新人訊息");
          });
          peer.signal(payload.callerSignal);
          peersRef.current.push({
            peerID: payload.callerId,
            peer,
          });
          setPeers((prev) => [...prev, peer]);
        }
      );
      channelRef.current.bind(
        `client-returningSignal-${userData.uid}`,
        (payload: { receiverSignal: Peer.SignalData; callerId: string; receiverId: string }) => {
          console.log("裡面的人答應我了");
          console.log(peersRef.current);
          const item = peersRef.current.find((p) => p.peerID === payload.receiverId);
          console.log(item);
          if (!item) return;
          item.peer.signal(payload.receiverSignal);
        }
      );
    });
    // chatChannel.bind("pusher:member_removed", memberRemoved);
    return () => {
      if (pusherRef.current) pusherRef.current.unsubscribe(`presence-group`);
    };
  }, [userData]);

  return (
    <Container>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </Container>
  );
}

export default Group;
