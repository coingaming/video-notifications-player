import React, { useState, useRef, useEffect, MediaHTMLAttributes } from "react";
import styled from "styled-components";
import IconStart from "@heathmont/moon-assets/icons/IconStart";
import IconStop from "@heathmont/moon-assets/icons/IconStop";

const Container = styled.div`
  position: relative;
  display: inline-block;
  width: fit-content;
  cursor: pointer;
  button {
    opacity: 0;
    background: ${(props: any) => props?.iconBackgroundColor || "transparent"};
    svg {
      color: ${(props: any) => props?.iconColor || "#fff"};
      font-size: ${(props: any) => props?.iconSize || "2rem"};
    }
  }
  video {
    display: ${(props) => (props.hidden ? "none" : "block")};
  }
  &:hover,
  &:focus {
    button {
      opacity: 1;
    }
  }
`;

const ActionButton = styled.button`
  position: absolute;
  transition: opacity 0.2s ease-in-out;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  z-index: 1;
  pointer-events: none;
`;

const CONSTS = {
  CDN: "https://sportsbet-io.imgix.net/video-notifications",
};

const getUrls = (id: string) => {
  return {
    chrome_hd: `${CONSTS.CDN}/${id}.webm`,
    safari_hd: `${CONSTS.CDN}/${id}.mov`,
    thumbnail: `${CONSTS.CDN}/${id}-thumb.png`,
  };
};

type CustomUrlTypes = {
  chrome_hd: string;
  safari_hd: string;
  thumbnail: string;
};

type PlayButtonStyleTypes = {
  iconColor?: string;
  iconSize?: string | number;
  iconBackgroundColor?: string;
};

type HoloVideoTypes = {
  autoPlay?: boolean;
  loop?: MediaHTMLAttributes<HTMLVideoElement>["loop"];
  muted?: MediaHTMLAttributes<HTMLVideoElement>["muted"];
  playsInline?: MediaHTMLAttributes<HTMLVideoElement>["playsInline"];
  videoId: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  customUrls?: CustomUrlTypes;
  playButtonStyle?: PlayButtonStyleTypes;
};

type VideoStates = "loading" | "playing" | "paused" | "ended" | "error";
type VideoStatus = "playable" | "unplayable";

const HoloVideo = ({
  autoPlay = false,
  loop,
  muted,
  playsInline = false,
  videoId,
  className,
  customUrls,
  width = 220,
  height = "100%",
  playButtonStyle = {
    iconColor: "#fff",
    iconSize: "2rem",
    iconBackgroundColor: "transparent",
  },
}: HoloVideoTypes) => {
  const [isVideoScreen, setVideoScreen] = useState(autoPlay);
  const [videoState, setVideoState] = useState<VideoStates>("loading");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("unplayable");
  const videoRef = useRef<HTMLVideoElement>(null);

  // add event listener to video state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        setVideoState("playing");
      });
      videoRef.current.addEventListener("pause", () => {
        setVideoState("paused");
      });
      videoRef.current.addEventListener("ended", () => {
        setVideoState("ended");
      });
      videoRef.current.addEventListener("timeupdate", () => {
        if (
          videoRef?.current?.currentTime &&
          videoRef?.current?.currentTime > 0
        ) {
          setVideoState("playing");
        }
      });
      videoRef.current.addEventListener("progress", () => {
        setVideoState("loading");
      });
      videoRef.current.addEventListener("canplay", () => {
        setVideoStatus("playable");
      });
      videoRef.current.addEventListener("canplaythrough", () => {
        setVideoStatus("playable");
      });
      videoRef.current.addEventListener("error", () => {
        setVideoState("error");
        console.error("error");
      });
    }
  }, [videoRef]);

  if (!videoId) {
    return null;
  }
  const { chrome_hd, safari_hd, thumbnail } = getUrls(videoId);
  const onThumbnailClick = () => {
    setVideoScreen(true);
    videoRef.current?.play();
  };
  const onVideoClick = () => {
    videoRef.current?.[videoState === "playing" ? "pause" : "play"]();
  };
  return (
    <Container
      className={
        (className && `holo-container ${className}`) || "holo-container"
      }
      hidden={!isVideoScreen}
      {...playButtonStyle}
    >
      {!autoPlay && !isVideoScreen && (
        <img
          src={thumbnail}
          alt=""
          className="holo-thumbnail"
          style={{ width, height }}
          onClick={onThumbnailClick}
        />
      )}
      {videoState !== "loading" && (
        <ActionButton>
          {videoState !== "playing" ? <IconStop /> : <IconStart />}
        </ActionButton>
      )}

      <video
        ref={videoRef}
        width={width}
        height={height}
        className="holo-video"
        autoPlay={isVideoScreen}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onClick={onVideoClick}
      >
        <source
          src={customUrls?.safari_hd || safari_hd}
          type='video/mp4; codecs="hvc1"'
        />
        <source src={customUrls?.chrome_hd || chrome_hd} type="video/webm" />
      </video>
    </Container>
  );
};

export default HoloVideo;
