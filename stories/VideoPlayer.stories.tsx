import React from "react";
import { storiesOf } from "@storybook/react";
import VideoPlayer from "../components/VideoPlayer";

const stories = storiesOf("Video player", module);

stories.add("App", () => {
  return (
    <div style={{width: 320, height: 568}}>
      <VideoPlayer videoId="yoloholo-1c6c2ac4-1aab-436c-b407-91af1095ddf9" height="100%" width="100%"/>
    </div>
    );
});
