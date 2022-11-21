import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import { useRouter } from "next/router";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: calc(100vh - 100px);
  padding: 60px 0;
  margin: 0 auto;
  max-width: 1280px;
`;
const Title = styled.h2`
  font-size: 24px;
  text-align: center;
  color: #1d72c7;
  margin-bottom: 60px;
`;
const ViewPorts = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const UserViewPort = styled.div`
  width: 400px;
  height: 300px;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
  margin-right: 20px;
`;
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.color3};
  color: ${(props) => props.theme.colors.color1};
  border-radius: 5px;
  min-width: 50px;
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
`;
const PartnerViewPort = styled.div`
  width: 400px;
  height: 300px;
  border: 1px solid lightgray;
  box-shadow: 0 0 5px #00000050;
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

function StudentRoom() {
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
      connection.onicecandidateerror = () => {
        Swal.fire({ text: "發生錯誤，請再試一次！", confirmButtonColor: "#5d7262", icon: "error" });
      };
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
        .catch(() => {
          /* handle the error */
          Swal.fire({ text: "發生錯誤，請再試一次！", confirmButtonColor: "#5d7262", icon: "error" });
        });
    };
    const handlePeerLeaving = () => {
      host.current = true;
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
          .catch(() => {
            Swal.fire({ text: "發生錯誤，請再試一次！", confirmButtonColor: "#5d7262", icon: "error" });
          });
      }
    };

    const handleReceivedOffer = (offer: RTCSessionDescriptionInit) => {
      rtcConnection.current = createPeerConnection();
      userStream.current?.getTracks().forEach((track) => {
        // Adding tracks to the RTCPeerConnection to give peer access to it
        if (!userStream.current) return;
        rtcConnection.current?.addTrack(track, userStream.current);
      });

      rtcConnection.current.setRemoteDescription(offer);
      rtcConnection.current
        .createAnswer()
        .then((answer) => {
          if (!rtcConnection.current) return;
          rtcConnection.current.setLocalDescription(answer);
          channelRef.current?.trigger("client-answer", answer);
        })
        .catch(() => {
          Swal.fire({ text: "發生錯誤，請再試一次！", confirmButtonColor: "#5d7262", icon: "error" });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      authEndpoint: "/api/pusher/auth",
      auth: {
        params: { username: "Student" },
      },
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    channelRef.current = pusherRef.current.subscribe(`presence-${room}`) as PresenceChannel;
    // when a users subscribe
    channelRef.current.bind("pusher:subscription_succeeded", (members: Members) => {
      if (members.count === 1) {
        // when subscribing, if you are the first member, you are the host
        Swal.fire({ text: "老師還沒來唷！請稍候再進教室～", confirmButtonColor: "#5d7262", icon: "warning" });
        router.push("/myCourses/studentCalendar");
      }
      handleRoomJoined();
    });

    // when a member leaves the chat
    channelRef.current.bind("pusher:member_removed", () => {
      handlePeerLeaving();
    });

    channelRef.current.bind("client-offer", (offer: RTCSessionDescriptionInit) => {
      // offer is sent by the host, so only non-host should handle it
      if (!host.current) {
        handleReceivedOffer(offer);
      }
    });

    // When the second peer tells host they are ready to start the call
    // This happens after the second peer has grabbed their media
    channelRef.current.bind("client-ready", () => {
      initiateCall();
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
    router.push("/myCourses/videoCourses");
  };

  return (
    <Wrapper>
      <Title>StudentRoom</Title>
      <ViewPorts>
        <UserViewPort>
          <Video autoPlay ref={userVideo} width={400} height={320} />
          <div>
            <Button onClick={toggleCamera} type="button">
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
            <Button onClick={toggleMic} type="button">
              {micActive ? "Mute Mic" : "UnMute Mic"}
            </Button>
            <Button onClick={leaveRoom} type="button">
              Leave
            </Button>
          </div>
        </UserViewPort>
        <PartnerViewPort>
          <Video autoPlay ref={partnerVideo} width={400} height={320} />
        </PartnerViewPort>
      </ViewPorts>
    </Wrapper>
  );
}

export default StudentRoom;
