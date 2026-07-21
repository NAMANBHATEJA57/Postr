import { PrismaClient } from '@prisma/client';
import { generateId } from '../src/lib/nanoid.js';
import { encryptMessage } from '../src/lib/encryption.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

const postcards = [
    {
        title: "City of Lakes",
        theme: "minimal-light",
        message: "As the sun rises over Lake Pichola and the City Palace stands tranquil, I’m sending you morning calm. Though miles apart, your smile warms me brighter than these golden rays. I wish you a peaceful day, as beautiful as Udaipur’s dawn.",
        mediaUrl: "https://unsplash.com/photos/AVFjDGbqiqE/download",
    },
    {
        title: "Backwaters Serenity",
        theme: "minimal-light",
        message: "Gentle water, green palms, and a quiet houseboat—this serene Kerala scene makes me think of peace. I’m grateful for memories of lazy days on the backwaters. Even far away, I send you warmth and calm. Imagine us floating together under the tropical sky again someday soon.",
        mediaUrl: "https://unsplash.com/photos/3rtFVq1oA9o/download",
    },
    {
        title: "Taj Mahal Dawn",
        theme: "minimal-light",
        message: "I wish you were here with me at sunrise by the Taj Mahal. The morning light paints the marble pink, and I imagine us standing in awe of its beauty. Until we meet again, I send you this dawn’s magic and all my love, hoping it brightens your day.",
        mediaUrl: "https://unsplash.com/photos/HqbTRCFQLvA/download",
    },
    {
        title: "Morning Café Chat",
        theme: "minimal-light",
        message: "I wish we could be here sipping coffee together at sunrise, just chatting away. The warm glow and quiet comfort remind me of our best mornings. Even miles apart, I send you a cup of warmth and a smile. Can’t wait to share a brew and a story with you soon!",
        mediaUrl: "https://unsplash.com/photos/zsUN3WLzl4Q/download",
    },
    {
        title: "Goa Night Lights",
        theme: "minimal-light",
        message: "If only we were dancing under these neon lights by the beach! Seeing “I ❤️ Goa” lights up my face thinking of our adventures. I can almost hear the waves and your laughter. Hang in there and remember our fun times—I can’t wait for our next sunset dance together!",
        mediaUrl: "https://unsplash.com/photos/ulKjTA6MaHM/download",
    },
    {
        title: "Campfire Stories",
        theme: "minimal-light",
        message: "I can almost smell the campfire smoke and hear our laughter. Remember last time under the stars, swapping stories by the fire? Although we’re apart now, that warm glow reminds me of our friendship’s warmth. Looking forward to the next time we’ll share stories and toast marshmallows together.",
        mediaUrl: "https://unsplash.com/photos/0aI54kAjWP8/download",
    },
    {
        title: "Warm Holiday",
        theme: "minimal-light",
        message: "Wrapped in a warm room filled with soft lights, I’m thankful for you. May the glow of home and family warmth reach you wherever you are. I count blessings of laughter and love we share. Sending you cozy thoughts and hugs from afar, hoping we’re together soon.",
        mediaUrl: "https://unsplash.com/photos/BJ_xbmq6EdM/download",
    },
    {
        title: "Table of Memories",
        theme: "minimal-light",
        message: "Every family meal I’ve ever enjoyed reminds me of you. Though I’m not there at this table, my heart is. I cherish all the memories we’ve shared around dinner and am grateful for those yet to come. Sending love from across the miles at this peaceful evening meal.",
        mediaUrl: "https://unsplash.com/photos/ejL5BB5Bbjo/download",
    },
    {
        title: "Lantern of Love",
        theme: "minimal-light",
        message: "In the quiet dark, a single lantern’s flame makes me think of home and you. Each light is a memory of love and gratitude I hold for our family. Even apart, you’re the light guiding me through the night. Thank you for being my steady glow and inspiring peace within me.",
        mediaUrl: "https://unsplash.com/photos/1bxmZtj8D-g/download",
    },
    {
        title: "Sunset Silhouettes",
        theme: "minimal-light",
        message: "These shadows share a secret kiss at sunset, and I send you my silent love just the same. Our hearts are never far apart, even when we’re apart. Your love warms me through twilight. Until I can hold you again, let this fiery sky carry my kisses to you.",
        mediaUrl: "https://unsplash.com/photos/tQvTHTXgWww/download",
    },
    {
        title: "Sunlit Embrace",
        theme: "minimal-light",
        message: "Feel the warmth of my arms in this sunlit field. Just like this golden light, my love for you shines without distance. I hold you close in my heart every day, cherishing the way your smile lights up my world. Counting down the days until I can hug you again.",
        mediaUrl: "https://unsplash.com/photos/xu5hvtbLgpM/download",
    },
    {
        title: "Heart of Dawn",
        theme: "minimal-light",
        message: "Even at sunrise, my love for you forms a perfect heart. Each new day my first thought is you. Distance can’t diminish what we share—like dawn won’t forget the sun. Let this golden morning heart remind you that no matter where we are, we share one loving light.",
        mediaUrl: "https://unsplash.com/photos/yW4SHX-ueo4/download",
    },
    {
        title: "Peak Perspective",
        theme: "minimal-light",
        message: "Standing on a mountain’s summit at sunset makes me feel both small and limitless. Whatever challenges we face, this view reminds us to keep climbing and keep dreaming. The world is vast, but our spirits are bigger. Here’s to new heights and the courage to reach them together.",
        mediaUrl: "https://unsplash.com/photos/XwLyAFB2iUI/download",
    },
    {
        title: "Golden Forest Walk",
        theme: "minimal-light",
        message: "A quiet path bathed in golden light brings me peace. I picture us strolling here someday, leaves crunching underfoot and sunlight filtering through the trees. Nature teaches patience and hope—reminding us that every journey has its clearing. Can’t wait to walk this path with you.",
        mediaUrl: "https://unsplash.com/photos/1aCxlDogCCM/download",
    },
    {
        title: "Dawn of Hope",
        theme: "minimal-light",
        message: "An empty beach at sunrise feels like a fresh start. I’m sending you the calm of these golden waves and quiet sky. May this peaceful morning fill your day with hope and remind you that every new dawn brings new possibilities. Good morning — I hope you smile today.",
        mediaUrl: "https://unsplash.com/photos/KMn4VEeEPR8/download",
    }
];

async function main() {
    console.log("Seeding public postcards...");
    let successCount = 0;
    
    for (const pc of postcards) {
        try {
            await prisma.publicPost.create({
                data: {
                    id: generateId(),
                    mediaUrl: pc.mediaUrl,
                    mediaType: "image",
                    title: pc.title,
                    message: encryptMessage(pc.message),
                    senderName: "Dearly Team",
                    theme: pc.theme,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            successCount++;
            console.log(`Created postcard: ${pc.title}`);
        } catch (e) {
            console.error(`Failed to create ${pc.title}:`, e);
        }
    }
    
    console.log(`Successfully seeded ${successCount} postcards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
