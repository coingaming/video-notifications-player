import React from "react";
import { storiesOf } from "@storybook/react";
import VideoPlayer from "../components/VideoPlayer";

const stories = storiesOf("Video player", module);

const onVideoClick = (action: string) => {
  console.log("onVideoClick: ", action);
};

const onVideoLoad = () => {
  console.log("onVideoLoad");
};

const onVideoEnd = () => {
  console.log("onVideoEnd");
};

stories.add("App", () => {
  return (
    <div style={{ width: 320, height: 568 }}>
      <VideoPlayer
        videoId="yoloholo-ab7392ef-a969-4804-bb6d-c7fc88d4a2ba"
        height="100%"
        width="100%"
        onVideoClick={onVideoClick}
        onVideoEnd={onVideoEnd}
        onVideoLoad={onVideoLoad}
      />
    </div>
  );
});
