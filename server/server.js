// const postRoutes = require("./routes/postRoutes");
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const path = require("path");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const platformRoutes = require("./routes/platformRoutes");
// const iconGridRoutes = require("./routes/iconGridRoutes");

// require("dotenv").config({
//   path: "c:\\Users\\vk226\\OneDrive\\Desktop\\React-2project\\server\\.env",
// });

// const app = express();

// /* ================= SECURITY ================= */

// // Helmet
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//         imgSrc: ["'self'", "data:", "https:", "http://localhost:5000", "blob:"],
//         scriptSrc: ["'self'"],
//         connectSrc: ["'self'", "http://localhost:5173"],
//       },
//     },
//   })
// );

// // Rate Limit
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use(limiter);

// // Auth Limit
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
// });

// /* ================= MIDDLEWARE ================= */

// // CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // Body parser
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Serve uploads - CORS already handled by main cors middleware above
// app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
//   setHeaders: (res, path, stat) => {
//     res.set("Cross-Origin-Resource-Policy", "cross-origin");
//     res.set("Cache-Control", "public, max-age=3600");
//   }
// }));

// /* ================= SESSION ================= */

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

// /* ================= PASSPORT ================= */

// app.use(passport.initialize());
// app.use(passport.session());

// // Google OAuth (only if keys present)
// if (
//   process.env.GOOGLE_CLIENT_ID &&
//   process.env.GOOGLE_CLIENT_SECRET &&
//   process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here"
// ) {
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "/api/auth/google/callback",
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         try {
//           const User = require("./models/User");

//           let user = await User.findOne({ googleId: profile.id });

//           if (!user) {
//             user = await User.findOne({ email: profile.emails[0].value });

//             if (user) {
//               user.googleId = profile.id;
//               await user.save();
//             } else {
//               user = await User.create({
//                 name: profile.displayName,
//                 email: profile.emails[0].value,
//                 googleId: profile.id,
//                 role: "user",
//               });
//             }
//           }

//           return done(null, user);
//         } catch (error) {
//           console.error(error);
//           return done(error, null);
//         }
//       }
//     )
//   );
// }

// // Serialize
// passport.serializeUser((user, done) => done(null, user.id));

// // Deserialize
// passport.deserializeUser(async (id, done) => {
//   try {
//     const User = require("./models/User");
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// /* ================= ROUTES ================= */

// // Auth
// app.use("/api/auth", require("./routes/authRoutes"));

// // Contact
// app.use("/api", require("./routes/contactRoutes"));

// // Protected
// app.use("/api", require("./routes/protectedRoutes"));

// // ✅ SOCIAL ROUTES
// const socialRoutes = require("./routes/socialRoutes");
// app.use("/api/social", socialRoutes);
// //WHATSAPP ROUTES
// app.use(
//   "/api/whatsapp",
//   require("./routes/whatsapp")
// );


// // HR profile routes
// const hrRoutes = require("./routes/hrRoutes");
// app.use("/api/hr", hrRoutes);

// // Icon grid / HR platform management routes
// app.use("/api/icon-grid", iconGridRoutes);

// // Posts
// app.use("/api/posts", postRoutes);
// app.use("/api/platform", platformRoutes);

// /* ================= DB ================= */

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log(err));

// /* ================= SERVER ================= */

// app.listen(5000, () => {
//   console.log("🚀 Server running on http://localhost:5000");
// });
const postRoutes = require("./routes/postRoutes");

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const session = require("express-session");

const passport = require("passport");

const helmet = require("helmet");

const rateLimit = require("express-rate-limit");

const path = require("path");

const GoogleStrategy =
require("passport-google-oauth20").Strategy;

const platformRoutes =
require("./routes/platformRoutes");

const iconGridRoutes =
require("./routes/iconGridRoutes");


// SOCKET.IO

const http = require("http");

const { Server } =
require("socket.io");


require("dotenv").config({

  path:
  "c:\\Users\\vk226\\OneDrive\\Desktop\\React-2project\\server\\.env",

});


// EXPRESS APP

const app = express();


// HTTP SERVER

const server =
http.createServer(app);


// SOCKET SERVER

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");

const io = new Server(server, {

  cors: {

    origin: allowedOrigins,

    credentials: true,
  },
});


/* ================= SECURITY ================= */


app.use(

  helmet({

    contentSecurityPolicy: {

      directives: {

        defaultSrc: ["'self'"],

        styleSrc: [

          "'self'",

          "'unsafe-inline'",

          "https://fonts.googleapis.com"
        ],

        fontSrc: [

          "'self'",

          "https://fonts.gstatic.com"
        ],

        imgSrc: [

          "'self'",

          "data:",

          "https:",

          "http://localhost:5000",

          "blob:"
        ],

        scriptSrc: ["'self'"],

        connectSrc: [

          "'self'",

          "http://localhost:5173"
        ],
      },
    },
  })
);


// RATE LIMIT

const limiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,
});

app.use(limiter);


// AUTH LIMIT

const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 5,
});


/* ================= MIDDLEWARE ================= */


// CORS

app.use(

  cors({

    origin: allowedOrigins,

    credentials: true,
  })
);


// BODY PARSER

app.use(express.json({

  limit: "10mb"
}));

app.use(express.urlencoded({

  extended: true
}));


// STATIC UPLOADS

app.use(

  "/uploads",

  express.static(

    path.join(__dirname, "uploads"),

    {

      setHeaders: (res) => {

        res.set(

          "Cross-Origin-Resource-Policy",

          "cross-origin"
        );

        res.set(

          "Cache-Control",

          "public, max-age=3600"
        );
      }
    }
  )
);


/* ================= SESSION ================= */


app.use(

  session({

    secret:
    process.env.SESSION_SECRET || "secret",

    resave: false,

    saveUninitialized: false,

    cookie: {

      secure: false,

      httpOnly: true,

      maxAge:
      24 * 60 * 60 * 1000,
    },
  })
);


/* ================= PASSPORT ================= */


app.use(passport.initialize());

app.use(passport.session());


// GOOGLE OAUTH

if (

  process.env.GOOGLE_CLIENT_ID &&

  process.env.GOOGLE_CLIENT_SECRET &&

  process.env.GOOGLE_CLIENT_ID !==
  "your_google_client_id_here"

) {

  passport.use(

    new GoogleStrategy(

      {

        clientID:
        process.env.GOOGLE_CLIENT_ID,

        clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
        "/api/auth/google/callback",
      },

      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {

        try {

          const User =
          require("./models/User");

          let user =
          await User.findOne({

            googleId: profile.id
          });

          if (!user) {

            user =
            await User.findOne({

              email:
              profile.emails[0].value
            });

            if (user) {

              user.googleId =
              profile.id;

              await user.save();

            } else {

              user =
              await User.create({

                name:
                profile.displayName,

                email:
                profile.emails[0].value,

                googleId:
                profile.id,

                role:"user",
              });
            }
          }

          return done(null, user);

        } catch (error) {

          console.error(error);

          return done(error, null);
        }
      }
    )
  );
}


// SERIALIZE

passport.serializeUser(

  (user, done) =>
  done(null, user.id)
);


// DESERIALIZE

passport.deserializeUser(

  async (id, done) => {

    try {

      const User =
      require("./models/User");

      const user =
      await User.findById(id);

      done(null, user);

    } catch (err) {

      done(err, null);
    }
  }
);


/* ================= ROUTES ================= */


// AUTH

app.use(

  "/api/auth",

  require("./routes/authRoutes")
);


// CONTACT

app.use(

  "/api",

  require("./routes/contactRoutes")
);


// PROTECTED

app.use(

  "/api",

  require("./routes/protectedRoutes")
);


// SOCIAL

const socialRoutes =
require("./routes/socialRoutes");

app.use(

  "/api/social",

  socialRoutes
);


// WHATSAPP

app.use(

  "/api/whatsapp",

  require("./routes/whatsapp")
);


// HR ROUTES

const hrRoutes =
require("./routes/hrRoutes");

app.use(

  "/api/hr",

  hrRoutes
);


// ICON GRID

app.use(

  "/api/icon-grid",

  iconGridRoutes
);


// POSTS

app.use(

  "/api/posts",

  postRoutes
);

app.use(

  "/api/platform",

  platformRoutes
);


/* ================= SOCKET ================= */


io.on(

  "connection",

  (socket)=>{

    console.log(
      "✅ User Connected:",
      socket.id
    );

    socket.on(

      "disconnect",

      ()=>{

        console.log(
          "❌ User Disconnected:",
          socket.id
        );
      }
    );
  }
);


// MAKE IO GLOBAL

app.set("io", io);


/* ================= DB ================= */


mongoose

  .connect(process.env.MONGO_URI)

  .then(()=>{

    console.log("✅ MongoDB Connected");

  })

  .catch((err)=>{

    console.log(err);
  });


/* ================= SERVER ================= */


server.listen(

  5000,

  ()=>{

    console.log(
      "🚀 Server running on http://localhost:5000"
    );
  }
);