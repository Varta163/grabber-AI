RSS_SOURCES = [
    # AI & ML
    {"url": "https://feeds.feedburner.com/oreilly/radar", "category": "AI", "name": "O'Reilly Radar"},
    {"url": "https://openai.com/blog/rss", "category": "AI", "name": "OpenAI Blog"},
    {"url": "https://www.deepmind.com/blog/rss.xml", "category": "AI", "name": "DeepMind"},
    {"url": "https://huggingface.co/blog/feed.xml", "category": "AI", "name": "HuggingFace"},
    {"url": "https://ai.googleblog.com/feeds/posts/default", "category": "AI", "name": "Google AI Blog"},
    {"url": "https://bair.berkeley.edu/blog/feed.xml", "category": "AI", "name": "BAIR Blog"},

    # Software Development
    {"url": "https://github.blog/feed/", "category": "Dev", "name": "GitHub Blog"},
    {"url": "https://stackoverflow.blog/feed/", "category": "Dev", "name": "Stack Overflow Blog"},
    {"url": "https://css-tricks.com/feed/", "category": "Dev", "name": "CSS Tricks"},
    {"url": "https://dev.to/feed", "category": "Dev", "name": "Dev.to"},
    {"url": "https://www.smashingmagazine.com/feed/", "category": "Dev", "name": "Smashing Magazine"},
    {"url": "https://changelog.com/feed", "category": "Dev", "name": "Changelog"},

    # Design
    {"url": "https://www.nngroup.com/feed/rss/", "category": "Design", "name": "Nielsen Norman Group"},
    {"url": "https://uxdesign.cc/feed", "category": "Design", "name": "UX Collective"},
    {"url": "https://www.figma.com/blog/feed/", "category": "Design", "name": "Figma Blog"},
    {"url": "https://dribbble.com/stories/posts.rss", "category": "Design", "name": "Dribbble Stories"},

    # Jobs & Market
    {"url": "https://hbr.org/topic/technology/rss", "category": "Jobs", "name": "HBR Tech"},
    {"url": "https://techcrunch.com/tag/jobs/feed/", "category": "Jobs", "name": "TechCrunch Jobs"},
    {"url": "https://www.levels.fyi/blog/feed", "category": "Jobs", "name": "Levels.fyi Blog"},

    # Tech & Startups
    {"url": "https://techcrunch.com/feed/", "category": "Market", "name": "TechCrunch"},
    {"url": "https://www.theverge.com/rss/index.xml", "category": "Market", "name": "The Verge"},
    {"url": "https://feeds.arstechnica.com/arstechnica/index", "category": "Market", "name": "Ars Technica"},
    {"url": "https://news.ycombinator.com/rss", "category": "Market", "name": "Hacker News"},
    {"url": "https://venturebeat.com/feed/", "category": "Market", "name": "VentureBeat"},
    {"url": "https://www.producthunt.com/feed", "category": "Market", "name": "Product Hunt"},
]

SCRAPE_SOURCES = [
    {
        "url": "https://www.producthunt.com/posts",
        "name": "Product Hunt Posts",
        "category": "Market",
        "selector": "article",
    },
]

CATEGORIES = ["AI", "Dev", "Design", "Jobs", "Market"]
