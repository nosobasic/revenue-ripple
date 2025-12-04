export interface PremiumBriefing {
  id: string;
  content_type: string;
  level: string;
  title: string;
  short_description: string | null;
  full_body: string | null;
  tags: string[] | null;
  insight_id: string | null;
  created_at: string;
  published_at: string | null;
}

