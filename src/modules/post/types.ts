
export type TrendingPostRow = {
  created_at: Date | string;
  likes_count: number | string;
  comments_count: number | string;
  repost_count: number | string;
  saves_count: number | string;
  views_count: number | string;
  id: string;
};

export type Media = {
  url?: string;
  media_type: string;
};

export type PostRow = {
  id: string;
  original_post: string;
  original_comment: string;
  user_id: string;
  repost_count: number;
  created_at: Date;
  media?: MediaRow | null;
};

export type MediaRow = {
  id: string;
  url: string;
};

export type NotificationRow = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: string;
  reference_id: string;
  reference_type: string;
  created_at: Date;
};