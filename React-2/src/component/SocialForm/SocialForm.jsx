// HRSocialDashboard.jsx
import React, { useState, useEffect } from "react";
import "./SocialForm.css";


// ========== ICONS (Simple SVG Components) ==========
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  Compose: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  Templates: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  Schedule: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  ),
  Analytics: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  Share: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
  ),
  Comment: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>
  ),
  TrendDown: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
    </svg>
  )
};

// ========== PLATFORM DATA ==========
const allPlatforms = [
  { id: "facebook", name: "Facebook", icon: "FaFacebook", color: "#1877F2", charLimit: 63206 },
  { id: "instagram", name: "Instagram", icon: "📷", color: "#E4405F", charLimit: 2200 },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2", charLimit: 3000 },
  { id: "twitter", name: "Twitter/X", icon: "🐦", color: "#1DA1F2", charLimit: 280 },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "#25D366", charLimit: 65536 },
  { id: "telegram", name: "Telegram", icon: "✈️", color: "#0088CC", charLimit: 4096 },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000", charLimit: 5000 },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "#BD081C", charLimit: 500 },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000", charLimit: 2200 },
  { id: "snapchat", name: "Snapchat", icon: "👻", color: "#FFFC00", charLimit: 250 },
  { id: "reddit", name: "Reddit", icon: "🤖", color: "#FF4500", charLimit: 40000 },
  { id: "discord", name: "Discord", icon: "🎮", color: "#5865F2", charLimit: 2000 },
  { id: "slack", name: "Slack", icon: "💼", color: "#4A154B", charLimit: 40000 },
  { id: "email", name: "Email Blast", icon: "📧", color: "#EA4335", charLimit: 100000 },
  { id: "sms", name: "SMS", icon: "📱", color: "#34B7F1", charLimit: 160 }
];

// ========== TEMPLATE CATEGORIES ==========
const templateCategories = [
  { id: "hiring", name: "🧑‍💼 Hiring/Jobs", icon: "💼" },
  { id: "announcement", name: "📢 Announcements", icon: "📢" },
  { id: "event", name: "🎉 Events", icon: "🎉" },
  { id: "promotion", name: "🔥 Promotions", icon: "🔥" },
  { id: "holiday", name: "🎄 Holidays", icon: "🎄" },
  { id: "engagement", name: "💬 Engagement", icon: "💬" },
  { id: "custom", name: "✏️ Custom", icon: "✏️" }
];

// ========== DEFAULT TEMPLATES ==========
const defaultTemplates = [
  {
    id: 1,
    category: "hiring",
    title: "We're Hiring!",
    content: "🚀 We're Hiring!\n\nJoin our amazing team as a [Position]!\n\n✅ Competitive salary\n✅ Remote work options\n✅ Growth opportunities\n✅ Great team culture\n\nApply now: [Link]\n\n#Hiring #Jobs #Careers",
    tags: ["hiring", "jobs", "careers"]
  },
  {
    id: 2,
    category: "hiring",
    title: "Tech Position Open",
    content: "💻 Looking for talented developers!\n\nWe're expanding our tech team and need:\n• Frontend Developers\n• Backend Engineers\n• Full Stack Developers\n\n🎯 Requirements:\n- 2+ years experience\n- Strong problem-solving skills\n- Team player mindset\n\nDM us or apply at: [Link]\n\n#TechJobs #Developer #Hiring",
    tags: ["tech", "developer", "hiring"]
  },
  {
    id: 3,
    category: "announcement",
    title: "Company Update",
    content: "📢 Important Announcement!\n\nWe're excited to share some big news with our community...\n\n[Your announcement here]\n\nThank you for being part of our journey! 🙏\n\n#CompanyNews #Update #Announcement",
    tags: ["announcement", "news", "update"]
  },
  {
    id: 4,
    category: "announcement",
    title: "New Office Launch",
    content: "🏢 Exciting News!\n\nWe're thrilled to announce the opening of our new office in [Location]!\n\n📍 Address: [Address]\n📅 Opening Date: [Date]\n\nThis marks a new chapter in our growth journey. Thank you for your continued support!\n\n#NewOffice #Growth #Expansion",
    tags: ["office", "expansion", "growth"]
  },
  {
    id: 5,
    category: "event",
    title: "Webinar Invitation",
    content: "🎓 Free Webinar Alert!\n\nTopic: [Webinar Topic]\n📅 Date: [Date]\n⏰ Time: [Time]\n🔗 Register: [Link]\n\nWhat you'll learn:\n✅ [Point 1]\n✅ [Point 2]\n✅ [Point 3]\n\nLimited spots available! Register now! 🚀\n\n#Webinar #FreeEvent #Learning",
    tags: ["webinar", "event", "learning"]
  },
  {
    id: 6,
    category: "event",
    title: "Team Meetup",
    content: "🎉 Team Meetup Alert!\n\nJoin us for an amazing team gathering!\n\n📅 Date: [Date]\n📍 Venue: [Location]\n⏰ Time: [Time]\n\nAgenda:\n🍕 Food & Drinks\n🎮 Fun Activities\n🤝 Networking\n\nRSVP by [Date]\n\n#TeamMeetup #CompanyCulture #TeamBuilding",
    tags: ["meetup", "team", "event"]
  },
  {
    id: 7,
    category: "promotion",
    title: "Special Offer",
    content: "🔥 LIMITED TIME OFFER! 🔥\n\nGet [Discount]% OFF on all our services!\n\n⏰ Valid until: [Date]\n🎁 Use code: [CODE]\n\nDon't miss out on this amazing deal!\n\n👉 Shop now: [Link]\n\n#Sale #Discount #SpecialOffer",
    tags: ["offer", "discount", "promotion"]
  },
  {
    id: 8,
    category: "holiday",
    title: "Holiday Wishes",
    content: "🎄 Season's Greetings! 🎄\n\nWishing you and your loved ones a joyful holiday season filled with happiness and prosperity!\n\nThank you for being part of our journey this year. Here's to an amazing [Year] ahead! 🎉\n\n#HappyHolidays #Seasons Greetings #NewYear",
    tags: ["holiday", "greetings", "celebration"]
  },
  {
    id: 9,
    category: "engagement",
    title: "Poll/Question",
    content: "🤔 Quick Question!\n\nWe'd love to hear from you:\n\n[Your Question Here]\n\n👇 Drop your thoughts in the comments!\n\n#Community #YourOpinionMatters #Engagement",
    tags: ["poll", "question", "engagement"]
  },
  {
    id: 10,
    category: "engagement",
    title: "Milestone Celebration",
    content: "🎉 MILESTONE ACHIEVED! 🎉\n\nWe just hit [Number] [followers/customers/users]!\n\nThank you to each and every one of you for being part of our journey. This wouldn't be possible without your support! 🙏\n\nHere's to many more milestones together! 🚀\n\n#Milestone #ThankYou #Community",
    tags: ["milestone", "celebration", "thankyou"]
  }
];

// ========== EMOJI PICKER DATA ==========
const emojiCategories = {
  "😀 Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤩", "🥳", "😏", "🤔", "🤗"],
  "👍 Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤝", "👏", "🙌", "💪", "🙏", "✋", "👋", "🤚", "🖐️", "👐", "🤲", "👊", "✊", "🤛", "🤜"],
  "❤️ Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕", "💞", "💓", "💗", "💖", "💝", "💘", "💟", "❣️", "💔", "🩷", "🩵"],
  "🎉 Celebration": ["🎉", "🎊", "🎈", "🎁", "🎄", "🎃", "🎆", "🎇", "✨", "🌟", "⭐", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🎗️", "🏵️", "🎀"],
  "💼 Work": ["💼", "📧", "📱", "💻", "🖥️", "📊", "📈", "📉", "📋", "📝", "✏️", "📌", "📍", "🗂️", "📁", "📂", "🗄️", "📎", "🔗", "📤"],
  "🚀 Objects": ["🚀", "💡", "🔥", "⚡", "🌈", "☀️", "🌙", "⭐", "🌟", "✅", "❌", "⚠️", "ℹ️", "❓", "❗", "💯", "🔔", "📢", "🎯", "🎪"]
};

// ========== MAIN COMPONENT ==========
const HRSocialDashboard = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Message composition state
  const [message, setMessage] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  const [contects, setContects] = useState([
    {name: "vikas", number: "9507562013" },
    {name: "kartik", number: "9001060923" }
  ]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const shareToPlatform = (platform) => {
  if (!message.trim()) {
    showNotification("Please write message first", "error");
    return;
  }

  const text = encodeURIComponent(message);
  const url = encodeURIComponent("https://example.com");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    twitter: `https://twitter.com/intent/tweet?text=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/9477288288?text=${text}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    reddit: `https://www.reddit.com/submit?title=${text}&url=${url}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
    email: `mailto:?subject=Check this&body=${text}`,
    sms: `sms:?body=${text}`
  };

  if (shareLinks[platform]) {
    window.open(shareLinks[platform], "_blank");
  } else {
    showNotification(`${platform} direct share not supported`, "info");
  }
};
  
  // Templates state
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "", category: "custom", tags: [] });
  
  // History state
  const [postHistory, setPostHistory] = useState([
    {
      id: 1,
      message: "We're hiring developers! Join our amazing team. Apply now at careers.example.com #Hiring",
      platforms: ["facebook", "linkedin", "twitter"],
      sentAt: "2024-01-15 10:30 AM",
      status: "sent",
      engagement: { likes: 245, comments: 32, shares: 18 }
    },
    {
      id: 2,
      message: "Happy New Year from our team! Wishing you success in 2024! 🎉",
      platforms: ["facebook", "instagram", "linkedin"],
      sentAt: "2024-01-01 12:00 AM",
      status: "sent",
      engagement: { likes: 512, comments: 89, shares: 45 }
    },
    {
      id: 3,
      message: "Upcoming webinar: Digital Marketing Trends 2024. Register now!",
      platforms: ["linkedin", "twitter", "email"],
      sentAt: "2024-01-20 02:00 PM",
      status: "scheduled",
      engagement: null
    }
  ]);
  
  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchHistory, setSearchHistory] = useState("");
  
  // Analytics data
  const [analyticsData] = useState({
    totalPosts: 156,
    totalEngagement: 45280,
    avgEngagement: 290,
    topPlatform: "LinkedIn",
    weeklyGrowth: 12.5,
    monthlyPosts: [12, 18, 15, 22, 28, 25, 20, 30, 35, 28, 32, 40],
    platformStats: [
      { platform: "LinkedIn", posts: 45, engagement: 15420, followers: 12500 },
      { platform: "Facebook", posts: 38, engagement: 12890, followers: 8900 },
      { platform: "Instagram", posts: 32, engagement: 9870, followers: 15600 },
      { platform: "Twitter", posts: 41, engagement: 7100, followers: 5400 }
    ]
  });

  // ========== HELPER FUNCTIONS ==========
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return null;
    const limits = selectedPlatforms.map(id => {
      const platform = allPlatforms.find(p => p.id === id);
      return platform ? platform.charLimit : Infinity;
    });
    return Math.min(...limits);
  };

  const characterLimit = getCharacterLimit();
  const characterCount = message.length;
  const isOverLimit = characterLimit && characterCount > characterLimit;

  // ========== EVENT HANDLERS ==========
  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAllPlatforms = () => {
    if (selectedPlatforms.length === allPlatforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(allPlatforms.map(p => p.id));
    }
  };

  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const useTemplate = (template) => {
    setMessage(template.content);
    showNotification(`Template "${template.title}" applied!`);
  };

  const saveTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) {
      showNotification("Please fill in title and content", "error");
      return;
    }

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? { ...t, ...newTemplate } : t
      ));
      showNotification("Template updated successfully!");
    } else {
      const newId = Math.max(...templates.map(t => t.id)) + 1;
      setTemplates(prev => [...prev, { ...newTemplate, id: newId }]);
      showNotification("Template created successfully!");
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
    setNewTemplate({ title: "", content: "", category: "custom", tags: [] });
  };

  const deleteTemplate = (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      showNotification("Template deleted!");
    }
  };

 const handleSubmit = async () => {
  if (!message.trim()) {
    showNotification("Please enter a message", "error");
    return;
  }
  const toggleContact = (number) => {
    setSelectedContacts(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  }

  if (selectedPlatforms.length === 0) {
    showNotification("Please select at least one platform", "error");
    return;
  }

  if (isOverLimit) {
    showNotification("Message exceeds character limit", "error");
    return;
  }

  if (scheduleType === "scheduled" && (!scheduleDate || !scheduleTime)) {
    showNotification("Please select date and time", "error");
    return;
  }

  try {
    const data = {
      message,
      platforms: selectedPlatforms,
      scheduleType,
      scheduleDate,
      scheduleTime,
      status: scheduleType === "now" ? "sent" : "scheduled"
    };

    // ✅ BACKEND SAVE
    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // ✅ FETCH UPDATED DATA
    const res = await fetch("http://localhost:5000/api/posts");
    const updated = await res.json();
    setPostHistory(updated);

    // 🔥🔥 WHATSAPP SEND LOGIC ADD
    if (selectedPlatforms.includes("whatsapp") && scheduleType === "now") {
      selectedContacts.forEach((number, index) => {
        const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

        setTimeout(() => {
          window.open(url, "_blank");
        }, index * 800);
      });
    }

    // ✅ RESET
    setMessage("");
    setSelectedPlatforms([]);
    setScheduleDate("");
    setScheduleTime("");
    setScheduleType("now");
    setSelectedContacts([]);

    // ✅ SUCCESS
    showNotification(
      scheduleType === "now"
        ? "Message sent successfully! 🚀"
        : "Message scheduled successfully! 📅"
    );

  } catch (err) {
    showNotification("Server error ❌", "error");
  }
};
  const duplicatePost = (post) => {
    setMessage(post.message);
    setSelectedPlatforms(post.platforms);
    setActiveTab("compose");
    showNotification("Post content loaded for editing");
  };

  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPostHistory(prev => prev.filter(p => p.id !== postId));
      showNotification("Post deleted!");
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
                          t.content.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter history
  const filteredHistory = postHistory.filter(p =>
    p.message.toLowerCase().includes(searchHistory.toLowerCase())
  );

  // ========== RENDER FUNCTIONS ==========

  // Dashboard View
  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>📊 Dashboard Overview</h1>
        <p>Welcome back! Here's your social media performance at a glance.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Icons.Send />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Icons.Heart />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.totalEngagement.toLocaleString()}</h3>
            <p>Total Engagement</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Icons.TrendUp />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.avgEngagement}</h3>
            <p>Avg. Engagement</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Icons.Star />
          </div>
          <div className="stat-content">
            <h3>+{analyticsData.weeklyGrowth}%</h3>
            <p>Weekly Growth</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card platform-performance">
          <h3>📈 Platform Performance</h3>
          <div className="platform-stats">
            {analyticsData.platformStats.map((stat, index) => (
              <div key={index} className="platform-stat-row">
                <div className="platform-info">
                  <span className="platform-icon">
                    {allPlatforms.find(p => p.name === stat.platform)?.icon}
                  </span>
                  <span className="platform-name">{stat.platform}</span>
                </div>
                <div className="platform-metrics">
                  <span className="metric">
                    <Icons.Send /> {stat.posts}
                  </span>
                  <span className="metric">
                    <Icons.Heart /> {stat.engagement.toLocaleString()}
                  </span>
                  <span className="metric">
                    <Icons.Users /> {stat.followers.toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(stat.engagement / 20000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card recent-posts">
          <h3>📝 Recent Posts</h3>
          <div className="recent-posts-list">
            {postHistory.slice(0, 3).map((post, index) => (
              <div key={index} className="recent-post-item">
                <div className="post-content-preview">
                  {post.message.substring(0, 60)}...
                </div>
                <div className="post-meta">
                  <span className={`status-badge ${post.status}`}>
                    {post.status}
                  </span>
                  <span className="post-date">{post.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => setActiveTab("history")}>
            View All Posts →
          </button>
        </div>

        <div className="dashboard-card quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-action-buttons">
            <button onClick={() => setActiveTab("compose")}>
              <Icons.Compose /> New Post
            </button>
            <button onClick={() => setActiveTab("templates")}>
              <Icons.Templates /> Templates
            </button>
            <button onClick={() => setActiveTab("schedule")}>
              <Icons.Schedule /> Schedule
            </button>
            <button onClick={() => setActiveTab("analytics")}>
              <Icons.Analytics /> Analytics
            </button>
          </div>
        </div>

        <div className="dashboard-card engagement-chart">
          <h3>📊 Monthly Engagement</h3>
          <div className="simple-chart">
            {analyticsData.monthlyPosts.map((value, index) => (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${(value / 45) * 100}%` }}
                ></div>
                <span className="chart-label">
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Compose View
  const renderCompose = () => (
    <div className="compose-view">
      <div className="compose-header">
        <h1>✍️ Compose Message</h1>
        <p>Create and publish content across multiple platforms</p>
      </div>

      <div className="compose-layout">
        <div className="compose-main">
          {/* Message Input */}
          <div className="compose-card message-card">
            <div className="card-header">
              <h3>📝 Your Message</h3>
              <div className="toolbar">
                <button 
                  className="toolbar-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add Emoji"
                >
                  <Icons.Emoji />
                </button>
                <button className="toolbar-btn" title="Add Image">
                  <Icons.Image />
                </button>
                <button className="toolbar-btn" title="Add Link">
                  <Icons.Link />
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-picker-header">
                  <span>Select Emoji</span>
                  <button onClick={() => setShowEmojiPicker(false)}>
                    <Icons.Close />
                  </button>
                </div>
                <div className="emoji-categories">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category} className="emoji-category">
                      <h4>{category}</h4>
                      <div className="emoji-grid">
                        {emojis.map((emoji, i) => (
                          <button 
                            key={i} 
                            className="emoji-btn"
                            onClick={() => insertEmoji(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              placeholder="What would you like to share today? 💬"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />

            <div className="character-counter">
              <span className={isOverLimit ? "over-limit" : ""}>
                {characterCount} characters
                {characterLimit && ` / ${characterLimit} limit`}
              </span>
              {isOverLimit && (
                <span className="warning">
                  ⚠️ Exceeds limit for selected platforms
                </span>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="compose-card platforms-card">
            <div className="card-header">
              <h3>📱 Select Platforms</h3>
              <button className="select-all-btn" onClick={selectAllPlatforms}>
                {selectedPlatforms.length === allPlatforms.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="platforms-grid">
              {allPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`platform-item ${selectedPlatforms.includes(platform.id) ? "selected" : ""}`}
                  onClick={() => togglePlatform(platform.id)}
                  style={{ "--platform-color": platform.color }}
                >
                  <span className="platform-icon">{platform.icon}</span>
                  <span className="platform-name">{platform.name}</span>
                  <span className="platform-limit">{platform.charLimit} chars</span>
                  {selectedPlatforms.includes(platform.id) && (
                    <span className="check-mark">✓</span>
                  )}
                  <button onClick={() => shareToPlatform(platform.id)}>🚀</button>


                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="compose-card schedule-card">
            <h3>⏰ When to Post</h3>
            
            <div className="schedule-options">
              <label className={`schedule-option ${scheduleType === "now" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="scheduleType"
                  value="now"
                  checked={scheduleType === "now"}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                <span className="option-icon">🚀</span>
                <span className="option-text">Post Now</span>
              </label>

              <label className={`schedule-option ${scheduleType === "scheduled" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scheduleType === "scheduled"}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                <span className="option-icon">📅</span>
                <span className="option-text">Schedule</span>
              </label>
            </div>

            {scheduleType === "scheduled" && (
              <div className="schedule-inputs">
                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="input-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={!message.trim() || selectedPlatforms.length === 0 || isOverLimit}
          >
            <Icons.Send />
            {scheduleType === "now" ? "Send Now" : "Schedule Post"}
          </button>
        </div>

        {/* Sidebar - Preview & Templates */}
        <div className="compose-sidebar">
          {/* Preview */}
          <div className="compose-card preview-card">
            <h3>👁️ Live Preview</h3>
            <div className="preview-content">
              {message ? (
                <div className="preview-message">
                  {message.split("\n").map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              ) : (
                <p className="preview-placeholder">
                  Your message preview will appear here...
                </p>
              )}
            </div>
            {selectedPlatforms.length > 0 && (
              <div className="preview-platforms">
                <span>Posting to:</span>
                <div className="platform-tags">
                  {selectedPlatforms.map(id => {
                    const platform = allPlatforms.find(p => p.id === id);
                    return (
                      <span key={id} className="platform-tag">
                        {platform?.icon} {platform?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="compose-card quick-templates-card">
            <h3>⚡ Quick Templates</h3>
            <div className="quick-templates-list">
              {templates.slice(0, 5).map((template) => (
                <button
                  key={template.id}
                  className="quick-template-btn"
                  onClick={() => useTemplate(template)}
                >
                  <span className="template-title">{template.title}</span>
                  <span className="template-preview">
                    {template.content.substring(0, 50)}...
                  </span>
                </button>
              ))}
            </div>
            <button 
              className="view-all-templates-btn"
              onClick={() => setActiveTab("templates")}
            >
              View All Templates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Templates View
  const renderTemplates = () => (
    <div className="templates-view">
      <div className="templates-header">
        <div className="header-left">
          <h1>📋 Message Templates</h1>
          <p>Manage and create reusable message templates</p>
        </div>
        <button 
          className="create-template-btn"
          onClick={() => {
            setEditingTemplate(null);
            setNewTemplate({ title: "", content: "", category: "custom", tags: [] });
            setShowTemplateModal(true);
          }}
        >
          <Icons.Plus /> Create Template
        </button>
      </div>

      <div className="templates-filters">
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search templates..."
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <span className="template-category">
                {templateCategories.find(c => c.id === template.category)?.icon}
                {templateCategories.find(c => c.id === template.category)?.name || "Custom"}
              </span>
              <div className="template-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => {
                    setEditingTemplate(template);
                    setNewTemplate({ 
                      title: template.title, 
                      content: template.content, 
                      category: template.category,
                      tags: template.tags 
                    });
                    setShowTemplateModal(true);
                  }}
                  title="Edit"
                >
                  <Icons.Edit />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => deleteTemplate(template.id)}
                  title="Delete"
                >
                  <Icons.Delete />
                </button>
              </div>
            </div>

            <h3 className="template-title">{template.title}</h3>
            
            <div className="template-content">
              {template.content.substring(0, 150)}
              {template.content.length > 150 && "..."}
            </div>

            <div className="template-tags">
              {template.tags?.map((tag, i) => (
                <span key={i} className="tag">#{tag}</span>
              ))}
            </div>

            <div className="template-footer">
              <button 
                className="use-template-btn"
                onClick={() => {
                  useTemplate(template);
                  setActiveTab("compose");
                }}
              >
                <Icons.Copy /> Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-templates">
          <p>No templates found. Create your first template!</p>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? "Edit Template" : "Create New Template"}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTemplateModal(false)}
              >
                <Icons.Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Template Title</label>
                <input
                  type="text"
                  placeholder="e.g., Job Opening Announcement"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  {templateCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Template Content</label>
                <textarea
                  placeholder="Write your template message here..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., hiring, jobs, careers"
                  value={newTemplate.tags?.join(", ") || ""}
                  onChange={(e) => setNewTemplate({ 
                    ...newTemplate, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                  })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={saveTemplate}
              >
                {editingTemplate ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Schedule View
  const renderSchedule = () => (
    <div className="schedule-view">
      <div className="schedule-header">
        <h1>📅 Scheduled Posts</h1>
        <p>Manage your upcoming scheduled content</p>
      </div>

      <div className="scheduled-posts-list">
        {postHistory.filter(p => p.status === "scheduled").length === 0 ? (
          <div className="no-scheduled">
            <Icons.Calendar />
            <h3>No Scheduled Posts</h3>
            <p>You don't have any scheduled posts yet. Create one now!</p>
            <button onClick={() => setActiveTab("compose")}>
              <Icons.Plus /> Create Scheduled Post
            </button>
          </div>
        ) : (
          postHistory
            .filter(p => p.status === "scheduled")
            .map((post) => (
              <div key={post.id} className="scheduled-post-card">
                <div className="post-time">
                  <Icons.Calendar />
                  <span>{post.sentAt}</span>
                </div>
                <div className="post-message">{post.message}</div>
                <div className="post-platforms">
                  {post.platforms.map(id => {
                    const platform = allPlatforms.find(p => p.id === id);
                    return (
                      <span key={id} className="platform-badge">
                        {platform?.icon}
                      </span>
                    );
                  })}
                </div>
                <div className="post-actions">
                  <button onClick={() => duplicatePost(post)}>
                    <Icons.Edit /> Edit
                  </button>
                  <button className="delete" onClick={() => deletePost(post.id)}>
                    <Icons.Delete /> Delete
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );

  // History View
  const renderHistory = () => (
    <div className="history-view">
      <div className="history-header">
        <h1>📜 Post History</h1>
        <div className="history-search">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
          />
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map((post) => (
          <div key={post.id} className="history-card">
            <div className="history-card-header">
              <div className="post-status">
                <span className={`status-badge ${post.status}`}>
                  {post.status === "sent" ? "✓ Sent" : "📅 Scheduled"}
                </span>
                <span className="post-date">{post.sentAt}</span>
              </div>
              <div className="post-platforms">
                {post.platforms.map(id => {
                  const platform = allPlatforms.find(p => p.id === id);
                  return (
                    <span key={id} className="platform-badge" title={platform?.name}>
                      {platform?.icon}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="history-card-body">
              <p className="post-message">{post.message}</p>
            </div>

            {post.engagement && (
              <div className="history-card-engagement">
                <span className="engagement-item">
                  <Icons.Heart /> {post.engagement.likes}
                </span>
                <span className="engagement-item">
                  <Icons.Comment /> {post.engagement.comments}
                </span>
                <span className="engagement-item">
                  <Icons.Share /> {post.engagement.shares}
                </span>
              </div>
            )}

            <div className="history-card-actions">
              <button onClick={() => duplicatePost(post)}>
                <Icons.Copy /> Duplicate
              </button>
              <button className="delete" onClick={() => deletePost(post.id)}>
                <Icons.Delete /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Analytics View
  const renderAnalytics = () => (
    <div className="analytics-view">
      <div className="analytics-header">
        <h1>📊 Analytics & Insights</h1>
        <p>Track your social media performance</p>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="stat-icon blue"><Icons.Send /></div>
          <div className="stat-info">
            <h3>{analyticsData.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon green"><Icons.Heart /></div>
          <div className="stat-info">
            <h3>{analyticsData.totalEngagement.toLocaleString()}</h3>
            <p>Total Engagement</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon purple"><Icons.TrendUp /></div>
          <div className="stat-info">
            <h3>+{analyticsData.weeklyGrowth}%</h3>
            <p>Weekly Growth</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon orange"><Icons.Star /></div>
          <div className="stat-info">
            <h3>{analyticsData.topPlatform}</h3>
            <p>Top Platform</p>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="analytics-card">
          <h3>📈 Engagement by Platform</h3>
          <div className="platform-bars">
            {analyticsData.platformStats.map((stat, index) => (
              <div key={index} className="platform-bar-row">
                <div className="bar-label">
                  {allPlatforms.find(p => p.name === stat.platform)?.icon}
                  {stat.platform}
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(stat.engagement / Math.max(...analyticsData.platformStats.map(s => s.engagement))) * 100}%`,
                      backgroundColor: allPlatforms.find(p => p.name === stat.platform)?.color
                    }}
                  ></div>
                </div>
                <div className="bar-value">{stat.engagement.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>📊 Monthly Post Activity</h3>
          <div className="bar-chart">
            {analyticsData.monthlyPosts.map((value, index) => (
              <div key={index} className="bar-item">
                <div 
                  className="bar" 
                  style={{ height: `${(value / Math.max(...analyticsData.monthlyPosts)) * 100}%` }}
                >
                  <span className="bar-tooltip">{value}</span>
                </div>
                <span className="bar-label">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Settings View
  const renderSettings = () => (
    <div className="settings-view">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Configure your HR Social Dashboard</p>
      </div>

      <div className="settings-sections">
        <div className="settings-card">
          <h3>🔗 Connected Accounts</h3>
          <div className="connected-accounts">
            {allPlatforms.slice(0, 6).map((platform) => (
              <div key={platform.id} className="account-item">
                <span className="account-icon">{platform.icon}</span>
                <span className="account-name">{platform.name}</span>
                <button className="connect-btn">Connect</button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3>🔔 Notifications</h3>
          <div className="settings-options">
            <label className="setting-option">
              <input type="checkbox" defaultChecked />
              <span>Email notifications for scheduled posts</span>
            </label>
            <label className="setting-option">
              <input type="checkbox" defaultChecked />
              <span>Push notifications for engagement alerts</span>
            </label>
            <label className="setting-option">
              <input type="checkbox" />
              <span>Weekly analytics report</span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h3>👤 Profile</h3>
          <div className="profile-settings">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" placeholder="Your Company" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="hr@company.com" />
            </div>
            <button className="save-settings-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Help View
  const renderHelp = () => (
    <div className="help-view">
      <div className="help-header">
        <h1>❓ Help & Support</h1>
        <p>Get help with using the HR Social Dashboard</p>
      </div>

      <div className="help-sections">
        <div className="help-card">
          <h3>🚀 Getting Started</h3>
          <ul>
            <li>Navigate using the sidebar menu</li>
            <li>Use "Compose" to create new posts</li>
            <li>Select platforms you want to post to</li>
            <li>Schedule posts for later or send immediately</li>
            <li>Use templates to save time</li>
          </ul>
        </div>

        <div className="help-card">
          <h3>📝 Creating Posts</h3>
          <ul>
            <li>Write your message in the compose area</li>
            <li>Add emojis using the emoji picker</li>
            <li>Select one or more platforms</li>
            <li>Choose to post now or schedule</li>
            <li>Click "Send Now" or "Schedule Post"</li>
          </ul>
        </div>

        <div className="help-card">
          <h3>📋 Using Templates</h3>
          <ul>
            <li>Go to Templates section</li>
            <li>Browse or search templates</li>
            <li>Click "Use Template" to apply</li>
            <li>Create custom templates for your needs</li>
            <li>Organize templates by category</li>
          </ul>
        </div>

        <div className="help-card">
          <h3>📊 Understanding Analytics</h3>
          <ul>
            <li>View total posts and engagement</li>
            <li>Track platform performance</li>
            <li>Monitor weekly growth</li>
            <li>Analyze monthly trends</li>
          </ul>
        </div>
      </div>

      <div className="help-contact">
        <h3>Need More Help?</h3>
        <p>Contact us at: support@hrsocial.com</p>
      </div>
    </div>
  );

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> },
    { id: "compose", label: "Compose", icon: <Icons.Compose /> },
    { id: "templates", label: "Templates", icon: <Icons.Templates /> },
    { id: "schedule", label: "Schedule", icon: <Icons.Schedule /> },
    { id: "history", label: "History", icon: <Icons.History /> },
    { id: "analytics", label: "Analytics", icon: <Icons.Analytics /> },
    { id: "settings", label: "Settings", icon: <Icons.Settings /> },
    { id: "help", label: "Help", icon: <Icons.Help /> }
  ];

  // Render active view
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "compose": return renderCompose();
      case "templates": return renderTemplates();
      case "schedule": return renderSchedule();
      case "history": return renderHistory();
      case "analytics": return renderAnalytics();
      case "settings": return renderSettings();
      case "help": return renderHelp();
      default: return renderDashboard();
    }
  };

  return (
    <div className={`hr-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📢</span>
            {!sidebarCollapsed && <span className="logo-text">HR Social</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">HR</div>
              <div className="user-details">
                <span className="user-name">HR Admin</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h2>{navItems.find(n => n.id === activeTab)?.label}</h2>
          </div>
          <div className="top-bar-right">
            <button className="notification-btn">
              <Icons.Bell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar small">HR</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {renderActiveView()}
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === "success" ? "✅" : "❌"} {notification.message}
        </div>
      )}
    </div>
  );
};

export default HRSocialDashboard;
