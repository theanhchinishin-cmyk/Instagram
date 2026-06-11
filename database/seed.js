const db = require("./db");
const bcrypt = require("bcryptjs");

function seed() {
  try {
    // Check if users already exist
    const userCount = db
      .prepare("SELECT COUNT(*) AS count FROM users")
      .get().count;
    if (userCount > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    console.log("Seeding database with mock data...");

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("password123", salt);

    // 1. Create mock users
    const users = [
      {
        username: "antigravity",
        email: "antigravity@google.com",
        password: passwordHash,
        full_name: "Antigravity AI",
        bio: "Advanced Agentic Coding assistant designed by Google DeepMind. Coding at the speed of thought. 🌌🚀",
        avatar:
          "https://i.pinimg.com/736x/d6/05/56/d605561acec999bde555bf582207dd08.jpg",
      },
      {
        username: "travel_lens",
        email: "travel@lens.com",
        password: passwordHash,
        full_name: "Elena Rostova",
        bio: "Wanderlust explorer. Capturing the world one pixel at a time. Currently: Kyoto, Japan. 🗺️✈️",
        avatar:
          "https://i.pinimg.com/736x/69/d4/f5/69d4f553a801270cc080e78402855353.jpg",
      },
      {
        username: "chef_special",
        email: "chef@special.com",
        password: passwordHash,
        full_name: "Marcus Sterling",
        bio: "Michelin star enthusiast. Culinary designer. Food is art, cook with passion. 🍳🍷",
        avatar:
          "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
      },
      {
        username: "urban_architect",
        email: "urban@architect.com",
        password: passwordHash,
        full_name: "Sophia Chen",
        bio: "Minimalism and concrete. Architectural photographer. Building dreams. 🏢📐",
        avatar:
          "https://i.pinimg.com/736x/19/11/0a/19110a75dc2d2724cb8cb9a7676f0e76.jpg",
      },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, full_name, bio, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const userIds = {};
    for (const u of users) {
      const result = insertUser.run(
        u.username,
        u.email,
        u.password,
        u.full_name,
        u.bio,
        u.avatar,
      );
      userIds[u.username] = result.lastInsertRowid;
    }

    // 2. Create follows relationships
    // Make everyone follow each other to populate the feed
    const insertFollow = db.prepare(`
      INSERT INTO follows (follower_id, following_id)
      VALUES (?, ?)
    `);

    const usernames = Object.keys(userIds);
    for (let i = 0; i < usernames.length; i++) {
      for (let j = 0; j < usernames.length; j++) {
        if (i !== j) {
          insertFollow.run(userIds[usernames[i]], userIds[usernames[j]]);
        }
      }
    }

    // 3. Create mock posts
    const posts = [
      {
        username: "travel_lens",
        image_path:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
        caption:
          "Golden Pavilion in Kyoto. A moment of absolute serenity. ⛩️🍁 #kyoto #japan #travel",
      },
      {
        username: "urban_architect",
        image_path:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
        caption:
          "Lines, shadows, and glass. Modern symmetry in the heart of London. 🏢📐 #architecture #minimalism",
      },
      {
        username: "chef_special",
        image_path:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
        caption:
          "Smoked beef brisket steak with garlic rosemary glaze. Perfectly cooked. 🥩🔥 #chefsofinstagram #foodporn",
      },
      {
        username: "antigravity",
        image_path:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        caption:
          "We are creating the future of social networks. Clean code, pristine design. 🌌💻 #coding #deepmind #antigravity",
      },
      {
        username: "travel_lens",
        image_path:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        caption:
          "Sandy toes and endless ocean views. Summer never ends here. 🌊🏖️ #beachlife #sunset",
      },
    ];

    const insertPost = db.prepare(`
      INSERT INTO posts (user_id, image_path, caption)
      VALUES (?, ?, ?)
    `);

    const postIds = [];
    for (const p of posts) {
      const result = insertPost.run(
        userIds[p.username],
        p.image_path,
        p.caption,
      );
      postIds.push(result.lastInsertRowid);
    }

    // 4. Create mock likes
    const insertLike = db.prepare(`
      INSERT INTO likes (user_id, post_id)
      VALUES (?, ?)
    `);

    // Add some random likes
    insertLike.run(userIds["antigravity"], postIds[0]);
    insertLike.run(userIds["chef_special"], postIds[0]);
    insertLike.run(userIds["urban_architect"], postIds[0]);

    insertLike.run(userIds["travel_lens"], postIds[1]);
    insertLike.run(userIds["antigravity"], postIds[1]);

    insertLike.run(userIds["travel_lens"], postIds[2]);
    insertLike.run(userIds["urban_architect"], postIds[2]);

    insertLike.run(userIds["travel_lens"], postIds[3]);
    insertLike.run(userIds["chef_special"], postIds[3]);
    insertLike.run(userIds["urban_architect"], postIds[3]);

    // 5. Create mock comments
    const insertComment = db.prepare(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (?, ?, ?)
    `);

    insertComment.run(
      userIds["antigravity"],
      postIds[0],
      "This is incredibly beautiful! I need to visit Kyoto.",
    );
    insertComment.run(
      userIds["chef_special"],
      postIds[0],
      "Wow, the colors are gorgeous.",
    );
    insertComment.run(
      userIds["travel_lens"],
      postIds[0],
      "Thanks guys! It was an amazing trip.",
    );

    insertComment.run(
      userIds["urban_architect"],
      postIds[2],
      "Looks delicious Marcus!",
    );
    insertComment.run(
      userIds["antigravity"],
      postIds[2],
      "Can you share the recipe? 😋",
    );

    insertComment.run(
      userIds["travel_lens"],
      postIds[3],
      "So proud to be using Antigravity Clone!",
    );
    insertComment.run(
      userIds["urban_architect"],
      postIds[3],
      "Clean layout, indeed.",
    );

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

module.exports = seed;
