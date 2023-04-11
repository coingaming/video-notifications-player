import React from "react";
import { storiesOf } from "@storybook/react";
import VideoPlayer from "../components/VideoPlayer";

const stories = storiesOf("Video player", module);

stories.add("App", () => {
  return (
    <VideoPlayer videoId="yoloholo-5a517a10-6708-4b1a-96e8-653aa90e9019" />
  );
});
