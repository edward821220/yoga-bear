import React, { useEffect, useRef, useState } from "react";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import { useRouter } from "next/router";
import styled from "styled-components";

const Title = styled.h2``;

function TeacherRoom() {
  const router = useRouter();
  const { room } = router.query;
  const host = useRef(false);
  // Pusher specific refs
  const pusherRef = useRef<Pusher>();
  const channelRef = useRef<PresenceChannel>();
  // Webrtc refs
  const rtcConnection = useRef<RTCPeerConnection | null>();
  const userStream = useRef<MediaStream>();
  // video refs
  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        // return sentToPusher('ice-candidate', event.candidate)
        channelRef.current?.trigger("client-ice-candidate", event.candidate);
      }
    };
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: { username: "Teacher" },
      },
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
  });
  return (
    <>
      <Title>TeacherRoom{room}</Title>;
      <div>
        <video autoPlay ref={userVideo} muted />
        <div>
          {/* <button onClick={toggleMic} type="button">
            {micActive ? "Mute Mic" : "UnMute Mic"}
          </button> */}
          {/* <button onClick={leaveRoom} type="button">
            Leave
          </button> */}
          {/* <button onClick={toggleCamera} type="button">
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </button> */}
        </div>
      </div>
      <div>
        <video autoPlay ref={partnerVideo} muted />
      </div>
    </>
  );
}

export default TeacherRoom;
