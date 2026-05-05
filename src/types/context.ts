import { commentLoaderResult } from "@/config/loader/comment.loader";
import { postLoaderResult } from "@/config/loader/post.loader";
import { UserLoaderResult } from "@/config/loader/user.loader";
import DataLoader from "dataloader";
import { Request, Response } from 'express';

export type Context = {
  user?: {
    userId: string;
  } | null;
  req: Request,
  res: Response,
  loaders: {
    userLoader: DataLoader<string, UserLoaderResult>;
    postLoader: DataLoader<string, postLoaderResult>; 
    commentLoader: DataLoader<string, commentLoaderResult>;
  };
};

