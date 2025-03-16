import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import "../styles/VideoMeetComponent.css";
import server from "../../environment";

const server_url = server;
let connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  let socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();
  const localStreamRef = useRef(null);
  const videoRef = useRef([]);

  let [videoAvailable, setVideoAvailable] = useState(false);
  let [audioAvailable, setAudioAvailable] = useState(false);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [videos, setVideos] = useState([]);

  let [videoIcon, setVideoIcon] = useState(true);
  let [camera, setCamera] = useState(true);

  let [audioIcon, setAudioIcon] = useState(true);
  let [mic, setMic] = useState(true);

  let [screen, setScreen] = useState();
  let [screenAvailable, setScreenAvailable] = useState();

  let [newMessages, setNewMessages] = useState(3);
  let [message, setMessage] = useState("");
  let [messages, setMessages] = useState([]);

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  let [fullScreen, setFullScreen] = useState(null);

  let [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getPermissions();
  });

  const getDisplayMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      if (localVideoref.current) {
        localVideoref.current.srcObject = stream;
      }
      window.localStream = stream;

      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender) {
          sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      }

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (e) {
      console.log("Error sharing screen", e);
    }
  };

  const stopScreenShare = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoref.current) {
        localVideoref.current.srcObject = userMediaStream;
      }
      window.localStream = userMediaStream;

      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender) {
          sender.replaceTrack(userMediaStream.getVideoTracks()[0]);
        }
      }
      setScreen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          localStreamRef.current = userMediaStream;
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const handleVideo = useCallback(() => {
    const videoTrack = localVideoref.current.srcObject.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamera(videoTrack.enabled);
      setVideoIcon(videoTrack.enabled);
    } else {
      console.error("No video track found");
    }
  }, []);

  let handleAudio = useCallback(() => {
    const audioTrack = window.localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMic(audioTrack.enabled);
      setAudioIcon(audioTrack.enabled);
    } else {
      console.error("No video track found");
    }
  }, []);

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleModal = () => {
    setShowModal(!showModal);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const toggleFullScreen = (socketId) => {
    if (fullScreen === socketId) {
      setFullScreen(null);
    } else {
      setFullScreen(socketId);
    }
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <p style={{ color: "red" }}>
            Double click on Videoicon and AudioIcon to turn it Off!
          </p>
          <div className="col-4 mb-3">
            <textarea
              placeholder="Enter Username"
              className="form-control"
              id="exampleFormControlTextarea1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></textarea>
          </div>

          <button className="btn btn-primary mb-3" onClick={connect}>
            Connect
          </button>

          <div>
            <video
              ref={localVideoref}
              autoPlay
              muted
              playsInline
              style={{ borderRadius: "25px" }}
            ></video>
          </div>
        </div>
      ) : (
        <div className="meetVideoContainer">
          <div className="button-icon">
            <button
              onClick={() => {
                handleVideo();
              }}
            >
              {videoIcon === true ? (
                <i className="fa-solid fa-video"></i>
              ) : (
                <i className="fa-solid fa-video-slash"></i>
              )}
            </button>
            <button onClick={handleAudio}>
              {audioIcon === true ? (
                <i className="fa-solid fa-microphone"></i>
              ) : (
                <i className="fa-solid fa-microphone-slash"></i>
              )}
            </button>
            <button onClick={handleEndCall}>
              <i className="fa-solid fa-phone" style={{ color: "red" }}></i>
            </button>
            <button onClick={handleModal}>
              {showModal === true ? (
                <i className="fa-solid fa-comment"></i>
              ) : (
                <i className="fa-solid fa-comment-slash"></i>
              )}
            </button>
            <button onClick={handleScreen}>
              <i className="fa-solid fa-tv"></i>
            </button>
          </div>

          {showModal ? (
            <div className="chatRoom">
              <div className="div-h1">
                <h1 style={{ textAlign: "center" }}>Chat</h1>
              </div>

              <div className="chatDisplay">
                {messages.length !== 0 ? (
                  messages.map((item, index) => {
                    return (
                      <div
                        style={{ marginBottom: "20px" }}
                        key={`message-${index}`}
                      >
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    );
                  })
                ) : (
                  <p>No Messages</p>
                )}
              </div>
              <div className="chatting-area col-10 offset-1 mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Type Message!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <></>
          )}

          <video
            className="meetUserVideo"
            ref={localVideoref}
            autoPlay
            muted
          ></video>

          <div className="conferenceView">
            {videos.map((video) => (
              <div
                key={video.socketId}
                className={
                  fullScreen === video.socketId
                    ? "fullScreenVideo"
                    : "videoContainer"
                }
                onClick={() => toggleFullScreen(video.socketId)}
              >
                <video
                  key={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
