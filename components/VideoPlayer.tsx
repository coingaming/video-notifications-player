import React, {
  useState,
  useRef,
  useEffect,
  MediaHTMLAttributes,
  useMemo,
} from "react";
import styled from "styled-components";
import { IconRefresh, IconStart, IconStop } from "@heathmont/moon-assets";

const usePrevious = <T,>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

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
  CDN: "https://sportsbet-io.imgix.net/video-notifications/",
};

const getAssetUrlFromCdn = (fileNameWithExtension: string) =>
  `${CONSTS.CDN}${fileNameWithExtension}`;

const getRawVideoUrl = (fileName: string, extension = "mp4") =>
  getAssetUrlFromCdn(`${fileName}.${extension}`);

const getEditedVideoUrl = (fileName: string) => {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const format = isSafari ? ".mov" : ".webm";
  return getAssetUrlFromCdn(`${fileName}${format}`);
};

export const getVideoThumbnail = (fileName: string) =>
  getAssetUrlFromCdn(`${fileName}-thumb.png`);

export const getVideoUrl = (fileName?: string, extension?: string) => {
  if (!fileName || !fileName.includes("yoloholo")) {
    return null;
  }
  return fileName.includes("-raw-")
    ? getRawVideoUrl(fileName, extension)
    : getEditedVideoUrl(fileName);
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
  playButtonStyle?: PlayButtonStyleTypes;
};

type VideoStates =
  | "progress"
  | "play"
  | "pause"
  | "ended"
  | "error"
  | "canplaythrough"
  | "canplay"
  | "timeupdate";

type VideoStatus = "playing" | "pause" | "ended" | "loading";

const HoloVideo = ({
  autoPlay = false,
  loop,
  muted,
  playsInline = false,
  videoId,
  className,
  width = 220,
  height = "100%",
  playButtonStyle = {
    iconColor: "#fff",
    iconSize: "2rem",
    iconBackgroundColor: "transparent",
  },
}: HoloVideoTypes) => {
  const [isVideoScreen, setVideoScreen] = useState(autoPlay);
  const [videoState, setVideoState] = useState<VideoStates>("progress");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("loading");
  const prevVideoState = usePrevious<VideoStates>(videoState);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = getVideoUrl(videoId);
  const thumbnailSrc = getVideoThumbnail(videoId);

  // add event listener to video state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        setVideoState("play");
      });
      videoRef.current.addEventListener("pause", () => {
        setVideoState("pause");
      });
      videoRef.current.addEventListener("ended", () => {
        setVideoState("ended");
      });
      videoRef.current.addEventListener("timeupdate", () => {
        if (
          videoRef?.current?.currentTime &&
          videoRef?.current?.currentTime > 0
        ) {
          setVideoState("timeupdate");
        }
      });
      videoRef.current.addEventListener("progress", () => {
        setVideoState("progress");
      });
      videoRef.current.addEventListener("canplay", () => {
        setVideoState("canplay");
        setVideoScreen(true);
      });
      videoRef.current.addEventListener("error", () => {
        console.error("error");
      });
    }
  }, [videoRef]);

  useEffect(() => {
    if (videoState === "ended") {
      setVideoStatus("ended");
      return;
    }
    if (
      ["canplay", "canplaythrough"].includes(videoState) &&
      ["progress", undefined].includes(prevVideoState)
    ) {
      setVideoStatus("pause");
    }
    if (videoState === "pause") {
      setVideoStatus("pause");
    }
    if (videoState === "play") {
      setVideoStatus("playing");
    }
  }, [videoState, prevVideoState]);

  const icon = useMemo(() => {
    if (videoStatus === "playing") {
      return <IconStop />;
    }
    if (videoStatus === "ended") {
      return <IconRefresh />;
    }
    if (videoStatus === "pause") {
      return <IconStart />;
    }
    return null;
  }, [videoStatus]);

  if (!videoId || !videoSrc) {
    return null;
  }
  const onThumbnailClick = () => {
    setVideoScreen(true);
    videoRef.current?.play();
  };
  const onVideoClick = () => {
    videoRef.current?.[videoStatus === "playing" ? "pause" : "play"]();
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
          src={thumbnailSrc}
          alt=""
          className="holo-thumbnail"
          style={{ width, height }}
          onClick={onThumbnailClick}
        />
      )}
      {videoStatus !== "loading" && <ActionButton>{icon}</ActionButton>}

      <video
        ref={videoRef}
        width={width}
        height={height}
        className="holo-video"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onClick={onVideoClick}
      >
        <source src={videoSrc} />
      </video>
    </Container>
  );
};

export default HoloVideo;
