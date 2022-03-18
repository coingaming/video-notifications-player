import React from "react";
import { storiesOf } from "@storybook/react";
import VideoPlayer from "../components/VideoPlayer";

const stories = storiesOf("Video player", module);

stories.add("App", () => {
  return <VideoPlayer videoId="fcafb94c-4102-4bef-afc2-ba5db35f1f45" />;
});
