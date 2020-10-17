import {readFileSync} from "fs";
import {NextApiRequest, NextApiResponse} from "next";

export interface PostMetadata {
  name: string,
  dates: string[],
  code: string,
  description: string,
  tags: string[],
  thumbnail?: string
}

export interface Paths {
  paths: {
    params: {
      code: string
    } | {
      post: string,
      date?: string
    } | {
      tag: string
    }
  }[],
  fallback: boolean
}

export const TYPE_TO_PATH: any = {
  blog: "blog",
  song: "songs",
  video: "videos",
  misc: "misc"
}

export default function RecentPosts(req: NextApiRequest,
                                    res: NextApiResponse): void {
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(getPosts());
  } else {
    res.statusCode = 500;
    res.end();
  }
}

export async function getPosts(type: string = "all", start: number = 0):
      Promise<{posts: PostMetadata[]}> {
  // If the type is one of the main four types (aka, not "all"), return only
  // the content listed in that type's file. Otherwise, merge the content from
  // all files into a single list and return it.
  let result: PostMetadata[] = [];
  if (TYPE_TO_PATH.hasOwnProperty(type)) {
    const buffer: Buffer = readFileSync(
        `content/${TYPE_TO_PATH[type]}.json`);
    const json: {posts: PostMetadata[]} = JSON.parse(buffer.toString());
    json.posts.forEach((post: PostMetadata) => {
      post.tags.push(type);
    });
    result = json.posts;
  } else {
    for (let postType in TYPE_TO_PATH) {
      const buffer: Buffer = readFileSync(
          `content/${TYPE_TO_PATH[postType]}.json`);
      const json: { posts: PostMetadata[] } = JSON.parse(buffer.toString());
      json.posts.forEach((post: PostMetadata) => {
        post.tags.push(postType);
      });
      result = result.concat(json.posts);
    }
  }
  if (type != "all" && TYPE_TO_PATH[type] == undefined) {
    result = result.filter((post: PostMetadata) => {
      return post.tags.includes(type);
    });
  }
  result = result.sort((a: PostMetadata, b: PostMetadata) => {
    return parseInt(b.dates[0]) - parseInt(a.dates[0]);
  }).slice(start, start + 10);
  return {posts: result};
}

export async function getSinglePost(type: string, code: string):
    Promise<{props: PostMetadata}> {
  const postsOfType: {posts: PostMetadata[]} = await getPosts(type);
  const thisPost: PostMetadata = postsOfType.posts.filter(
      (item: PostMetadata) => {
    return item.code == code;
  })[0];
  return {props: thisPost};
}

export async function getPostPaths(type: string): Promise<Paths> {
  const posts: {posts: PostMetadata[]} = await getPosts(type);
  const codes = posts.posts.map((song: PostMetadata) => {
    return {params: {code: song.code}};
  });
  return {
    paths: codes,
    fallback: false
  };
}