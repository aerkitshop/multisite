/**
 * Demo content for the two example sites.
 * NOTE: descriptions are written for demo purposes; pricing is intentionally
 * generic - verify on each vendor's pricing page before publishing for real.
 * Affiliate URLs are placeholders on example.com.
 */
import { lexical } from './lexical'

export type SeedTool = {
  name: string
  slug: string
  websiteUrl: string
  shortDescription: string
  pricingModel: 'free' | 'freemium' | 'paid' | 'trial'
  pricingSummary: string
  categories: string[]
  tags: string[]
  featured?: boolean
  features: { title: string; description: string }[]
  about: string[]
  affiliateUrl?: string
  affiliatePlatform?: string
  affiliateStatus?: 'none' | 'found' | 'applied' | 'approved' | 'rejected'
  commissionNote?: string
  color: string
}

export type SeedPost = {
  title: string
  slug: string
  type: 'review' | 'compare' | 'best' | 'tutorial' | 'news'
  excerpt: string
  tools: string[]
  content: ReturnType<typeof lexical>
  faq: { q: string; a: string }[]
}

export type SeedSite = {
  name: string
  slug: string
  domains: string[]
  primaryDomain: string
  tagline: string
  heroTitle: string
  heroSubtitle: string
  colors: { primary: string; primaryForeground: string; accent: string; background: string; foreground: string; darkBackground: string }
  fonts: { heading: string; body: string }
  seo: { title: string; description: string }
  affiliateDisclosure: string
  categories: { name: string; slug: string; description: string; icon: string }[]
  tools: SeedTool[]
  posts: SeedPost[]
  footerAbout: string
}

const generic = 'Free plan available; paid plans unlock more usage (check the official pricing page).'

export const demoSites: SeedSite[] = [
  {
    name: 'CreatorStack AI',
    slug: 'creator-ai',
    domains: ['creator-ai.localhost'],
    primaryDomain: 'creator-ai.localhost:3000',
    tagline: 'AI video & audio tools for creators',
    heroTitle: 'The best AI video & audio tools for creators',
    heroSubtitle:
      'Edit faster, clone your voice, auto-caption and repurpose long videos into shorts. Hand-tested tools, honest reviews.',
    colors: {
      primary: '#7c3aed',
      primaryForeground: '#ffffff',
      accent: '#f43f5e',
      background: '#fcfbff',
      foreground: '#1e1b2e',
      darkBackground: '#0d0a16',
    },
    fonts: { heading: 'poppins', body: 'inter' },
    seo: {
      title: 'CreatorStack AI',
      description: 'A curated directory of AI video editing, voice and captioning tools for YouTubers, podcasters and short-form creators.',
    },
    affiliateDisclosure:
      'CreatorStack AI is reader-supported. Some links are affiliate links, which means we may earn a commission at no extra cost to you.',
    footerAbout: 'Curated AI tools and workflows for YouTubers, podcasters and short-form creators.',
    categories: [
      { name: 'AI Video Editing', slug: 'ai-video-editing', description: 'Edit, generate and enhance video with AI.', icon: '🎬' },
      { name: 'Voice & Audio', slug: 'voice-audio', description: 'Text-to-speech, voice cloning, podcast recording and audio clean-up.', icon: '🎙️' },
      { name: 'Captions & Repurposing', slug: 'captions-repurposing', description: 'Auto-captions and turning long videos into shorts.', icon: '✂️' },
    ],
    tools: [
      {
        name: 'Descript',
        slug: 'descript',
        websiteUrl: 'https://www.descript.com',
        shortDescription: 'Edit video and podcasts by editing the transcript, with AI voice, filler-word removal and studio sound.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['ai-video-editing', 'voice-audio'],
        tags: ['transcript editing', 'podcast', 'youtube'],
        featured: true,
        features: [
          { title: 'Text-based editing', description: 'Delete words in the transcript to cut the video.' },
          { title: 'Filler-word removal', description: 'Remove “um”, “uh” and long pauses in one click.' },
          { title: 'Studio Sound', description: 'Make laptop-mic audio sound closer to studio quality.' },
        ],
        about: [
          'Descript turns your recording into a document: edit the words and the video follows.',
          'It is a strong pick for talking-head YouTube videos and podcasts where most edits are cuts.',
        ],
        affiliateUrl: 'https://example.com/aff/descript?ref=creatorstack-demo',
        affiliatePlatform: 'PartnerStack (demo)',
        affiliateStatus: 'approved',
        commissionNote: 'Demo value - replace with real terms.',
        color: '#2563eb',
      },
      {
        name: 'Runway',
        slug: 'runway',
        websiteUrl: 'https://runwayml.com',
        shortDescription: 'Generate and edit video with AI: text-to-video, image-to-video and creative effects.',
        pricingModel: 'freemium',
        pricingSummary: 'Free credits to try; subscription plans for more generations.',
        categories: ['ai-video-editing'],
        tags: ['text to video', 'b-roll', 'generative'],
        featured: true,
        features: [
          { title: 'Text & image to video', description: 'Create short clips from a prompt or a still.' },
          { title: 'Background removal', description: 'Rotoscope subjects without a green screen.' },
        ],
        about: ['Runway is a generative video suite popular for B-roll, intros and experimental visuals.'],
        affiliateStatus: 'found',
        color: '#111827',
      },
      {
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        websiteUrl: 'https://elevenlabs.io',
        shortDescription: 'Realistic AI voices, voice cloning and dubbing for narration and localisation.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['voice-audio'],
        tags: ['text to speech', 'voice cloning', 'dubbing'],
        featured: true,
        features: [
          { title: 'Natural TTS', description: 'Expressive voices in many languages.' },
          { title: 'Voice cloning', description: 'Create a voice from your own samples (with consent).' },
          { title: 'Dubbing', description: 'Translate videos while keeping the speaker’s voice.' },
        ],
        about: ['ElevenLabs is widely used for faceless-channel narration, audiobooks and multilingual dubbing.'],
        affiliateUrl: 'https://example.com/aff/elevenlabs?ref=creatorstack-demo',
        affiliatePlatform: 'In-house (demo)',
        affiliateStatus: 'applied',
        color: '#0f172a',
      },
      {
        name: 'Riverside',
        slug: 'riverside',
        websiteUrl: 'https://riverside.fm',
        shortDescription: 'Record studio-quality remote podcasts and video interviews, then edit with AI.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['voice-audio', 'captions-repurposing'],
        tags: ['podcast', 'remote recording', 'interviews'],
        features: [
          { title: 'Local recording', description: 'Each guest is recorded locally for high quality.' },
          { title: 'Magic Clips', description: 'Turn an episode into short shareable clips.' },
        ],
        about: ['Riverside focuses on recording remote interviews in high quality and getting clips out fast.'],
        color: '#7c3aed',
      },
      {
        name: 'OpusClip',
        slug: 'opusclip',
        websiteUrl: 'https://www.opus.pro',
        shortDescription: 'Turn long videos into viral-style shorts with AI clipping, captions and reframing.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['captions-repurposing'],
        tags: ['shorts', 'tiktok', 'reels', 'repurposing'],
        features: [
          { title: 'AI clipping', description: 'Finds hooks and highlights in long videos.' },
          { title: 'Auto-reframe', description: 'Keeps the speaker centred in vertical format.' },
        ],
        about: ['OpusClip is built for repurposing podcasts and long YouTube videos into Shorts, Reels and TikToks.'],
        affiliateStatus: 'none',
        color: '#4f46e5',
      },
      {
        name: 'Submagic',
        slug: 'submagic',
        websiteUrl: 'https://www.submagic.co',
        shortDescription: 'Animated, on-brand captions for short-form videos in seconds.',
        pricingModel: 'trial',
        pricingSummary: 'Free trial; paid plans for regular use.',
        categories: ['captions-repurposing'],
        tags: ['captions', 'subtitles', 'shorts'],
        features: [
          { title: 'Animated captions', description: 'Trendy caption styles with emojis and highlights.' },
          { title: 'B-roll & zooms', description: 'Auto-add zooms and stock B-roll.' },
        ],
        about: ['Submagic focuses on one job: captions that keep viewers watching short-form content.'],
        color: '#db2777',
      },
    ],
    posts: [
      {
        title: 'Descript review: is transcript-based editing worth it for YouTubers?',
        slug: 'descript-review',
        type: 'review',
        excerpt: 'We edited three talking-head videos in Descript. Here is where it saves hours - and where it does not.',
        tools: ['descript', 'riverside'],
        content: lexical([
          ['p', 'Descript promises that editing video can be as simple as editing a document. We put that to the test on three talking-head videos.'],
          ['h2', 'What Descript does well'],
          ['ul', ['**Cutting by text** is genuinely fast for interviews.', 'Filler-word removal saves a full pass of edits.', 'Studio Sound rescues mediocre microphones.']],
          ['h2', 'Where it falls short'],
          ['p', 'Heavy motion graphics and multi-cam colour work are still easier in a traditional NLE.'],
          ['h3', 'Who should skip it'],
          ['p', 'Editors whose work is mostly visual effects rather than dialogue.'],
          ['h2', 'Verdict'],
          ['p', 'For podcasters and talking-head creators, Descript is one of the biggest time-savers available.'],
        ]),
        faq: [
          { q: 'Is Descript free?', a: 'There is a free plan with limits; paid plans add more transcription hours and features.' },
          { q: 'Can Descript replace Premiere Pro?', a: 'For dialogue-driven content often yes; for effects-heavy edits, no.' },
        ],
      },
      {
        title: 'The 5 best AI tools to turn long videos into Shorts',
        slug: 'best-ai-tools-for-shorts',
        type: 'best',
        excerpt: 'From auto-clipping to animated captions: the tools we use to repurpose one video into ten.',
        tools: ['opusclip', 'submagic', 'riverside', 'descript'],
        content: lexical([
          ['p', 'Repurposing is the highest-leverage habit a creator can build. These tools make it nearly automatic.'],
          ['h2', '1. OpusClip - best for automatic clipping'],
          ['p', 'Upload a podcast and get ranked clip candidates with captions and reframing.'],
          ['h2', '2. Submagic - best captions'],
          ['p', 'Animated captions that match current short-form styles.'],
          ['h2', '3. Riverside - best if you record interviews'],
          ['p', 'Magic Clips works directly on your recordings.'],
          ['h2', 'How we chose'],
          ['ul', ['Time from upload to publishable clip', 'Caption quality', 'Free plan or trial available']],
        ]),
        faq: [
          { q: 'Which tool is best for TikTok?', a: 'OpusClip for finding clips, Submagic for captions - many creators use both.' },
          { q: 'Do these tools work for non-English videos?', a: 'Most support multiple languages; check each tool for your language.' },
        ],
      },
    ],
  },
  {
    name: 'SMB AI Toolkit',
    slug: 'smb-ai',
    domains: ['smb-ai.localhost'],
    primaryDomain: 'smb-ai.localhost:3000',
    tagline: 'AI tools that save small businesses time',
    heroTitle: 'AI tools for small business, minus the hype',
    heroSubtitle: 'Write marketing copy, summarise meetings and answer customers 24/7. Practical picks for owners and small teams.',
    colors: {
      primary: '#0f766e',
      primaryForeground: '#ffffff',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#0b1f1d',
      darkBackground: '#06120f',
    },
    fonts: { heading: 'montserrat', body: 'open-sans' },
    seo: {
      title: 'SMB AI Toolkit',
      description: 'Practical AI tools for small businesses: marketing, meetings and customer support, reviewed in plain English.',
    },
    affiliateDisclosure:
      'We may earn a commission when you sign up through links on this site. It never changes our recommendations.',
    footerAbout: 'Plain-English reviews of AI software for owners and small teams.',
    categories: [
      { name: 'Writing & Marketing', slug: 'writing-marketing', description: 'Copy, emails, social posts and design.', icon: '✍️' },
      { name: 'Meetings & Productivity', slug: 'meetings-productivity', description: 'Notes, transcripts and summaries.', icon: '📅' },
      { name: 'Customer Support', slug: 'customer-support', description: 'Chatbots and help desks with AI.', icon: '💬' },
    ],
    tools: [
      {
        name: 'Jasper',
        slug: 'jasper',
        websiteUrl: 'https://www.jasper.ai',
        shortDescription: 'AI marketing copy that follows your brand voice, for blogs, ads and emails.',
        pricingModel: 'trial',
        pricingSummary: 'Free trial; paid plans per seat.',
        categories: ['writing-marketing'],
        tags: ['copywriting', 'brand voice', 'marketing'],
        featured: true,
        features: [
          { title: 'Brand voice', description: 'Train Jasper on your existing content.' },
          { title: 'Campaign workflows', description: 'Generate a whole campaign from one brief.' },
        ],
        about: ['Jasper is aimed at marketing teams that need on-brand content at volume.'],
        affiliateUrl: 'https://example.com/aff/jasper?ref=smbai-demo',
        affiliatePlatform: 'Impact (demo)',
        affiliateStatus: 'approved',
        color: '#7c3aed',
      },
      {
        name: 'Grammarly',
        slug: 'grammarly',
        websiteUrl: 'https://www.grammarly.com',
        shortDescription: 'Writing assistant for clear, professional emails and documents, with generative AI.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['writing-marketing'],
        tags: ['writing', 'email', 'grammar'],
        features: [
          { title: 'Tone suggestions', description: 'Sound confident and friendly in client emails.' },
          { title: 'Works everywhere', description: 'Browser extension and desktop apps.' },
        ],
        about: ['Grammarly is the low-effort upgrade for every email your business sends.'],
        color: '#15803d',
      },
      {
        name: 'Canva',
        slug: 'canva',
        websiteUrl: 'https://www.canva.com',
        shortDescription: 'Design social posts, flyers and presentations with AI-powered Magic Studio.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['writing-marketing'],
        tags: ['design', 'social media', 'templates'],
        featured: true,
        features: [
          { title: 'Magic Design', description: 'Generate on-brand designs from a prompt.' },
          { title: 'Brand Kit', description: 'Keep logos, colours and fonts consistent.' },
        ],
        about: ['Canva is the default design tool for small teams without a designer.'],
        color: '#0ea5e9',
      },
      {
        name: 'Otter.ai',
        slug: 'otter-ai',
        websiteUrl: 'https://otter.ai',
        shortDescription: 'Live meeting transcription and AI summaries for Zoom, Meet and Teams.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['meetings-productivity'],
        tags: ['transcription', 'meeting notes'],
        featured: true,
        features: [
          { title: 'Live transcript', description: 'Follow along and highlight in real time.' },
          { title: 'AI summary', description: 'Action items emailed after each meeting.' },
        ],
        about: ['Otter joins your calls and produces searchable notes so nobody has to take minutes.'],
        affiliateStatus: 'found',
        color: '#2563eb',
      },
      {
        name: 'Fireflies.ai',
        slug: 'fireflies-ai',
        websiteUrl: 'https://fireflies.ai',
        shortDescription: 'AI notetaker that records, transcribes and searches across all your meetings.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['meetings-productivity'],
        tags: ['meeting notes', 'crm', 'search'],
        features: [
          { title: 'Conversation search', description: 'Find what a customer said months ago.' },
          { title: 'CRM sync', description: 'Push notes to your CRM automatically.' },
        ],
        about: ['Fireflies is strong for sales-led small businesses that live on calls.'],
        color: '#9333ea',
      },
      {
        name: 'Tidio',
        slug: 'tidio',
        websiteUrl: 'https://www.tidio.com',
        shortDescription: 'Live chat and an AI support agent that answers common customer questions 24/7.',
        pricingModel: 'freemium',
        pricingSummary: generic,
        categories: ['customer-support'],
        tags: ['live chat', 'chatbot', 'ecommerce'],
        features: [
          { title: 'AI agent', description: 'Answers FAQs from your help content.' },
          { title: 'Shopify integration', description: 'Order status and product questions in chat.' },
        ],
        about: ['Tidio is a popular choice for online stores that want instant replies without hiring.'],
        affiliateUrl: 'https://example.com/aff/tidio?ref=smbai-demo',
        affiliatePlatform: 'PartnerStack (demo)',
        affiliateStatus: 'applied',
        color: '#1d4ed8',
      },
    ],
    posts: [
      {
        title: 'Otter.ai vs Fireflies.ai: which AI notetaker should a small team pick?',
        slug: 'otter-vs-fireflies',
        type: 'compare',
        excerpt: 'Both join your calls and write the notes. The difference is in search, integrations and price per seat.',
        tools: ['otter-ai', 'fireflies-ai'],
        content: lexical([
          ['p', 'AI notetakers are one of the easiest wins for a small team. We compared the two most popular options.'],
          ['h2', 'Transcription quality'],
          ['p', 'Both are accurate on clear audio; accents and crosstalk are where differences show.'],
          ['h2', 'Integrations'],
          ['ul', ['**Otter**: calendar, Zoom, Meet, Teams, Slack.', '**Fireflies**: the same plus deeper CRM syncing.']],
          ['h2', 'Which one to choose'],
          ['p', 'Pick Otter for simple meeting notes; pick Fireflies if sales calls and CRM updates matter most.'],
        ]),
        faq: [
          { q: 'Do I need to tell participants they are recorded?', a: 'Yes - consent rules vary by country and state; both tools announce themselves.' },
          { q: 'Is there a free plan?', a: 'Both offer free tiers with limits.' },
        ],
      },
      {
        title: 'How to add a 24/7 AI support agent to your website in an afternoon',
        slug: 'ai-support-agent-tutorial',
        type: 'tutorial',
        excerpt: 'A step-by-step setup using your existing FAQ - no developer needed.',
        tools: ['tidio'],
        content: lexical([
          ['p', 'Most customer questions repeat. An AI agent trained on your FAQ can answer them instantly.'],
          ['h2', 'Step 1: collect your answers'],
          ['p', 'Export your FAQ, shipping and returns pages - this is the agent’s knowledge.'],
          ['h2', 'Step 2: install the chat widget'],
          ['p', 'Add the snippet or the Shopify/WordPress plugin.'],
          ['h2', 'Step 3: test and set handoff rules'],
          ['ol', ['Ask 20 real customer questions.', 'Fix gaps in your FAQ.', 'Route billing issues to a human.']],
        ]),
        faq: [{ q: 'Will the bot make things up?', a: 'Restrict it to your knowledge base and review transcripts weekly.' }],
      },
    ],
  },
]
