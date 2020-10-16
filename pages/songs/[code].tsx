import React, {ReactElement} from "react";
import general from "../../styles/general.module.css";
import {PostMetadata, getSinglePost, getPostPaths} from "../api/content";
import {formatDate} from "../../components/MenuItem";
import LinkHeader from "../../components/LinkHeader";
import NormalHead from "../../components/NormalHead";

interface SongMetadata extends PostMetadata {
  wav?: string,
  soundcloud?: string,
  youtube?: string
}

export default function SongPage(props: PostMetadata): ReactElement {
  let wavSource: ReactElement = null;
  const songProps: SongMetadata = props as SongMetadata;
  if (songProps.wav != null) {
    wavSource = (
      <source src={"/songs/" + props.code + ".wav"}
              type={"audio/wav"} />
    );
  }

  return (
    <div className={general.pageContainer}>
      <NormalHead title={props.name}
                  thumbnail={props.thumbnail}
                  keywords={props.tags} />
      <div className={general.postContainer}>
        <LinkHeader path={["songs"]} />
        <h1 className={general.pageTitle}>{props.name}</h1>
        <p className={general.caption}>
          released {formatDate(props.dates[0])}
        </p>
        <audio controls={true}>
          {wavSource}
          <source src={"/songs/" + props.code + ".mp3"}
                  type={"audio/mpeg"} />
        </audio>
      </div>
    </div>
  );
}

export async function getStaticProps(context): Promise<{props: any}> {
  return await getSinglePost("song", context.params.code);
}

export async function getStaticPaths() {
  return await getPostPaths("song");
}