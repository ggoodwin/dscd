-- DSCD.app Database Schema
-- Users table to store user information synced from Clerk
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  image_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shortlinks table to store all shortlinks
CREATE TABLE shortlinks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Link type: 'server' for dscd.sh, 'profile' for dscd.me
  link_type TEXT NOT NULL CHECK (link_type IN ('server', 'profile')),
  
  -- The short slug (e.g., 'myserver' for dscd.sh/myserver)
  slug TEXT NOT NULL,
  
  -- The destination Discord URL
  destination_url TEXT NOT NULL,
  
  -- Dub.co link ID for API management
  dub_link_id TEXT,
  
  -- Optional metadata
  title TEXT,
  description TEXT,
  
  -- Analytics
  clicks INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique slugs per link type
  UNIQUE(link_type, slug)
);

-- Click analytics table for detailed tracking (Pro+ feature)
CREATE TABLE click_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shortlink_id TEXT NOT NULL REFERENCES shortlinks(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  referer TEXT
);

-- Indexes for performance
CREATE INDEX idx_shortlinks_user_id ON shortlinks(user_id);
CREATE INDEX idx_shortlinks_slug ON shortlinks(slug);
CREATE INDEX idx_shortlinks_link_type ON shortlinks(link_type);
CREATE INDEX idx_click_analytics_shortlink_id ON click_analytics(shortlink_id);
CREATE INDEX idx_click_analytics_clicked_at ON click_analytics(clicked_at);
