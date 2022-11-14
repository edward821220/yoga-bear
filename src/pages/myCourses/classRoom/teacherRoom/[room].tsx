import React, { useEffect, useRef, useState } from "react";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import { useRouter } from "next/router";
import styled from "styled-components";

const Title = styled.h2`
  font-size: 24px;
  text-align: center;
  color: #1d72c7;
`;
const Wrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 182px);
  padding: 20px;
  margin: 0 auto;
`;
const UserViewPort = styled.div`
  width: 400px;
  height: 300px;
  border: 1px solid red;
  margin-right: 20px;
`;
const PartnerViewPort = styled.div`
  width: 320px;
  height: 240px;
  border: 1px solid red;
  margin-right: 20px;
`;
const Video = styled.video``;

const ICE_SERVERS = {
  // you can add TURN servers here too
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun2.l.google.com:19302",
    },
  ],
};

function TeacherRoom() {
  const router = useRouter();
  const { room } = router.query;
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);

  const host = useRef(false);
  // Pusher specific refs
  const pusherRef = useRef<Pusher>();
  const channelRef = useRef<PresenceChannel>();

  // Webrtc refs
  const rtcConnection = useRef<RTCPeerConnection | null>();
  const userStream = useRef<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const secondPartnerVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!room || typeof room !== "string") return undefined;
    const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        // return sentToPusher('ice-candidate', event.candidate)
        channelRef.current?.trigger("client-ice-candidate", event.candidate);
      }
    };

    const handleTrackEvent = (event: RTCTrackEvent) => {
      if (!partnerVideo.current) return;
      const { streams } = event;
      const [stream] = streams;
      partnerVideo.current.srcObject = stream;
    };
    const createPeerConnection = () => {
      // We create a RTC Peer Connection
      const connection = new RTCPeerConnection(ICE_SERVERS);

      // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
      connection.onicecandidate = handleICECandidateEvent;

      // We implement our onTrack method for when we receive tracks
      connection.ontrack = handleTrackEvent;
      connection.onicecandidateerror = (e) => alert(e);
      return connection;
    };
    const handleRoomJoined = () => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          /* store reference to the stream and provide it to the video element */
          if (!userVideo.current) return;
          userStream.current = stream;
          userVideo.current.srcObject = stream;
          userVideo.current.onloadedmetadata = () => {
            if (userVideo.current) userVideo.current.play();
          };
          if (!host.current && channelRef.current) {
            // the 2nd peer joining will tell to host they are ready
            channelRef.current.trigger("client-ready", {});
          }
        })
        .catch((err) => {
          /* handle the error */
          alert(err);
        });
    };
    const handlePeerLeaving = () => {
      if (partnerVideo.current?.srcObject) {
        (partnerVideo.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop()); // Stops receiving all track of Peer.
        partnerVideo.current.srcObject = null;
      }
      // Safely closes the existing connection established with the peer who left.
      if (rtcConnection.current) {
        rtcConnection.current.ontrack = null;
        rtcConnection.current.onicecandidate = null;
        rtcConnection.current.close();
        rtcConnection.current = null;
      }
    };

    const initiateCall = () => {
      if (host.current) {
        rtcConnection.current = createPeerConnection();
        // Host creates offer
        userStream.current?.getTracks().forEach((track) => {
          if (userStream.current) rtcConnection.current?.addTrack(track, userStream.current);
        });
        rtcConnection.current
          .createOffer()
          .then((offer) => {
            if (!rtcConnection.current) return;
            rtcConnection.current.setLocalDescription(offer);
            // 4. Send offer to other peer via pusher
            // Note: 'client-' prefix means this event is not being sent directly from the client
            // This options needs to be turned on in Pusher app settings
            channelRef.current?.trigger("client-offer", offer);
          })
          .catch((error) => {
            alert(error);
          });
      }
    };

    const handleAnswerReceived = (answer: RTCSessionDescriptionInit) => {
      rtcConnection.current?.setRemoteDescription(answer).catch((error) => alert(error));
    };

    const handlerNewIceCandidateMsg = (incoming: RTCIceCandidate) => {
      // We cast the incoming candidate to RTCIceCandidate
      const candidate = new RTCIceCandidate(incoming);
      rtcConnection.current?.addIceCandidate(candidate).catch((error) => {
        alert(error);
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: { username: "Teacher" },
      },
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    channelRef.current = pusherRef.current.subscribe(`presence-${room}`) as PresenceChannel;
    // when a users subscribe
    channelRef.current.bind("pusher:subscription_succeeded", (members: Members) => {
      if (members.count === 1) {
        // when subscribing, if you are the first member, you are the host
        host.current = true;
      }

      // example only supports 2 users per call
      if (members.count > 2) {
        // 3+ person joining will get sent back home
        // Can handle this however you'd like

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        router.push("/myCourses/teacherCalendar");
      }
      handleRoomJoined();
    });

    // when a member leaves the chat
    channelRef.current.bind("pusher:member_removed", () => {
      handlePeerLeaving();
    });

    // When the second peer tells host they are ready to start the call
    // This happens after the second peer has grabbed their media
    channelRef.current.bind("client-ready", () => {
      initiateCall();
    });

    channelRef.current.bind("client-answer", (answer: RTCSessionDescriptionInit) => {
      // answer is sent by non-host, so only host should handle it
      if (host.current) {
        handleAnswerReceived(answer);
      }
    });

    channelRef.current.bind("client-ice-candidate", (iceCandidate: RTCIceCandidate) => {
      // answer is sent by non-host, so only host should handle it
      handlerNewIceCandidateMsg(iceCandidate);
    });

    return () => {
      if (pusherRef.current) pusherRef.current.unsubscribe(`presence-${room}`);
      userStream.current?.getTracks().forEach((track) => {
        track.enabled = false; // eslint-disable-line no-param-reassign
      });
    };
  }, [room, router]);

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
  const leaveRoom = () => {
    // Let's the server know that user has left the room.
    if (userVideo.current?.srcObject) {
      (userVideo.current?.srcObject as MediaStream).getTracks().forEach((track) => track.stop()); // Stops sending all tracks of User.
    }
    if (partnerVideo.current?.srcObject) {
      (partnerVideo.current?.srcObject as MediaStream).getTracks().forEach((track) => track.stop()); // Stops receiving all tracks from Peer.
    }

    // Checks if there is peer on the other side and safely closes the existing connection established with the peer.
    if (rtcConnection.current) {
      rtcConnection.current.ontrack = null;
      rtcConnection.current.onicecandidate = null;
      rtcConnection.current.close();
      rtcConnection.current = null;
    }
    router.push("/myCourses/teacherCalendar");
  };

  return (
    <>
      <Title>TeacherRoom</Title>
      <Wrapper>
        <UserViewPort>
          <Video autoPlay ref={userVideo} width={400} height={320} />
        </UserViewPort>
        <PartnerViewPort>
          <Video autoPlay ref={partnerVideo} width={320} height={240} />
        </PartnerViewPort>
        <PartnerViewPort>
          <Video autoPlay ref={secondPartnerVideo} width={320} height={240} />
        </PartnerViewPort>
        <div>
          <button onClick={toggleMic} type="button">
            {micActive ? "Mute Mic" : "UnMute Mic"}
          </button>
          <button onClick={leaveRoom} type="button">
            Leave
          </button>
          <button onClick={toggleCamera} type="button">
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
      </Wrapper>
    </>
  );
}

export default TeacherRoom;
