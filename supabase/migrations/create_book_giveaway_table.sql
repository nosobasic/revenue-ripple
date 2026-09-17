-- Create table for book giveaway submissions
CREATE TABLE IF NOT EXISTS book_giveaway_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_book_giveaway_email ON book_giveaway_submissions(email);

-- Create index on submitted_at for analytics
CREATE INDEX IF NOT EXISTS idx_book_giveaway_submitted_at ON book_giveaway_submissions(submitted_at);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE book_giveaway_submissions ENABLE ROW LEVEL SECURITY;
