/**
 * Content for the two example sites (used by `pnpm seed` for fresh installs and by
 * `pnpm content:update` to upsert existing installs by slug).
 *
 * Pricing / features were checked on each vendor's official site and pricing page on
 * 2026-11-04 (see `sourceUrls`). Re-check before relying on them - vendors change plans often.
 * No ratings, user counts or other stats are claimed. Affiliate URLs are placeholders on example.com.
 *
 * Images live in ./assets (compressed webp):
 *   <tool>-logo.webp  - apple-touch-icon / app icon from the official site or app store listing
 *   <tool>-og.webp    - the official og:image of the tool's homepage
 *   <tool>-home.webp  - a screenshot of the tool's official homepage (1440x810, cookie banner removed)
 *   <tool>-hero.webp  - tight crop of that screenshot's hero (Runway, ElevenLabs: their og:image is a bare wordmark)
 *   post-*.webp       - generated editorial covers (abstract, no text / no product UI)
 */
import { lexical } from './lexical'

export type SeedTool = {
  name: string
  slug: string
  websiteUrl: string
  pricingUrl: string
  tagline: string
  shortDescription: string
  bestFor: string
  pricingModel: 'free' | 'freemium' | 'paid' | 'trial'
  startingPrice: string
  pricingSummary: string
  categories: string[]
  tags: string[]
  featured?: boolean
  features: { title: string; description: string }[]
  about: string[]
  /** asset file names in ./assets */
  images: { logo: string; cover: string; gallery: string[] }
  affiliateUrl?: string
  affiliatePlatform?: string
  affiliateStatus?: 'none' | 'found' | 'applied' | 'approved' | 'rejected'
  commissionNote?: string
}

export type SeedPost = {
  title: string
  slug: string
  type: 'review' | 'compare' | 'best' | 'tutorial' | 'news'
  excerpt: string
  cover: string
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
  /** icon = lucide icon name rendered by CategoryNav (emoji also works) */
  categories: { name: string; slug: string; description: string; icon: string }[]
  tools: SeedTool[]
  posts: SeedPost[]
  footerAbout: string
}

/** cover 'og' = official og:image; 'hero' = tight crop of the homepage hero (when the og:image is just a wordmark). */
const img = (slug: string, cover: 'og' | 'hero' = 'og') => ({
  logo: `${slug}-logo.webp`,
  cover: `${slug}-${cover}.webp`,
  gallery: cover === 'og' ? [`${slug}-og.webp`, `${slug}-home.webp`] : [`${slug}-hero.webp`, `${slug}-home.webp`, `${slug}-og.webp`],
})

export const demoSites: SeedSite[] = [
  {
    name: 'CreatorStack AI',
    slug: 'creator-ai',
    domains: ['creator-ai.localhost'],
    primaryDomain: 'creator-ai.localhost:3000',
    tagline: 'AI video & audio tools for creators',
    heroTitle: 'AI video & audio tools, hand-picked for creators',
    heroSubtitle:
      'Edit by transcript, clone your voice and turn long videos into Shorts. Every listing has verified pricing and a clear “best for” - no 100-tool lists.',
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
      description:
        'Hand-picked AI tools for YouTubers, podcasters and short-form creators: transcript-based editing, AI voiceovers, auto-clipping and captions - with verified pricing.',
    },
    affiliateDisclosure:
      'CreatorStack AI is reader-supported. Some links are affiliate links, which means we may earn a commission at no extra cost to you.',
    footerAbout: 'Hand-picked AI tools and workflows for YouTubers, podcasters and short-form creators.',
    categories: [
      {
        name: 'AI Video Editing',
        slug: 'ai-video-editing',
        description: 'Editors and generators that cut, enhance or create footage - from transcript-based editing to text-to-video.',
        icon: 'clapperboard',
      },
      {
        name: 'Voice & Audio',
        slug: 'voice-audio',
        description: 'Voiceovers, voice cloning, dubbing and remote podcast recording with studio-grade sound.',
        icon: 'mic',
      },
      {
        name: 'Captions & Repurposing',
        slug: 'captions-repurposing',
        description: 'Turn one long video into a week of Shorts, Reels and TikToks with auto-clipping and animated captions.',
        icon: 'scissors',
      },
    ],
    tools: [
      {
        name: 'Descript',
        slug: 'descript',
        websiteUrl: 'https://www.descript.com',
        pricingUrl: 'https://www.descript.com/pricing',
        tagline: 'Edit video and podcasts by editing the transcript',
        shortDescription:
          'Delete words in the transcript to cut the footage, strip filler words in one pass and fix laptop-mic audio with Studio Sound. Underlord, the AI co-editor, drafts rough cuts and clips.',
        bestFor: 'Podcasters and talking-head YouTubers whose edits are mostly cuts',
        pricingModel: 'freemium',
        startingPrice: 'From $16/mo',
        pricingSummary:
          'Free plan (1 media hour/month, 720p export with watermark). Hobbyist $16, Creator $24, Business $50 per person/month billed annually ($24 / $35 / $65 monthly).',
        categories: ['ai-video-editing', 'voice-audio'],
        tags: ['transcript editing', 'podcast', 'youtube'],
        featured: true,
        features: [
          { title: 'Text-based editing', description: 'Cut, rearrange and trim video by editing the transcript like a doc.' },
          { title: 'Remove filler words', description: 'Find and delete “um”, “uh”, repeated words and long gaps in one pass.' },
          { title: 'Studio Sound', description: 'One click removes background noise and enhances speech.' },
          { title: 'Underlord AI co-editor', description: 'Prompt it for rough cuts, clips, chapters, show notes and YouTube descriptions.' },
        ],
        about: [
          'Descript treats a recording like a document: the transcript is the timeline, so deleting a sentence deletes that part of the video. For dialogue-driven content that removes most of the tedious work.',
          'It also records (Rooms, up to 10 participants), adds dynamic captions, clones your voice for small fixes and exports to Premiere, Final Cut and Pro Tools on Creator and above. Heavy effects work is still easier in a traditional editor.',
        ],
        images: img('descript'),
        affiliateUrl: 'https://example.com/aff/descript?ref=creatorstack-demo',
        affiliatePlatform: 'PartnerStack (demo)',
        affiliateStatus: 'approved',
        commissionNote: 'Demo value - replace with real terms.',
      },
      {
        name: 'Runway',
        slug: 'runway',
        websiteUrl: 'https://runway.com',
        pricingUrl: 'https://runwayml.com/pricing',
        tagline: 'Generate and edit video from text, images and footage',
        shortDescription:
          'Create B-roll from a prompt or a still with Gen-4.5, or transform clips you already shot. Paid plans add no-watermark exports, 4K upscaling and voice, music and sound-effect generation.',
        bestFor: 'B-roll, intros and visual experiments when you don’t have the footage',
        pricingModel: 'freemium',
        startingPrice: 'From $12/mo',
        pricingSummary: 'Free: 125 one-time credits. Standard $12/mo (625 credits), Pro $28/mo, Max $76/mo, billed annually ($15 / $35 / $95 monthly).',
        categories: ['ai-video-editing'],
        tags: ['text to video', 'b-roll', 'generative'],
        featured: true,
        features: [
          { title: 'Text & image to video', description: 'Generate short clips from a prompt or a reference image with Runway’s Gen-4.5 and partner models.' },
          { title: 'Edit existing footage', description: 'Use Aleph to restyle or change shots you already have.' },
          { title: 'Audio generation', description: 'Music, voice and sound effects on paid plans.' },
          { title: '4K upscaling', description: 'Upscale generations for delivery; unlimited on Pro and Max.' },
        ],
        about: [
          'Runway is a generative video suite: you describe a shot or upload a still and get a short clip back. Credits are the currency - longer and higher-quality generations cost more.',
          'Creators mostly use it for B-roll, title sequences and stylised inserts rather than full edits. Try the free credits on your own prompts before committing to a plan.',
        ],
        images: img('runway', 'hero'),
        affiliateStatus: 'found',
      },
      {
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        websiteUrl: 'https://elevenlabs.io',
        pricingUrl: 'https://elevenlabs.io/pricing',
        tagline: 'Lifelike AI voiceovers, voice cloning and dubbing',
        shortDescription:
          'Turn scripts into natural narration in 70+ languages, clone your own voice from a short sample and dub videos while keeping the speaker’s voice. Sound effects and music too.',
        bestFor: 'Faceless channels, audiobooks and localising videos into other languages',
        pricingModel: 'freemium',
        startingPrice: 'From $6/mo',
        pricingSummary:
          'Free plan (10k credits/month, no commercial license). Starter $6/mo adds a commercial license and instant voice cloning; Creator $22/mo; Pro $99/mo.',
        categories: ['voice-audio'],
        tags: ['text to speech', 'voice cloning', 'dubbing'],
        featured: true,
        features: [
          { title: 'Text to speech', description: 'Expressive voices in 70+ languages, including the new Eleven v4 model.' },
          { title: 'Voice cloning', description: 'Instant cloning from Starter; professional cloning from Creator.' },
          { title: 'Dubbing Studio', description: 'Translate a video’s speech and keep the original voice.' },
          { title: 'Sound effects & music', description: 'Generate SFX and music from a text prompt.' },
        ],
        about: [
          'ElevenLabs is the voice layer many creators bolt onto their workflow: narration for faceless videos, pickups when you fluffed a line, and dubbed versions for other markets.',
          'All products draw from one monthly credit pool. Commercial use needs a paid plan - check the license before monetising anything made on the free tier.',
        ],
        images: img('elevenlabs', 'hero'),
        affiliateUrl: 'https://example.com/aff/elevenlabs?ref=creatorstack-demo',
        affiliatePlatform: 'In-house (demo)',
        affiliateStatus: 'applied',
      },
      {
        name: 'Riverside',
        slug: 'riverside',
        websiteUrl: 'https://riverside.com',
        pricingUrl: 'https://riverside.com/pricing',
        tagline: 'Record remote podcasts and interviews in up to 4K',
        shortDescription:
          'Every guest is recorded on their own device, so a shaky connection doesn’t ruin the take. Edit by transcript, then let Magic Clips cut captioned highlights for social.',
        bestFor: 'Interview podcasts and video shows with remote guests',
        pricingModel: 'freemium',
        startingPrice: 'From $24/mo',
        pricingSummary:
          'Free plan (2 hours of separate-track recording, 720p, watermark). Pro $24/mo, Grow $34/mo, Webinar $79/mo billed annually; 14-day free trial.',
        categories: ['voice-audio', 'captions-repurposing'],
        tags: ['podcast', 'remote recording', 'interviews'],
        features: [
          { title: 'Separate tracks per guest', description: 'Studio-quality audio and up to 4K video for each participant.' },
          { title: 'Text-based editor', description: 'Trim the episode from its transcript; remove silences and filler words.' },
          { title: 'Magic Clips', description: 'Turns an episode into short, captioned clips for social.' },
          { title: 'Publish & stream', description: 'Podcast hosting and multistreaming on higher plans.' },
        ],
        about: [
          'Riverside is built around one problem: recording remote guests without Zoom-quality audio. Tracks are captured locally and uploaded as you go, so you get clean separate files per person.',
          'After the recording it covers editing, clips and show notes, so a small show can go from call to published episode and social cuts in one tool.',
        ],
        images: img('riverside'),
      },
      {
        name: 'OpusClip',
        slug: 'opusclip',
        websiteUrl: 'https://www.opus.pro',
        pricingUrl: 'https://www.opus.pro/pricing',
        tagline: 'Turn one long video into a batch of ready-to-post Shorts',
        shortDescription:
          'Paste a podcast or YouTube link and OpusClip picks the strongest moments, ranks them with a Virality Score, reframes them vertically and adds animated captions in 20+ languages.',
        bestFor: 'Podcasters and long-form YouTubers who want daily short-form without an editor',
        pricingModel: 'freemium',
        startingPrice: 'From $15/mo',
        pricingSummary: 'Free plan (60 credits/month, watermarked). Starter $15/mo (150 credits). Pro $14.50/mo billed annually ($29 monthly).',
        categories: ['captions-repurposing'],
        tags: ['shorts', 'tiktok', 'reels', 'repurposing'],
        features: [
          { title: 'AI clipping', description: 'Finds hooks and highlights in long videos and scores each clip.' },
          { title: 'Animated captions', description: 'Caption styles in 20+ languages, plus filler and silence removal.' },
          { title: 'Auto-post', description: 'Publish straight to YouTube Shorts, TikTok and Instagram Reels.' },
        ],
        about: [
          'OpusClip is a repurposing machine: one long video in, a ranked list of vertical clips out. You review, tweak captions and post or schedule.',
          'The Virality Score is a ranking aid, not a promise - treat the top picks as a shortlist and keep your own judgement on hooks.',
        ],
        images: img('opusclip'),
        affiliateStatus: 'none',
      },
      {
        name: 'Submagic',
        slug: 'submagic',
        websiteUrl: 'https://www.submagic.co',
        pricingUrl: 'https://www.submagic.co/pricing',
        tagline: 'Animated captions and fast edits for short-form video',
        shortDescription:
          'Drop in a vertical clip and get on-trend animated captions, B-roll and sound effects in seconds, in 48 languages. Magic Clips cuts long videos into shorts; text-based trimming handles the rest.',
        bestFor: 'TikTok, Reels and Shorts creators who live on captions',
        pricingModel: 'trial',
        startingPrice: 'From $12/mo',
        pricingSummary: 'Free trial, no credit card. Starter $12, Pro $23, Business $41 per member/month, billed yearly.',
        categories: ['captions-repurposing'],
        tags: ['captions', 'subtitles', 'shorts'],
        features: [
          { title: 'AI auto captions', description: 'Animated caption templates with highlights and emojis.' },
          { title: 'B-roll & sound', description: 'Auto-add stock B-roll and sound effects.' },
          { title: 'Text-based trimming', description: 'Cut the clip by editing its transcript.' },
        ],
        about: [
          'Submagic does one job very well: captions that keep viewers watching short-form content. Upload a clip, pick a style, adjust a few words and export.',
          'Pair it with a clipping tool if you start from long videos, or use its own Magic Clips feature.',
        ],
        images: img('submagic'),
      },
    ],
    posts: [
      {
        title: 'Descript review: is text-based editing worth it for YouTubers in 2026?',
        slug: 'descript-review',
        type: 'review',
        excerpt:
          'Editing video by editing a transcript sounds like a gimmick. For dialogue-heavy videos it isn’t. Where Descript saves real time, where you’ll still want a timeline, and which plan to pick.',
        cover: 'post-descript-review.webp',
        tools: ['descript', 'riverside'],
        content: lexical([
          ['p', 'Descript’s pitch is simple: your recording becomes a document, and editing the words edits the video. For talking-head videos and podcasts - where most edits are cuts - that changes how long an edit takes.'],
          ['h2', 'What Descript does well'],
          ['ul', ['**Cutting by text.** Delete a sentence in the transcript and the footage goes with it.', '**Filler-word removal.** Strip “um”, “uh” and repeated words in one pass instead of hunting for them.', '**Studio Sound.** One click makes a laptop or USB mic sound far closer to a treated room.', '**Underlord.** The AI co-editor drafts rough cuts, clips, chapters and show notes from a prompt.']],
          ['h2', 'Where it falls short'],
          ['p', 'Motion-graphics-heavy edits, colour work and complex multi-layer timelines are still faster in Premiere, Resolve or Final Cut. On Creator and above you can export the timeline to those editors and finish there.'],
          ['h2', 'Which plan to pick'],
          ['p', 'The free plan is enough to learn the workflow, but exports are 720p with a watermark. Hobbyist ($16/month billed annually) removes the watermark and gives 10 media hours. Creator ($24) adds 4K export, more AI credits and the stock library - the sweet spot for a weekly channel.'],
          ['h3', 'Who should skip it'],
          ['p', 'Editors whose work is mostly visual effects or music-driven cuts rather than dialogue.'],
          ['h2', 'Verdict'],
          ['p', 'For podcasters and talking-head creators, Descript is one of the biggest time-savers you can add. Start free, and upgrade only when the watermark or the 1-hour limit gets in the way.'],
        ]),
        faq: [
          { q: 'Is Descript free?', a: 'Yes, there is a free plan with 1 media hour per month and 720p watermarked exports. Paid plans start at $16/month billed annually.' },
          { q: 'Can Descript replace Premiere Pro?', a: 'For dialogue-driven content often yes. For effects-heavy edits, use Descript for the cut and export the timeline to Premiere.' },
          { q: 'Does Descript record remote guests?', a: 'Yes, with Rooms (up to 10 participants). For dedicated remote recording, Riverside is the specialist.' },
        ],
      },
      {
        title: 'The best AI tools to turn long videos into Shorts (2026)',
        slug: 'best-ai-tools-for-shorts',
        type: 'best',
        excerpt:
          'OpusClip, Submagic, Riverside and Descript compared on finding clips, captions and price - plus the two-tool stack we’d actually use for a weekly podcast.',
        cover: 'post-best-shorts.webp',
        tools: ['opusclip', 'submagic', 'riverside', 'descript'],
        content: lexical([
          ['p', 'Repurposing is the highest-leverage habit a creator can build: one long video can feed a week of Shorts, Reels and TikToks. These tools make the cutting nearly automatic.'],
          ['h2', '1. OpusClip - best for finding the clips'],
          ['p', 'Paste a link and get a ranked list of vertical clips with captions and reframing. Free plan with 60 credits a month; Starter is $15/month.'],
          ['h2', '2. Submagic - best captions'],
          ['p', 'Animated caption templates that match current short-form styles, in 48 languages, plus B-roll and sound effects. Free trial; plans from $12/month billed yearly.'],
          ['h2', '3. Riverside - best if you record interviews'],
          ['p', 'Magic Clips works directly on your recordings, so clips come out of the same tool you recorded in.'],
          ['h2', '4. Descript - best if you also edit the long version'],
          ['p', 'Create Clips and Underlord pull highlights from the project you already edited.'],
          ['h2', 'The stack we’d use'],
          ['p', 'For a weekly podcast: record in Riverside or Descript, let OpusClip find the moments, and polish the captions of the best three in Submagic.'],
          ['h2', 'How we chose'],
          ['ul', ['Time from upload to a publishable clip', 'Caption quality and styling control', 'A free plan or trial so you can test on your own footage']],
        ]),
        faq: [
          { q: 'Which tool is best for TikTok?', a: 'OpusClip for finding clips, Submagic for captions - many creators use both.' },
          { q: 'Do these tools work for non-English videos?', a: 'Yes: OpusClip captions 20+ languages and Submagic 48. Check your language before paying.' },
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
    heroTitle: 'Practical AI tools for small business, minus the hype',
    heroSubtitle:
      'Write on-brand marketing, get meeting notes without typing and answer customers around the clock. Picks for owners and small teams, with verified pricing.',
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
      description:
        'Practical AI tools for small businesses - marketing, meeting notes and customer support - reviewed in plain English with verified pricing.',
    },
    affiliateDisclosure:
      'We may earn a commission when you sign up through links on this site. It never changes our recommendations.',
    footerAbout: 'Plain-English reviews of AI software for owners and small teams.',
    categories: [
      {
        name: 'Writing & Marketing',
        slug: 'writing-marketing',
        description: 'On-brand copy, emails, social posts and designs without hiring an agency.',
        icon: 'pen-line',
      },
      {
        name: 'Meetings & Productivity',
        slug: 'meetings-productivity',
        description: 'AI notetakers that join your calls, transcribe them and send the action items.',
        icon: 'calendar-check',
      },
      {
        name: 'Customer Support',
        slug: 'customer-support',
        description: 'Live chat and AI agents that answer common questions and hand tricky ones to a human.',
        icon: 'message-circle',
      },
    ],
    tools: [
      {
        name: 'Jasper',
        slug: 'jasper',
        websiteUrl: 'https://www.jasper.ai',
        pricingUrl: 'https://www.jasper.ai/pricing',
        tagline: 'On-brand marketing content at scale',
        shortDescription:
          'Teach Jasper your brand voice, style guide and product facts, then generate campaigns, blog posts, ads and emails that stay on-message across the whole team.',
        bestFor: 'Marketing teams producing a steady stream of branded content',
        pricingModel: 'trial',
        startingPrice: 'From $59/mo',
        pricingSummary: '7-day free trial. Pro $59 per seat/month billed yearly ($69 monthly). Business is custom-priced.',
        categories: ['writing-marketing'],
        tags: ['copywriting', 'brand voice', 'marketing'],
        featured: true,
        features: [
          { title: 'Brand voice & style guide', description: 'Keeps tone, terminology and facts consistent.' },
          { title: 'Campaigns from one brief', description: 'Generate the blog post, ads, emails and social posts together.' },
          { title: 'Team workspace', description: 'Shared brand assets and collaboration on Business.' },
        ],
        about: [
          'Jasper is built for marketing teams rather than one-off prompts: the value is in the brand knowledge you load once and every teammate reuses.',
          'If you only write a few posts a month, a general assistant is cheaper; Jasper earns its seat price when several people publish on behalf of one brand.',
        ],
        images: img('jasper'),
        affiliateUrl: 'https://example.com/aff/jasper?ref=smbai-demo',
        affiliatePlatform: 'Impact (demo)',
        affiliateStatus: 'approved',
      },
      {
        name: 'Grammarly',
        slug: 'grammarly',
        websiteUrl: 'https://www.grammarly.com',
        pricingUrl: 'https://www.grammarly.com/plans',
        tagline: 'Clear, confident writing in every app you use',
        shortDescription:
          'Fixes grammar and tone in email, docs and chat as you type, rewrites whole sentences in one click and drafts text from prompts. Grammarly is now part of Superhuman.',
        bestFor: 'Owners and teams who write a lot of client emails',
        pricingModel: 'freemium',
        startingPrice: 'From $12/mo',
        pricingSummary: 'Free plan (spelling & grammar, 100 AI prompts/month). Pro from $12 per member/month with 2,000 prompts, tone rewrites and plagiarism/AI-text detection.',
        categories: ['writing-marketing'],
        tags: ['writing', 'email', 'grammar'],
        features: [
          { title: 'Works where you write', description: 'Browser extension, desktop apps and mobile keyboard.' },
          { title: 'Tone & rewrites', description: 'Adjust tone and rewrite full sentences with a click (Pro).' },
          { title: 'Plagiarism & AI detection', description: 'Check text before it goes out (Pro).' },
        ],
        about: [
          'Grammarly is the low-effort upgrade for every email, proposal and support reply your business sends - it sits in the apps you already use.',
          'The free plan covers spelling and grammar; Pro is worth it if tone and clarity matter in client-facing writing.',
        ],
        images: img('grammarly'),
      },
      {
        name: 'Canva',
        slug: 'canva',
        websiteUrl: 'https://www.canva.com',
        pricingUrl: 'https://www.canva.com/pricing/',
        tagline: 'Design social posts, flyers and decks with AI built in',
        shortDescription:
          'Millions of templates, Brand Kits that lock in your logo, fonts and colours, and AI tools that draft designs and edit photos. Schedule social posts from the same place.',
        bestFor: 'Small teams without an in-house designer',
        pricingModel: 'freemium',
        startingPrice: 'From $144/yr',
        pricingSummary: 'Free plan. Canva Pro US$144/year for one person; Canva Business US$250/year per person. Free trial on paid plans.',
        categories: ['writing-marketing'],
        tags: ['design', 'social media', 'templates'],
        featured: true,
        features: [
          { title: 'Brand Kits', description: 'Logos, colours and fonts one click away (5 on Pro, 100 on Business).' },
          { title: 'Premium AI tools', description: 'Generate designs, edit photos and write copy inside the editor.' },
          { title: 'Social scheduling', description: 'Plan and publish posts without another tool.' },
        ],
        about: [
          'Canva is the default design tool for teams without a designer: flyers, menus, social posts, presentations and short videos from one editor.',
          'Start on the free plan; Pro pays off once you need Brand Kits, background removal and the premium template library every week.',
        ],
        images: img('canva'),
      },
      {
        name: 'Otter.ai',
        slug: 'otter-ai',
        websiteUrl: 'https://otter.ai',
        pricingUrl: 'https://otter.ai/pricing',
        tagline: 'Meeting notes, summaries and action items, automatically',
        shortDescription:
          'Otter joins Zoom, Google Meet and Teams calls, transcribes live with speaker labels and sends a summary with action items. Ask its AI chat what was decided across meetings.',
        bestFor: 'Small teams that want searchable notes from every call',
        pricingModel: 'freemium',
        startingPrice: 'From $8.33/mo',
        pricingSummary: 'Free plan (300 transcription minutes/month). Pro $8.33 and Business $19.99 per user/month, billed annually.',
        categories: ['meetings-productivity'],
        tags: ['transcription', 'meeting notes'],
        featured: true,
        features: [
          { title: 'Live transcript', description: 'Speaker identification and highlights in real time.' },
          { title: 'AI summaries & chat', description: 'Action items after each call; ask questions across meetings.' },
          { title: 'Integrations', description: 'Salesforce, HubSpot and Zapier on Pro and above.' },
        ],
        about: [
          'Otter joins your calls as a participant and produces searchable notes, so nobody has to take minutes and absent teammates can catch up in two minutes.',
          'Make sure everyone on the call knows they are being recorded - consent rules vary by country and state.',
        ],
        images: img('otter-ai'),
        affiliateStatus: 'found',
      },
      {
        name: 'Fireflies.ai',
        slug: 'fireflies-ai',
        websiteUrl: 'https://fireflies.ai',
        pricingUrl: 'https://fireflies.ai/pricing',
        tagline: 'AI notetaker that records, transcribes and searches every call',
        shortDescription:
          'Records Zoom, Meet and Teams calls, transcribes in 100+ languages and writes the summary. Search every past conversation and push notes and tasks to the tools you already use.',
        bestFor: 'Sales-led teams that need to find what a customer said months ago',
        pricingModel: 'freemium',
        startingPrice: 'From $10/mo',
        pricingSummary: 'Free plan (limited AI summaries, 400 mins storage). Pro $10 and Business $19 per seat/month billed annually ($18 / $29 monthly).',
        categories: ['meetings-productivity'],
        tags: ['meeting notes', 'crm', 'search'],
        features: [
          { title: 'Conversation search', description: 'Find any topic, objection or promise across all calls.' },
          { title: 'AskFred assistant', description: 'Ask questions about a meeting or a whole account.' },
          { title: 'Integrations', description: 'Unlimited integrations from Pro, including CRMs.' },
        ],
        about: [
          'Fireflies is strongest when calls are the business: sales, customer success and recruiting teams use its search to answer “what did they say about pricing?” in seconds.',
          'Business adds conversation intelligence and team analytics if you coach a sales team.',
        ],
        images: img('fireflies-ai'),
      },
      {
        name: 'Tidio',
        slug: 'tidio',
        websiteUrl: 'https://www.tidio.com',
        pricingUrl: 'https://www.tidio.com/pricing/',
        tagline: 'Live chat plus Lyro, an AI agent for customer questions',
        shortDescription:
          'Add a chat widget to your store or site, let the Lyro AI agent answer FAQs from your own help content, and route anything tricky to your team. Works with Shopify.',
        bestFor: 'Online stores that get the same shipping and returns questions all day',
        pricingModel: 'freemium',
        startingPrice: 'From $24.17/mo',
        pricingSummary: 'Free plan (50 billable conversations). Starter $24.17/mo billed annually ($29 monthly); Lyro AI from $32.50/mo. 7-day free trial.',
        categories: ['customer-support'],
        tags: ['live chat', 'chatbot', 'ecommerce'],
        features: [
          { title: 'Lyro AI agent', description: 'Answers common questions from your FAQ and help pages.' },
          { title: 'Live chat & ticketing', description: 'One inbox for chat and email with handoff to a human.' },
          { title: 'Shopify app', description: 'Install from the Shopify App Store in minutes.' },
        ],
        about: [
          'Tidio is a popular choice for small online stores that want instant replies without hiring: live chat for your team plus an AI agent for the repetitive questions.',
          'Lyro is priced separately from the chat seats, so estimate your monthly conversation volume before picking a plan.',
        ],
        images: img('tidio'),
        affiliateUrl: 'https://example.com/aff/tidio?ref=smbai-demo',
        affiliatePlatform: 'PartnerStack (demo)',
        affiliateStatus: 'applied',
      },
    ],
    posts: [
      {
        title: 'Otter.ai vs Fireflies.ai (2026): which AI notetaker should a small team pick?',
        slug: 'otter-vs-fireflies',
        type: 'compare',
        excerpt:
          'Both join Zoom, Meet and Teams and write the notes. The real differences are price per seat, how far back you can search and how well notes flow into your CRM.',
        cover: 'post-otter-vs-fireflies.webp',
        tools: ['otter-ai', 'fireflies-ai'],
        content: lexical([
          ['p', 'AI notetakers are one of the easiest wins for a small team: nobody takes minutes, and anyone who missed the call can catch up from the summary. Otter.ai and Fireflies.ai are the two names most teams shortlist.'],
          ['h2', 'Price'],
          ['ul', ['**Otter Pro**: $8.33 per user/month billed annually; Business $19.99.', '**Fireflies Pro**: $10 per seat/month billed annually; Business $19.', 'Both have free plans that are fine for a trial week.']],
          ['h2', 'Search and summaries'],
          ['p', 'Both produce summaries and action items after each call and let you chat with an AI about your meetings. Fireflies leans harder into search across your whole call history, which matters for sales teams.'],
          ['h2', 'Integrations'],
          ['ul', ['**Otter**: Zoom, Meet, Teams, plus Salesforce, HubSpot and Zapier on Pro and above.', '**Fireflies**: Zoom, Meet, Teams and unlimited integrations from Pro.']],
          ['h2', 'Which one to choose'],
          ['p', 'Pick Otter for simple, affordable meeting notes for an internal team. Pick Fireflies if customer calls are the business and you want to search them and sync notes to your CRM.'],
        ]),
        faq: [
          { q: 'Do I need to tell participants they are recorded?', a: 'Yes - consent rules vary by country and state, and both bots announce themselves when they join.' },
          { q: 'Is there a free plan?', a: 'Both have free plans: Otter includes 300 transcription minutes a month; Fireflies has limited AI summaries and 400 minutes of storage.' },
        ],
      },
      {
        title: 'How to add an AI support agent to your store in an afternoon',
        slug: 'ai-support-agent-tutorial',
        type: 'tutorial',
        excerpt:
          'A step-by-step Tidio setup using the FAQ, shipping and returns pages you already have - plus the handoff rules that stop the bot from frustrating customers.',
        cover: 'post-support-agent.webp',
        tools: ['tidio'],
        content: lexical([
          ['p', 'Most customer questions repeat: where is my order, can I return this, do you ship to my country. An AI agent that answers from your own help content can handle those instantly, day and night.'],
          ['h2', 'Step 1: collect your answers'],
          ['p', 'Gather your FAQ, shipping, returns and sizing pages. This is the agent’s knowledge - if it is not written down, the bot cannot answer it.'],
          ['h2', 'Step 2: install the chat widget'],
          ['p', 'On Shopify, install Tidio from the Shopify App Store; on other sites, paste the snippet or use the WordPress plugin.'],
          ['h2', 'Step 3: turn on Lyro'],
          ['p', 'Point Lyro at your help content, then ask it twenty real questions from your inbox and fix the gaps in your FAQ rather than in the bot.'],
          ['h2', 'Step 4: set handoff rules'],
          ['ol', ['Route billing, refunds and complaints to a human.', 'Set operating hours so customers know when a person will reply.', 'Review a sample of conversations every week.']],
        ]),
        faq: [
          { q: 'Will the bot make things up?', a: 'Restrict it to your knowledge base, test it with real questions and review transcripts weekly.' },
          { q: 'What does it cost?', a: 'Tidio has a free plan; Lyro AI is priced separately from $32.50/month billed annually. Check the pricing page for your volume.' },
        ],
      },
    ],
  },
]
