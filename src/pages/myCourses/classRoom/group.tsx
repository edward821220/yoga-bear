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
  const [peers, setPeers] = useState<{ peerID: string; peer: Peer.Instance }[]>([]);
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
    const createPeer = (callerID: string, stream: MediaStream) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });
      peer.on("signal", (signal) => {
        channelRef.current?.trigger("client-sendingSignal", { callerID, signal });
      });
      return peer;
    };
    const addPeer = (incomingSignal: Peer.SignalData, callerID: string, stream: MediaStream) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });
      peer.on("signal", (signal) => {
        channelRef.current?.trigger("client-returningSignal", { signal, callerID });
      });
      peer.signal(incomingSignal);
      return peer;
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
        if (!userVideo.current) return;
        userVideo.current.srcObject = stream;
        const allPeers: { peerID: string; peer: Peer.Instance }[] = [];
        /* eslint-disable @typescript-eslint/no-unsafe-argument */
        Object.values(members.members).forEach((member: any) => {
          if (member.uid === userData.uid) return;
          const peer = createPeer(member.socketId, stream);
          peersRef.current.push({
            peerID: member.socketId,
            peer,
          });
          allPeers.push({ peerID: member.socketId, peer });
        });
        setPeers(allPeers);
      });
      channelRef.current.bind("client-sendingSignal", (payload: { callerID: string; signal: Peer.SignalData }) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers((prev) => [...prev, { peerID: payload.callerID, peer }]);
      });
      channelRef.current.bind("client-returningSignal", (payload: { signal: Peer.SignalData; callerID: string }) => {
        const item = peersRef.current.find((p) => p.peerID === payload.callerID);
        if (!item) return;
        item.peer.signal(payload.signal);
      });
    });
    // chatChannel.bind("pusher:member_removed", memberRemoved);
    return () => {
      if (pusherRef.current) pusherRef.current.unsubscribe(`presence-group`);
    };
  }, [userData]);

  return (
    <Container>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer) => (
        <Video key={peer.peerID} peer={peer.peer} />
      ))}
    </Container>
  );
}

export default Group;
