import React, {
  useState,
  useRef,
  useEffect,
  MediaHTMLAttributes,
  useMemo,
} from "react";
import { IconRefresh, IconStart, IconStop } from "@heathmont/moon-assets";
import '../styles.css';

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

type HoloVideoTypes = {
  autoPlay?: boolean;
  loop?: MediaHTMLAttributes<HTMLVideoElement>["loop"];
  muted?: MediaHTMLAttributes<HTMLVideoElement>["muted"];
  playsInline?: MediaHTMLAttributes<HTMLVideoElement>["playsInline"];
  videoId: string;
  className?: string;
  width?: string;
  height?: string;
  playButtonStyle?: PlayButtonStyleTypes;
  onVideoClick?: (action: 'play' | 'pause') => void;
  onVideoEnd?: () => void;
  onVideoLoad?: () => void;
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
  width = '320px',
  height = "568px",
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
  const isLoaded = useRef(false)
 
  useEffect(() => {
    if (!isLoaded.current && srcOnVideoLoad) {
      srcOnVideoLoad();
    }
   isLoaded.current = true; 
  }, [srcOnVideoLoad])
  
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
    <div
      className={(className && `holo-container ${className}`) || "holo-container"}
      style={{width, height}}
    >
      {!autoPlay && !isVideoScreen && (
        <div
          className="holo-thumb-container"
          style={{width: width || '100%', height: height || '100%'}}
          onClick={onThumbnailClick}
        >
          <img
            src={thumbnailSrc}   
          />
        </div>
      )}
      <button style={{background: iconBackgroundColor || "transparent"}}>{icon}</button>
      <div className="holo-video-container" style={{width, height}}>
        <video
          ref={videoRef}
          width={width || 'auto'}
          height={height || 'auto'}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          onClick={onVideoClick}
          src={isVideoScreen ? videoSrc : undefined}
        />
      </div>
    </div>
  );
};

export default HoloVideo;
