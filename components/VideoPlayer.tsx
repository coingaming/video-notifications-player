import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  MediaHTMLAttributes,
} from "react";
import styled from "styled-components";
import { IconRefresh, IconStart, IconStop } from "@heathmont/moon-assets/icons";
import { ColorNames } from "@heathmont/moon-themes/lib/sharedTokens/sharedTokens";

const CONSTS = {
  CDN: "https://sportsbet-io.imgix.net/video-notifications/",
};

const getAssetUrlFromCdn = (fileNameWithExtension: string) =>
  `${CONSTS.CDN}${fileNameWithExtension}`;

const getRawVideoUrl = (fileName: string, extension = "mp4") =>
  getAssetUrlFromCdn(`${fileName}.${extension}`);

const getEditedVideoUrl = (fileName: string) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const format = isSafari ? ".mov" : ".webm";
  return getAssetUrlFromCdn(`${fileName}${format}`);
};

export const getVideoThumbnail = (fileName: string) =>
  getAssetUrlFromCdn(`${fileName}-thumb.webp`);

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

export type HoloVideoTypes = {
  autoPlay?: boolean;
  loop?: MediaHTMLAttributes<HTMLVideoElement>["loop"];
  muted?: MediaHTMLAttributes<HTMLVideoElement>["muted"];
  playsInline?: MediaHTMLAttributes<HTMLVideoElement>["playsInline"];
  videoId: string;
  className?: string;
  width?: string;
  height?: string;
  playButtonStyle?: PlayButtonStyleTypes;
  onVideoClick?: (action: "play" | "pause") => void;
  onVideoEnd?: () => void;
  onVideoLoad?: () => void;
};

export type VideoStates =
  | "progress"
  | "play"
  | "pause"
  | "ended"
  | "error"
  | "canplaythrough"
  | "canplay"
  | "timeupdate";

export type VideoStatus = "playing" | "pause" | "ended" | "loading";

export type HoloNotificationProps = {
  translatedNotification: TranslatedNotification;
  markAsRead?: () => void;
  onDismiss: (e) => void;
  actionButtonTitle?: string;
  detailsButtonTitle?: string;
};

export type NotificationStyles = BasicStyles & {
  linkColor: ColorNames;
  loaderColor: ColorNames;
  button: BasicStyles;
  closeButton: BasicStyles;
  videoButton: BasicStyles;
};

type BasicStyles = {
  bgColor: ColorNames;
  textColor: ColorNames;
};

type TranslatedNotification = {
  title?: string;
  text?: string;
  body?: string;
  link?: string;
  holocapsule: string;
};

const HoloContainer = styled.div`
  position: relative;
  display: inline-block;
  width: fit-content;
  cursor: pointer;

  &:hover,
  &:focus {
    button {
      opacity: 1;
    }
  }
`;

const Button = styled.button`
  opacity: 0;
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

const HoloVideoContainer = styled.div`
  position: relative;
  overflow: hidden;

  video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
  }
`;

const HoloThumbContainer = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
    flex: 1;
  }
`;

const HoloVideo = ({
  autoPlay = false,
  loop,
  muted,
  playsInline = false,
  videoId,
  className,
  width = "100%",
  height = "100%",
  playButtonStyle = {
    iconColor: "#fff",
    iconSize: "2rem",
    iconBackgroundColor: "transparent",
  },
  onVideoClick: srcOnVideoClick,
  onVideoEnd: srcOnVideoEnd,
  onVideoLoad: srcOnVideoLoad,
}: HoloVideoTypes) => {
  const [isVideoScreen, setVideoScreen] = useState(autoPlay);
  const [videoState, setVideoState] = useState<VideoStates>("progress");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("loading");
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = getVideoUrl(videoId);
  const thumbnailSrc = getVideoThumbnail(videoId);
  const { iconColor, iconSize, iconBackgroundColor } = playButtonStyle;
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!isLoaded.current && srcOnVideoLoad) {
      srcOnVideoLoad();
    }
    isLoaded.current = true;
  }, [srcOnVideoLoad]);

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
      if (srcOnVideoEnd) {
        srcOnVideoEnd();
      }
      setVideoStatus("ended");
      return;
    }
    if (videoState === "pause") {
      setVideoStatus("pause");
    }
    if (videoState === "play") {
      setVideoStatus("playing");
    }
  }, [videoState, srcOnVideoEnd]);

  useEffect(() => {
    if (isVideoScreen && !autoPlay) {
      videoRef.current?.play();
    }
  }, [isVideoScreen, autoPlay]);

  const icon = useMemo(() => {
    const props = {
      color: iconColor,
      fontSize: iconSize,
    };
    if (!isVideoScreen) {
      return <IconStart {...props} />;
    }
    if (videoStatus === "playing") {
      return <IconStop {...props} />;
    }
    if (videoStatus === "ended") {
      return <IconRefresh {...props} />;
    }
    if (videoStatus === "pause") {
      return <IconStart {...props} />;
    }
    return null;
  }, [videoStatus, isVideoScreen, iconColor, iconSize]);

  const onThumbnailClick = () => {
    setVideoScreen(true);
    if (srcOnVideoClick) {
      srcOnVideoClick("play");
    }
  };
  const onVideoClick = () => {
    const action = videoStatus === "playing" ? "pause" : "play";
    if (srcOnVideoClick) {
      srcOnVideoClick(action);
    }
    videoRef.current?.[action]();
  };

  if (!videoId || !videoSrc) {
    return null;
  }

  return (
    <HoloContainer className={className} style={{ width, height }}>
      {!autoPlay && !isVideoScreen && (
        <HoloThumbContainer
          style={{ width: width || "100%", height: height || "100%" }}
          onClick={onThumbnailClick}
        >
          <img
            src={thumbnailSrc}
            style={{ width: "auto", height: height || "auto" }}
          />
        </HoloThumbContainer>
      )}
      <Button
        style={{
          opacity: videoStatus !== "playing" ? "100" : undefined,
          background: iconBackgroundColor || "transparent",
        }}
      >
        {icon}
      </Button>
      <HoloVideoContainer
        style={{ width, height, display: !isVideoScreen ? "none" : undefined }}
      >
        <video
          ref={videoRef}
          width={width || "auto"}
          height={height || "auto"}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          onClick={onVideoClick}
          src={isVideoScreen ? videoSrc : undefined}
        />
      </HoloVideoContainer>
    </HoloContainer>
  );
};

export default HoloVideo;
