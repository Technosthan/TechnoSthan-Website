// SocialForm.jsx - HR Social Dashboard
import React, { useState, useEffect } from "react";
import "./SocialForm.css";
import WhatsAppChat from "./WhatsAppChat";
import logo from "../../assets/logo.png";
import { Helmet } from "react-helmet-async";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const apiUrl = (path) => `${API_BASE}${path}`;

// ========== ICONS (Simple SVG Components) ==========
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  Compose: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  ),
  Templates: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  Schedule: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  ),
  Analytics: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Share: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  ),
  Comment: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </svg>
  ),
  TrendDown: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" />
    </svg>
  ),
};

// ========== PREMIUM PLATFORM ICONS (Official Brand SVGs) ==========
const PlatformIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  Telegram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Pinterest: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  Snapchat: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12.206.793c.99 0 4.347.432 5.932 3.43.529 1.193.403 2.857.11 3.826-.48 1.498-1.365 2.709-2.35 3.54-.493.406-1.026.748-1.16 1.245-.12.45-.066.906.196 1.287.404.593 1.198 1.111 1.88 1.444.682.333 1.423.515 1.767.746.346.231.577.538.577.838 0 .3-.231.607-.577.838-.344.23-1.085.413-1.767.746-.682.333-1.476.851-1.88 1.444-.262.38-.316.836-.196 1.287.134.497.667.84 1.16 1.245.985.831 1.87 2.042 2.35 3.54.293.97.419 2.634-.11 3.826-1.585 2.997-4.942 3.43-5.932 3.43-.99 0-4.347-.432-5.931-3.43-.529-1.193-.404-2.857-.11-3.826.48-1.497 1.365-2.709 2.35-3.539.493-.407 1.026-.748 1.16-1.245.12-.45.066-.906-.196-1.287-.404-.593-1.198-1.111-1.88-1.444-.682-.333-1.423-.514-1.767-.746-.346-.231-.577-.538-.577-.838 0-.3.231-.607.577-.838.344-.23 1.085-.413 1.767-.746.682-.333 1.476-.851 1.88-1.444.262-.38.316-.836.196-1.287-.134-.497-.667-.84-1.16-1.245-.985-.831-1.87-2.042-2.35-3.54-.293-.969-.419-2.634.11-3.826 1.584-2.997 4.941-3.43 5.931-3.43zM9.357 12.612c.752 0 1.36-.608 1.36-1.36 0-.752-.608-1.36-1.36-1.36-.752 0-1.36.608-1.36 1.36 0 .752.608 1.36 1.36 1.36zm5.287 0c.752 0 1.36-.608 1.36-1.36 0-.752-.608-1.36-1.36-1.36-.752 0-1.36.608-1.36 1.36 0 .752.608 1.36 1.36 1.36z" />
    </svg>
  ),
  Reddit: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.76.786 1.76 1.76 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.76 1.76-1.76.463 0 .92.082 1.336.25C7.86 10.04 9.652 10 11.5 10c1.73 0 3.332.08 4.5.232.477-.163.873-.25 1.207-.25.968 0 1.76.786 1.76 1.76 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.76 1.76-1.76.463 0 .92.082 1.336.25C7.86 10.04 9.652 10 11.5 10c1.73 0 3.332.08 4.5.232.477-.163.873-.25 1.207-.25zM8.75 11.5c0-.414.336-.75.75-.75s.75.336.75.75-.336.75-.75.75-.75-.336-.75-.75zm3.75 4.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75z" />
    </svg>
  ),
  Discord: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  Slack: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  ),
  Email: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  ),
  SMS: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
  ),
};

// ========== PLATFORM DATA ==========
const allPlatforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "Facebook",
    color: "#1877F2",
    charLimit: 63206,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "Instagram",
    color: "#E4405F",
    charLimit: 2200,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "LinkedIn",
    color: "#0A66C2",
    charLimit: 3000,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "Twitter",
    color: "#1DA1F2",
    charLimit: 280,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "WhatsApp",
    color: "#25D366",
    charLimit: 65536,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "Telegram",
    color: "#0088CC",
    charLimit: 4096,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "YouTube",
    color: "#FF0000",
    charLimit: 5000,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "Pinterest",
    color: "#BD081C",
    charLimit: 500,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "TikTok",
    color: "#000000",
    charLimit: 2200,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: "Snapchat",
    color: "#FFFC00",
    charLimit: 250,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "Reddit",
    color: "#FF4500",
    charLimit: 40000,
  },
  {
    id: "discord",
    name: "Discord",
    icon: "Discord",
    color: "#5865F2",
    charLimit: 2000,
  },
  {
    id: "slack",
    name: "Slack",
    icon: "Slack",
    color: "#4A154B",
    charLimit: 40000,
  },
  {
    id: "email",
    name: "Email Blast",
    icon: "Email",
    color: "#EA4335",
    charLimit: 100000,
  },
  { id: "sms", name: "SMS", icon: "SMS", color: "#34B7F1", charLimit: 160 },
];

// ========== TEMPLATE CATEGORIES ==========
const templateCategories = [
  { id: "hiring", name: "🧑‍💼 Hiring/Jobs", icon: "💼" },
  { id: "announcement", name: "📢 Announcements", icon: "📢" },
  { id: "event", name: "🎉 Events", icon: "🎉" },
  { id: "promotion", name: "🔥 Promotions", icon: "🔥" },
  { id: "holiday", name: "🎄 Holidays", icon: "🎄" },
  { id: "engagement", name: "💬 Engagement", icon: "💬" },
  { id: "custom", name: "✏️ Custom", icon: "✏️" },
];

// ========== DEFAULT TEMPLATES ==========
const defaultTemplates = [
  {
    id: 1,
    category: "hiring",
    title: "We're Hiring!",
    content:
      "🚀 We're Hiring!\n\nJoin our amazing team as a [Position]!\n\n✅ Competitive salary\n✅ Remote work options\n✅ Growth opportunities\n✅ Great team culture\n\nApply now: [Link]\n\n#Hiring #Jobs #Careers",
    tags: ["hiring", "jobs", "careers"],
  },
  {
    id: 2,
    category: "hiring",
    title: "Tech Position Open",
    content:
      "💻 Looking for talented developers!\n\nWe're expanding our tech team and need:\n• Frontend Developers\n• Backend Engineers\n• Full Stack Developers\n\n🎯 Requirements:\n- 2+ years experience\n- Strong problem-solving skills\n- Team player mindset\n\nDM us or apply at: [Link]\n\n#TechJobs #Developer #Hiring",
    tags: ["tech", "developer", "hiring"],
  },
  {
    id: 3,
    category: "announcement",
    title: "Company Update",
    content:
      "📢 Important Announcement!\n\nWe're excited to share some big news with our community...\n\n[Your announcement here]\n\nThank you for being part of our journey! 🙏\n\n#CompanyNews #Update #Announcement",
    tags: ["announcement", "news", "update"],
  },
  {
    id: 4,
    category: "announcement",
    title: "New Office Launch",
    content:
      "🏢 Exciting News!\n\nWe're thrilled to announce the opening of our new office in [Location]!\n\n📍 Address: [Address]\n📅 Opening Date: [Date]\n\nThis marks a new chapter in our growth journey. Thank you for your continued support!\n\n#NewOffice #Growth #Expansion",
    tags: ["office", "expansion", "growth"],
  },
  {
    id: 5,
    category: "event",
    title: "Webinar Invitation",
    content:
      "🎓 Free Webinar Alert!\n\nTopic: [Webinar Topic]\n📅 Date: [Date]\n⏰ Time: [Time]\n🔗 Register: [Link]\n\nWhat you'll learn:\n✅ [Point 1]\n✅ [Point 2]\n✅ [Point 3]\n\nLimited spots available! Register now! 🚀\n\n#Webinar #FreeEvent #Learning",
    tags: ["webinar", "event", "learning"],
  },
  {
    id: 6,
    category: "event",
    title: "Team Meetup",
    content:
      "🎉 Team Meetup Alert!\n\nJoin us for an amazing team gathering!\n\n📅 Date: [Date]\n📍 Venue: [Location]\n⏰ Time: [Time]\n\nAgenda:\n🍕 Food & Drinks\n🎮 Fun Activities\n🤝 Networking\n\nRSVP by [Date]\n\n#TeamMeetup #CompanyCulture #TeamBuilding",
    tags: ["meetup", "team", "event"],
  },
  {
    id: 7,
    category: "promotion",
    title: "Special Offer",
    content:
      "🔥 LIMITED TIME OFFER! 🔥\n\nGet [Discount]% OFF on all our services!\n\n⏰ Valid until: [Date]\n🎁 Use code: [CODE]\n\nDon't miss out on this amazing deal!\n\n👉 Shop now: [Link]\n\n#Sale #Discount #SpecialOffer",
    tags: ["offer", "discount", "promotion"],
  },
  {
    id: 8,
    category: "holiday",
    title: "Holiday Wishes",
    content:
      "🎄 Season's Greetings! 🎄\n\nWishing you and your loved ones a joyful holiday season filled with happiness and prosperity!\n\nThank you for being part of our journey this year. Here's to an amazing [Year] ahead! 🎉\n\n#HappyHolidays #Seasons Greetings #NewYear",
    tags: ["holiday", "greetings", "celebration"],
  },
  {
    id: 9,
    category: "engagement",
    title: "Poll/Question",
    content:
      "🤔 Quick Question!\n\nWe'd love to hear from you:\n\n[Your Question Here]\n\n👇 Drop your thoughts in the comments!\n\n#Community #YourOpinionMatters #Engagement",
    tags: ["poll", "question", "engagement"],
  },
  {
    id: 10,
    category: "engagement",
    title: "Milestone Celebration",
    content:
      "🎉 MILESTONE ACHIEVED! 🎉\n\nWe just hit [Number] [followers/customers/users]!\n\nThank you to each and every one of you for being part of our journey. This wouldn't be possible without your support! 🙏\n\nHere's to many more milestones together! 🚀\n\n#Milestone #ThankYou #Community",
    tags: ["milestone", "celebration", "thankyou"],
  },
];

// ========== EMOJI PICKER DATA ==========
const emojiCategories = {
  "😀 Smileys": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "🤔",
    "🤗",
  ],
  "👍 Gestures": [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤝",
    "👏",
    "🙌",
    "💪",
    "🙏",
    "✋",
    "👋",
    "🤚",
    "🖐️",
    "👐",
    "🤲",
    "👊",
    "✊",
    "🤛",
    "🤜",
  ],
  "❤️ Hearts": [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💝",
    "💘",
    "💟",
    "❣️",
    "💔",
    "🩷",
    "🩵",
  ],
  "🎉 Celebration": [
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎄",
    "🎃",
    "🎆",
    "🎇",
    "✨",
    "🌟",
    "⭐",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "🏅",
    "🎖️",
    "🎗️",
    "🏵️",
    "🎀",
  ],
  "💼 Work": [
    "💼",
    "📧",
    "📱",
    "💻",
    "🖥️",
    "📊",
    "📈",
    "📉",
    "📋",
    "📝",
    "✏️",
    "📌",
    "📍",
    "🗂️",
    "📁",
    "📂",
    "🗄️",
    "📎",
    "🔗",
    "📤",
  ],
  "🚀 Objects": [
    "🚀",
    "💡",
    "🔥",
    "⚡",
    "🌈",
    "☀️",
    "🌙",
    "⭐",
    "🌟",
    "✅",
    "❌",
    "⚠️",
    "ℹ️",
    "❓",
    "❗",
    "💯",
    "🔔",
    "📢",
    "🎯",
    "🎪",
  ],
};

// ========== COMPANY CONFIGURATION (Default HR Company Settings) ==========
const defaultCompanyConfig = {
  companyName: "Technosthan",
  tagline: "Innovating Tomorrow",
  phone: "9477288288",
  email: "info@technosthan.com",
  website: "https://technosthan.com",
  address: "India",
  socialLinks: {
    facebook: "https://facebook.com/technosthan",
    instagram: "https://instagram.com/technosthan7",
    linkedin: "https://linkedin.com/company/technosthan",
    twitter: "https://twitter.com/technosthan",
    youtube: "https://youtube.com/technosthan",
  },
  platformBenchmarks: {
    whatsapp: { followers: 0, engagement: 0 },
    facebook: { followers: 0, engagement: 0 },
    instagram: { followers: 0, engagement: 0 },
    linkedin: { followers: 0, engagement: 0 },
    twitter: { followers: 0, engagement: 0 },
    youtube: { followers: 0, engagement: 0 },
    telegram: { followers: 0, engagement: 0 },
    pinterest: { followers: 0, engagement: 0 },
    tiktok: { followers: 0, engagement: 0 },
  },
};

// ========== HR PROFILES DATA ==========
const defaultHRProfiles = [];

const defaultCurrentHR = {
  id: "guest",
  name: "HR Account",
  role: "Sign in to continue",
  email: "",
  phone: "",
  avatar: "H",
  color: "#6366f1",
  avatarUrl: "",
};

const dispatchPlatformOptions = [
  { id: "linkedin", name: "LinkedIn" },
  { id: "facebook", name: "Facebook" },
  { id: "telegram", name: "Telegram" },
  { id: "twitter", name: "Twitter/X" },
  // { id: "youtube", name: "YouTube" },
  // { id: "pinterest", name: "Pinterest" },
  // { id: "tiktok", name: "TikTok" },
  // { id: "snapchat", name: "Snapchat" },
  // { id: "reddit", name: "Reddit" },
  // { id: "discord", name: "Discord" },
  // { id: "slack", name: "Slack" },
  { id: "email", name: "Email Blast" },
  { id: "sms", name: "SMS" },
  { id: "whatsapp", name: "WhatsApp" }, // WhatsApp is the core platform, always enabled for dispatch
];

const toAvatarLabel = (name = "") =>
  String(name).trim().charAt(0).toUpperCase() || "H";

const resolveAvatarUrl = (value = "") => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  if (
    rawValue.startsWith("http://") ||
    rawValue.startsWith("https://") ||
    rawValue.startsWith("data:")
  ) {
    return rawValue;
  }
  return `${API_BASE}${rawValue.startsWith("/") ? rawValue : `/${rawValue}`}`;
};

const renderHRAvatarContent = (profile) => {
  const avatarUrl = resolveAvatarUrl(profile?.avatarUrl);
  if (avatarUrl) {
    return (
      <span
        className="profile-avatar-image"
        style={{ backgroundImage: `url("${avatarUrl}")` }}
        aria-hidden="true"
      />
    );
  }

  return profile?.avatar || toAvatarLabel(profile?.name);
};

// ========== MAIN COMPONENT ==========
const SocialForm = () => {
  const CONTACTS_STORAGE_KEY = "hr_social_whatsapp_contacts";
  // Navigation state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // PLATFORM ANALYTICS
  const [platformAnalytics, setPlatformAnalytics] = useState({
    facebook: 0,
    instagram: 0,
    linkedin: 0,
    twitter: 0,
    whatsapp: 0,
    telegram: 0,
    youtube: 0,
    pinterest: 0,
    tiktok: 0,
    snapchat: 0,
    reddit: 0,
    discord: 0,
    slack: 0,
    email: 0,
    sms: 0,
  });

  // HR Profile Management
  const [hrProfiles, setHRProfiles] = useState([]);
  const [currentHR, setCurrentHR] = useState(defaultCurrentHR);
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [showHRProfileModal, setShowHRProfileModal] = useState(false);
  const [editingHRProfile, setEditingHRProfile] = useState(null);
  const [profileModalTab, setProfileModalTab] = useState("signin");
  const [profileLoginEmail, setProfileLoginEmail] = useState("");

  // Company Configuration State
  const [companyConfig, setCompanyConfig] = useState(defaultCompanyConfig);
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  // Message composition state - Popular 5 platforms enabled by default for HR
  const [platformOptions, setPlatformOptions] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["whatsapp"]);
  const [dispatchPlatforms, setDispatchPlatforms] = useState([
    "linkedin",
    "facebook",
    "telegram",
    "whatsapp",
  ]);
  const [platformConnections, setPlatformConnections] = useState({
    linkedin: false,
    facebook: false,
    telegram: false,
    whatsapp: false,
  });
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformId, setNewPlatformId] = useState("");
  const [newPlatformColor, setNewPlatformColor] = useState("#1DA1F2");
  const [newPlatformIcon, setNewPlatformIcon] = useState("Link");

  const resolveHRScopeUserId = () => {
    if (authenticatedUser?.id) return String(authenticatedUser.id);
    if (authenticatedUser?.email) return String(authenticatedUser.email);
    return String(currentHR?.email || "anonymous");
  };

  const withAvatarMeta = (profile) => ({
    ...profile,
    avatar: toAvatarLabel(profile?.name),
    avatarUrl: resolveAvatarUrl(profile?.avatarUrl),
  });

  const addPlatformOption = async () => {
    const name = String(newPlatformName).trim();
    const id = String(newPlatformId || name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    if (!name) {
      showNotification("Platform name is required", "error");
      return;
    }

    if (!id) {
      showNotification("Platform ID is required", "error");
      return;
    }

    if (platformOptions.some((platform) => platform.id === id)) {
      showNotification("This platform already exists", "error");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/social/platforms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name,
          icon: newPlatformIcon || "Link",
          color: newPlatformColor || "#1DA1F2",
          charLimit: 5000,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.msg || "Unable to add platform");
      }

      const created = await response.json();
      setPlatformOptions((prev) => [...prev, created]);
      setNewPlatformName("");
      setNewPlatformId("");
      setNewPlatformColor("#1DA1F2");
      setNewPlatformIcon("Link");
      showNotification(`${name} added`, "success");
    } catch (err) {
      showNotification(err.message || "Failed to add platform", "error");
    }
  };

  const removePlatformOption = async (platform) => {
    const platformMongoId = platform?._id;
    const platformId = platform?.id;

    setPlatformOptions((prev) =>
      prev.filter((item) => item._id !== platformMongoId),
    );
    setSelectedPlatforms((prev) => prev.filter((id) => id !== platformId));

    try {
      const response = await fetch(apiUrl(`/api/social/${platformMongoId}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete API failed");
      }

      showNotification("Platform removed", "success");
    } catch {
      setPlatformOptions((prev) => [...prev, platform]);
      showNotification("Could not delete platform. Restored in UI.", "error");
    }
  };
  const [sendingType, setSendingType] = useState(null);
  const [settingsNotifications, setSettingsNotifications] = useState({
    emailScheduled: true,
    pushEngagement: true,
    weeklyReport: false,
  });
  // FIX: Add message state
  const [message, setMessage] = useState("");

  // Image & Link state
  const [attachedImage, setAttachedImage] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const [contacts, setContacts] = useState(() => {
    const fallbackContacts = [
      { name: "vikas", number: "9507562013" },
      { name: "kartik", number: "9001060923" },
    ];

    try {
      const saved = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (!saved) return fallbackContacts;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : fallbackContacts;
    } catch {
      return fallbackContacts;
    }
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [socialDataId, setSocialDataId] = useState(null);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const openWhatsAppComposer = () => {
    if (!message.trim()) {
      showNotification("Please write message first", "error");
      return;
    }
    const text = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent,
    );
    const url = isMobile
      ? `https://api.whatsapp.com/send?text=${text}`
      : `https://web.whatsapp.com/send?text=${text}`;
    window.open(url, "_blank");
  };

  const openWhatsAppForContacts = (contacts, textMessage) => {
    const uniqueNumbers = [
      ...new Set(
        contacts
          .map((contact) => normalizePhoneNumber(contact.number))
          .filter(Boolean),
      ),
    ];

    let openedCount = 0;
    uniqueNumbers.forEach((number) => {
      const chatUrl = `https://wa.me/${number}?text=${encodeURIComponent(textMessage)}`;
      const win = window.open(chatUrl, "_blank");
      if (win) openedCount += 1;
    });

    return {
      total: uniqueNumbers.length,
      opened: openedCount,
    };
  };

  const copyMessageToClipboard = async (textValue) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textValue);
        return true;
      }
    } catch {
      // Fallback below
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = textValue;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  };

  const handleCopyMessage = async (platformName = "platform") => {
    if (!message.trim()) {
      showNotification("Please write message first", "error");
      return;
    }

    const copied = await copyMessageToClipboard(message);
    if (copied) {
      showNotification(
        `Message copied for ${platformName}. Paste and publish.`,
        "success",
      );
    } else {
      showNotification(
        "Could not copy automatically. Please copy manually.",
        "error",
      );
    }
  };

  const shareToPlatform = async (platform) => {
    if (!message.trim()) {
      showNotification("Please write message first", "error");
      return;
    }

    const text = encodeURIComponent(message);
    const website = companyConfig.website?.trim() || "https://technosthan.com";
    const normalizedWebsite = /^https?:\/\//i.test(website)
      ? website
      : `https://${website}`;
    const url = encodeURIComponent(normalizedWebsite);
    const phone = companyConfig.phone;

    const openAndCopyHint = async (targetUrl, hintMessage) => {
      window.open(targetUrl, "_blank");
      const copied = await copyMessageToClipboard(message);
      if (copied) {
        showNotification(
          hintMessage || "Message copied. Paste it on platform and publish.",
          "info",
        );
      } else {
        showNotification(
          "Platform opened. Please copy and paste your message manually.",
          "info",
        );
      }
    };

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: null,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      instagram:
        companyConfig.socialLinks.instagram || "https://www.instagram.com/",
      youtube: companyConfig.socialLinks.youtube || "https://www.youtube.com/",
      reddit: `https://www.reddit.com/submit?title=${text}&url=${url}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      email: `mailto:${companyConfig.email}?subject=${encodeURIComponent(companyConfig.companyName)}&body=${text}`,
      sms: `sms:${phone}?body=${text}`,
    };

    if (platform === "whatsapp") {
      openWhatsAppComposer();
      showNotification(
        "WhatsApp opened. Select contact and send from your logged-in account.",
      );
      return;
    }

    if (platform === "facebook") {
      await openAndCopyHint(
        shareLinks.facebook,
        "Facebook opened. Message copied, paste it in your post.",
      );
      return;
    }

    if (platform === "linkedin") {
      await openAndCopyHint(
        shareLinks.linkedin,
        "LinkedIn opened. Message copied, paste it in your post.",
      );
      return;
    }

    if (platform === "instagram" || platform === "youtube") {
      await openAndCopyHint(
        shareLinks[platform],
        `${platform} opened. Message copied, paste it in your caption/post.`,
      );
      return;
    }

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], "_blank");
      showNotification(`${platform} share window opened.`, "success");
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
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    content: "",
    category: "custom",
    tags: [],
  });

  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchHistory, setSearchHistory] = useState("");

  // Analytics data - Real data from backend
  const [analyticsData, setAnalyticsData] = useState({
    totalPosts: 0,
    totalEngagement: 0,
    avgEngagement: 0,
    topPlatform: "WhatsApp",
    weeklyGrowth: 0,
    monthlyPosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    platformStats: [],
  });

  // Real post history from backend
  const [postHistory, setPostHistory] = useState([

  {
    platform: "Facebook",
    platformIcon: "Facebook",
    platformColor: "#1877F2",

    author: "Techno Sthan",

    status: "sent",

    message:
      "Our new agritech automation platform is now live 🚀",

    date: "21 May 2026",

    time: "7:25 PM",
  },

  {
    platform: "Instagram",
    platformIcon: "Instagram",
    platformColor: "#E4405F",

    author: "HR Team",

    status: "sent",

    message:
      "New hiring campaign started for developers.",

    date: "21 May 2026",

    time: "6:40 PM",
  },

]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ========== HELPER FUNCTIONS ==========
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const handleStorage = () => {
      try {
        setAuthenticatedUser(
          JSON.parse(localStorage.getItem("user") || "null"),
        );
      } catch {
        setAuthenticatedUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const fetchPlatformOptions = async () => {
      try {
        const response = await fetch(apiUrl("/api/social/platforms"));
        if (!response.ok) {
          throw new Error("Platform API unavailable");
        }

        const payload = await response.json();
        if (Array.isArray(payload) && payload.length > 0) {
          setPlatformOptions(payload);
          return;
        }

        setPlatformOptions(
          allPlatforms.map((platform) => ({ ...platform, _id: platform.id })),
        );
      } catch {
        setPlatformOptions(
          allPlatforms.map((platform) => ({ ...platform, _id: platform.id })),
        );
      }
    };

    fetchPlatformOptions();
  }, []);

  useEffect(() => {
    const loadHRProfiles = async () => {
      const userId = encodeURIComponent(resolveHRScopeUserId());

      try {
        const response = await fetch(apiUrl(`/api/hr?userId=${userId}`));
        if (!response.ok) {
          throw new Error("Unable to fetch HR profiles");
        }

        const records = await response.json();
        const mapped = Array.isArray(records)
          ? records.map(withAvatarMeta)
          : [];

        if (mapped.length > 0) {
          setHRProfiles(mapped);

          const selectedId = localStorage.getItem("hr_current_profile_id");
          const selectedProfile = mapped.find(
            (profile) => profile._id === selectedId,
          );
          setCurrentHR(selectedProfile || mapped[0]);
          return;
        }

        setHRProfiles([]);
        setCurrentHR(defaultCurrentHR);
      } catch {
        setHRProfiles([]);
        setCurrentHR(defaultCurrentHR);
      }
    };

    loadHRProfiles();
  }, [authenticatedUser]);

  useEffect(() => {
    if (currentHR?._id) {
      localStorage.setItem("hr_current_profile_id", currentHR._id);
    }
  }, [currentHR]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // Ignore storage failures silently (private mode/quota)
    }
  }, [contacts]);

  useEffect(() => {
    const bootstrapContactsFromBackend = async () => {
      try {
        const listRes = await fetch(apiUrl("/api/social"));
        if (!listRes.ok) return;

        const list = await listRes.json();
        let latestRecord =
          Array.isArray(list) && list.length > 0 ? list[0] : null;

        if (!latestRecord) {
          const createRes = await fetch(apiUrl("/api/social"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ socials: { whatsapp_contacts: contacts } }),
          });

          if (createRes.ok) {
            const created = await createRes.json();
            latestRecord = created?.data || null;
          }
        }

        if (!latestRecord?._id) return;
        setSocialDataId(latestRecord._id);

        const contactsRes = await fetch(
          apiUrl(`/api/social/contacts/${latestRecord._id}`),
        );
        if (!contactsRes.ok) return;

        const contacts = await contactsRes.json();
        if (Array.isArray(contacts) && contacts.length > 0) {
          setContacts(
            contacts.map((contact) => ({
              name: contact.name,
              number: String(contact.number),
            })),
          );
        }
      } catch {
        // Keep local fallback contacts if backend is unavailable
      }
    };

    bootstrapContactsFromBackend();
  }, []);

  const fetchConnections = async () => {
    try {
      const userId = encodeURIComponent(currentHR?.email || "anonymous");

      const response = await fetch(
        apiUrl(`/api/social/connections?userId=${userId}`),
      );

      if (!response.ok) {
        console.warn("Connection API unavailable");
        return;
      }

      const payload = await response.json();
      const source = payload?.connections || {};

      setPlatformConnections({
        linkedin: source?.linkedin?.connected ?? false,
        facebook: source?.facebook?.connected ?? false,
        telegram: source?.telegram?.connected ?? false,
        whatsapp: source?.whatsapp?.connected ?? false,
      });
    } catch (err) {
      console.error("Connection fetch error:", err);
      setPlatformConnections({
        linkedin: false,
        facebook: false,
        telegram: false,
        whatsapp: false,
      });
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [currentHR]);

  // ========== ANALYTICS DATA FETCHING ==========
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      // Read posts and contact registry from backend.
      const [postsRes, socialRes] = await Promise.all([
        fetch(
          apiUrl(
            `/api/posts?userId=${encodeURIComponent(resolveHRScopeUserId())}`,
          ),
        ),
        fetch(apiUrl("/api/social")),
      ]);

      if (!postsRes.ok || !socialRes.ok) {
        throw new Error("Failed to fetch analytics sources");
      }

      const postsData = await postsRes.json();
      const socialData = await socialRes.json();

      const posts = Array.isArray(postsData)
        ? postsData
        : Array.isArray(postsData?.data)
          ? postsData.data
          : [];
      const socialRecords = Array.isArray(socialData)
        ? socialData
        : Array.isArray(socialData?.data)
          ? socialData.data
          : [];

      const totalPosts = posts.length;

      const uniqueContactNumbers = new Set();
      socialRecords.forEach((record) => {
        const contacts = record?.socials?.whatsapp_contacts || [];
        contacts.forEach((contact) => {
          const normalized = String(contact?.number || "").replace(/\D/g, "");
          if (normalized) uniqueContactNumbers.add(normalized);
        });
      });

      const whatsappFollowers = uniqueContactNumbers.size;

      // Calculate weekly growth (compare last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

      const lastWeekPosts = posts.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= sevenDaysAgo;
      }).length;

      const prevWeekPosts = posts.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= fourteenDaysAgo && created < sevenDaysAgo;
      }).length;

      const weeklyGrowth =
        prevWeekPosts > 0
          ? Math.round(((lastWeekPosts - prevWeekPosts) / prevWeekPosts) * 100)
          : lastWeekPosts > 0
            ? 100
            : 0;

      // Monthly posts distribution (calendar year: Jan-Dec)
      const monthlyPosts = Array(12).fill(0);
      const currentYear = now.getFullYear();

      posts.forEach((post) => {
        const created = new Date(post.createdAt);
        const postMonth = created.getMonth(); // 0=Jan, 3=Apr, 11=Dec
        const postYear = created.getFullYear();

        // Count posts from current year only (Jan-Dec 2026)
        // Posts from other years won't be counted
        if (postYear === currentYear) {
          monthlyPosts[postMonth]++;
        }
      });

      // Platform stats from actual stored post platforms.
      const platformPostCounts = {};
      posts.forEach((post) => {
        const platforms = Array.isArray(post.platforms) ? post.platforms : [];
        platforms.forEach((platformId) => {
          const key = String(platformId || "").toLowerCase();
          if (!key) return;
          platformPostCounts[key] = (platformPostCounts[key] || 0) + 1;
        });
      });

      const platformAggregates = {};

      posts.forEach((post) => {
        const metrics = Array.isArray(post.platformMetrics)
          ? post.platformMetrics
          : [];

        metrics.forEach((metric) => {
          const key = String(metric?.platform || "").toLowerCase();
          if (!key) return;

          if (!platformAggregates[key]) {
            platformAggregates[key] = {
              followers: 0,
              engagement: 0,
              snapshotCount: 0,
            };
          }

          platformAggregates[key].followers += Number(metric.followers) || 0;
          platformAggregates[key].engagement += Number(metric.engagement) || 0;
          platformAggregates[key].snapshotCount += 1;
        });
      });

      const platformStats = Object.entries(platformPostCounts).map(
        ([platformId, postsCount]) => {
          const platformInfo = allPlatforms.find((p) => p.id === platformId);
          const aggregate = platformAggregates[platformId];

          // Prefer backend-saved metrics; fallback for legacy posts without platformMetrics.
          const followers = aggregate
            ? Math.round(
                aggregate.followers / Math.max(aggregate.snapshotCount, 1),
              )
            : platformId === "whatsapp"
              ? whatsappFollowers
              : 0;

          const engagement = aggregate ? aggregate.engagement : 0;

          return {
            platform: platformInfo?.name || platformId,
            posts: postsCount,
            engagement,
            followers,
          };
        },
      );

      // Find top platform
      const topPlatform =
        platformStats.length > 0
          ? platformStats.reduce(
              (max, p) => (p.posts > max.posts ? p : max),
              platformStats[0],
            ).platform
          : "WhatsApp";

      const totalEngagement = platformStats.reduce(
        (sum, stat) => sum + stat.engagement,
        0,
      );

      setAnalyticsData({
        totalPosts,
        totalEngagement,
        avgEngagement:
          totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0,
        topPlatform,
        weeklyGrowth,
        monthlyPosts,
        platformStats,
      });

      // Set post history from real posts collection, newest first.
      const history = posts
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((post, index) => ({
          id: post._id || index + 1,
          message: post.message || "Social media post",
          platforms: Array.isArray(post.platforms)
            ? post.platforms
            : ["whatsapp"],
          sentAt: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : new Date().toLocaleString(),
          status: post.status || "sent",
          engagement: {
            likes: Array.isArray(post.platformMetrics)
              ? post.platformMetrics.reduce(
                  (sum, metric) => sum + (Number(metric.engagement) || 0),
                  0,
                )
              : 0,
            comments: 0,
            shares: 0,
          },
        }));

      setPostHistory(history);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      // Keep default values on error
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Load saved platform analytics from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("platformAnalytics");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setPlatformAnalytics((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore invalid storage data
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "platformAnalytics",
        JSON.stringify(platformAnalytics),
      );
    } catch {
      // ignore storage write failures
    }
  }, [platformAnalytics]);

  const addPlatformAnalyticsCounts = (platformIds = []) => {
    if (!Array.isArray(platformIds)) return;
    setPlatformAnalytics((prev) => {
      const next = { ...prev };
      platformIds.forEach((platformId) => {
        const key = String(platformId || "").toLowerCase();
        if (key in next) {
          next[key] = (next[key] || 0) + 1;
        }
      });
      return next;
    });
  };

  const normalizePhoneNumber = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0"))
      return `91${digits.slice(1)}`;
    return digits;
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return null;
    const platform = allPlatforms.find((p) => p.id === selectedPlatforms[0]);
    return platform ? platform.charLimit : null;
  };

  const getUniqueWhatsappFollowers = () => {
    const unique = new Set(
      contacts
        .map((contact) => normalizePhoneNumber(contact.number))
        .filter(Boolean),
    );
    return unique.size;
  };

  const buildPlatformMetricsSnapshot = () => {
    const whatsappFollowers = getUniqueWhatsappFollowers();

    return selectedPlatforms.map((platformId) => {
      const base = companyConfig.platformBenchmarks?.[platformId] || {
        followers: 0,
        engagement: 0,
      };

      if (platformId === "whatsapp") {
        const recipientsCount =
          selectedContacts.length > 0
            ? selectedContacts.length
            : whatsappFollowers;

        return {
          platform: platformId,
          followers: whatsappFollowers,
          engagement: recipientsCount,
        };
      }

      return {
        platform: platformId,
        followers: Number(base.followers) || 0,
        engagement: Number(base.engagement) || 0,
      };
    });
  };

  const characterLimit = getCharacterLimit();
  const characterCount = message.length;
  const isOverLimit = characterLimit && characterCount > characterLimit;

  // ========== EVENT HANDLERS ==========
  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev[0] === platformId ? [] : [platformId],
    );
  };

  const toggleDispatchPlatform = (platformId) => {
    setDispatchPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  const toggleAllDispatchPlatforms = () => {
    setDispatchPlatforms((prev) =>
      prev.length === dispatchPlatformOptions.length
        ? []
        : dispatchPlatformOptions.map((platform) => platform.id),
    );
  };

  const handleConnectAccount = async (platformId) => {
    try {
      setConnectingPlatform(platformId);

      let accessToken = "";
      if (platformId === "telegram") {
        const botToken = String(
          window.prompt("Enter Telegram bot token", "") || "",
        ).trim();
        const chatId = String(
          window.prompt("Enter Telegram chat id", "") || "",
        ).trim();

        if (!botToken || !chatId) {
          showNotification(
            "Telegram bot token and chat id are required",
            "error",
          );
          return;
        }

        accessToken = JSON.stringify({ botToken, chatId });
      } else {
        accessToken = String(
          window.prompt(`Enter ${platformId} access token`, "") || "",
        ).trim();

        if (!accessToken) {
          showNotification(
            `${platformId} token is required to connect`,
            "error",
          );
          return;
        }
      }

      const response = await fetch(apiUrl("/api/social/connections"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentHR?.email || "anonymous",
          platform: platformId,
          accessToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showNotification(
          payload?.msg || `Could not connect ${platformId}`,
          "error",
        );
        return;
      }

      await fetchConnections();
      const isConnected = Boolean(payload?.connection?.connected);
      showNotification(
        isConnected
          ? `${platformId} connected successfully`
          : `${platformId} connection could not be verified. Please check credentials/config.`,
        isConnected ? "success" : "info",
      );
    } catch {
      showNotification(`Failed to connect ${platformId}`, "error");
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnectAccount = async (platformId) => {
    try {
      setConnectingPlatform(platformId);
      const response = await fetch(apiUrl("/api/social/connections"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentHR?.email || "anonymous",
          platform: platformId,
          accessToken: "",
          forceDisconnect: true,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showNotification(
          payload?.msg || `Could not disconnect ${platformId}`,
          "error",
        );
        return;
      }

      await fetchConnections();
      showNotification(`${platformId} disconnected`, "info");
    } catch {
      showNotification(`Failed to disconnect ${platformId}`, "error");
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleSocialApiSend = async (type) => {
    if (!message.trim()) {
      showNotification("Please enter a message", "error");
      return;
    }

    if (dispatchPlatforms.length === 0) {
      showNotification("Please select at least one platform", "error");
      return;
    }

    try {
      setSendingType(type);

      const response = await fetch(apiUrl("/api/social/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentHR?.email || "anonymous",
          message,
          platforms: dispatchPlatforms,
          type,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        showNotification(payload?.msg || "Failed to send via API", "error");
        return;
      }

      const resultStatus = payload?.status || "failed";
      if (resultStatus === "success") {
        addPlatformAnalyticsCounts(dispatchPlatforms);
        showNotification(
          `Sent successfully to ${dispatchPlatforms.length} platform(s)`,
          "success",
        );
      } else if (resultStatus === "partial") {
        addPlatformAnalyticsCounts(dispatchPlatforms);
        const firstFailure = payload?.results?.find(
          (item) => !item.success,
        )?.detail;
        showNotification(
          firstFailure || "Partially sent. Check connection/status details.",
          "info",
        );
      } else {
        const firstFailure = payload?.results?.find(
          (item) => !item.success,
        )?.detail;
        showNotification(
          firstFailure || "Send failed for selected platforms",
          "error",
        );
      }
    } catch {
      showNotification("Server error while sending", "error");
    } finally {
      setSendingType(null);
    }
  };

  const clearSelectedPlatform = () => {
    setSelectedPlatforms([]);
  };

  const insertEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
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
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...newTemplate } : t,
        ),
      );
      showNotification("Template updated successfully!");
    } else {
      const newId = Math.max(...templates.map((t) => t.id)) + 1;
      setTemplates((prev) => [...prev, { ...newTemplate, id: newId }]);
      showNotification("Template created successfully!");
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
    setNewTemplate({ title: "", content: "", category: "custom", tags: [] });
  };

  const deleteTemplate = (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      showNotification("Template deleted!");
    }
  };

  // Toggle contact selection
  const toggleContact = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.number === contact.number)
        ? prev.filter((c) => c.number !== contact.number)
        : [...prev, contact],
    );
  };

  const toggleAllContacts = () => {
    const allFilteredSelected =
      filteredContacts.length > 0 &&
      filteredContacts.every((contact) =>
        selectedContacts.some((selected) => selected.number === contact.number),
      );

    if (allFilteredSelected) {
      setSelectedContacts((prev) =>
        prev.filter(
          (selected) =>
            !filteredContacts.some(
              (contact) => contact.number === selected.number,
            ),
        ),
      );
      return;
    }

    setSelectedContacts((prev) => {
      const merged = [...prev];
      filteredContacts.forEach((contact) => {
        if (!merged.some((selected) => selected.number === contact.number)) {
          merged.push(contact);
        }
      });
      return merged;
    });
  };

  // Add new contact
  const [newContactName, setNewContactName] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");

  const addContact = async () => {
    if (!newContactName.trim() || !newContactNumber.trim()) {
      showNotification("Please enter name and number", "error");
      return;
    }
    const normalizedNumber = normalizePhoneNumber(newContactNumber);
    if (normalizedNumber.length < 10) {
      showNotification("Please enter a valid number", "error");
      return;
    }
    const duplicateExists = contacts.some(
      (contact) => normalizePhoneNumber(contact.number) === normalizedNumber,
    );
    if (duplicateExists) {
      showNotification("This number is already saved", "error");
      return;
    }

    if (socialDataId) {
      try {
        const res = await fetch(apiUrl("/api/social/add-contact"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            socialId: socialDataId,
            contact: {
              name: newContactName.trim(),
              phone: normalizedNumber,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showNotification(
            err?.msg || "Could not save contact to server",
            "error",
          );
          return;
        }

        const payload = await res.json();
        const serverContacts = payload?.data?.socials?.whatsapp_contacts || [];
        setContacts(
          serverContacts.map((contact) => ({
            name: contact.name,
            number: String(contact.number),
          })),
        );
      } catch {
        setContacts([
          ...contacts,
          { name: newContactName.trim(), number: normalizedNumber },
        ]);
      }
    } else {
      setContacts([
        ...contacts,
        { name: newContactName.trim(), number: normalizedNumber },
      ]);
    }

    setNewContactName("");
    setNewContactNumber("");
    showNotification("Contact added! ✅");
  };

  // ========== IMAGE UPLOAD HANDLER ==========
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
        showNotification("Image attached! 📷");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    showNotification("Image removed");
  };

  // ========== LINK HANDLER ==========
  const addLink = () => {
    if (!linkInput.trim()) {
      showNotification("Please enter a link", "error");
      return;
    }
    let formattedLink = linkInput.trim();
    if (
      !formattedLink.startsWith("http://") &&
      !formattedLink.startsWith("https://")
    ) {
      formattedLink = "https://" + formattedLink;
    }
    setMessage((prev) => prev + (prev ? "\n" : "") + formattedLink);
    setLinkInput("");
    setShowLinkInput(false);
    showNotification("Link added! 🔗");
  };

  // ========== HR PROFILE HANDLERS ==========
  const [newHRProfile, setNewHRProfile] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    avatarUrl: "",
    color: "#6366f1",
  });

  const openHRProfileModal = (initialTab = "signin") => {
    setProfileModalTab(initialTab);
    setEditingHRProfile(null);
    setProfileLoginEmail("");
    setShowHRProfileModal(true);
  };

  const addHRProfile = async () => {
    if (!newHRProfile.name || !newHRProfile.role || !newHRProfile.email) {
      showNotification("Please fill required fields", "error");
      return;
    }
    const existing = hrProfiles.some(
      (profile) =>
        profile.email.toLowerCase() === newHRProfile.email.toLowerCase(),
    );
    if (existing) {
      showNotification("Profile with this email already exists", "error");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/hr"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newHRProfile,
          userId: resolveHRScopeUserId(),
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.msg || "Could not create profile");
      }

      const created = withAvatarMeta(await response.json());
      setHRProfiles((prev) => [...prev, created]);
      setCurrentHR(created);
      setNewHRProfile({
        name: "",
        role: "",
        email: "",
        phone: "",
        avatarUrl: "",
        color: "#6366f1",
      });
      showNotification("HR Profile added", "success");
    } catch (err) {
      showNotification(err.message || "Could not create profile", "error");
    }
  };

  const deleteHRProfile = async (profileId) => {
    if (hrProfiles.length <= 1) {
      showNotification("Cannot delete the last profile", "error");
      return;
    }
    if (window.confirm("Delete this HR profile?")) {
      const previous = hrProfiles;
      const updatedProfiles = hrProfiles.filter(
        (profile) => profile._id !== profileId,
      );
      setHRProfiles(updatedProfiles);
      if (currentHR._id === profileId && updatedProfiles.length > 0) {
        setCurrentHR(updatedProfiles[0]);
      }

      try {
        const response = await fetch(
          apiUrl(
            `/api/hr/${profileId}?userId=${encodeURIComponent(resolveHRScopeUserId())}`,
          ),
          {
            method: "DELETE",
          },
        );
        if (!response.ok) throw new Error("Delete failed");
        showNotification("Profile deleted", "success");
      } catch {
        setHRProfiles(previous);
        showNotification("Could not delete profile", "error");
      }
    }
  };

  const switchHRProfile = (profile) => {
    setCurrentHR(profile);
    showNotification(`Switched to ${profile.name}`);
  };

  const signInHRProfile = () => {
    const email = profileLoginEmail.trim().toLowerCase();
    if (!email) {
      showNotification("Enter profile email to sign in", "error");
      return;
    }

    const profile = hrProfiles.find(
      (item) => item.email.toLowerCase() === email,
    );
    if (!profile) {
      showNotification("No HR account found. Please sign up first.", "error");
      setProfileModalTab("signup");
      return;
    }

    setCurrentHR(profile);
    setShowHRProfileModal(false);
    showNotification(`Signed in as ${profile.name}`);
  };

  const startEditCurrentProfile = () => {
    setEditingHRProfile({ ...currentHR });
  };

  const saveCurrentProfile = async () => {
    if (
      !editingHRProfile?.name ||
      !editingHRProfile?.role ||
      !editingHRProfile?.email
    ) {
      showNotification("Name, role and email are required", "error");
      return;
    }

    const duplicateEmail = hrProfiles.some(
      (profile) =>
        profile._id !== editingHRProfile._id &&
        profile.email.toLowerCase() === editingHRProfile.email.toLowerCase(),
    );

    if (duplicateEmail) {
      showNotification("Another profile already uses this email", "error");
      return;
    }

    try {
      let response;

      // If this editing object has an _id, update. Otherwise create new profile.
      if (editingHRProfile._id) {
        response = await fetch(apiUrl(`/api/hr/${editingHRProfile._id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingHRProfile,
            userId: resolveHRScopeUserId(),
          }),
        });
      } else {
        response = await fetch(apiUrl(`/api/hr`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingHRProfile,
            userId: resolveHRScopeUserId(),
          }),
        });
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.msg || "Could not save profile");
      }

      const saved = withAvatarMeta(await response.json());

      // Upsert into profiles list
      setHRProfiles((prev) => {
        const exists = prev.some((p) => p._id === saved._id);
        if (exists) return prev.map((p) => (p._id === saved._id ? saved : p));
        return [...prev, saved];
      });

      setCurrentHR(saved);
      setEditingHRProfile(null);
      showNotification("Profile saved successfully", "success");
    } catch (err) {
      showNotification(err.message || "Could not save profile", "error");
    }
  };

  const handleHRAvatarUpload = (event, mode = "new") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification("Profile image should be under 2MB", "error");
      return;
    }

    // Client-side resize/crop to square and convert to JPEG for consistent avatar
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
      img.onload = async () => {
        try {
          // Crop to square centered and resize to 512px
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          const target = 512;
          const canvas = document.createElement("canvas");
          canvas.width = target;
          canvas.height = target;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);

          // Convert to JPEG with 0.85 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

          const response = await fetch(apiUrl("/api/hr/upload-avatar"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody?.msg || "Could not upload image");
          }

          const uploaded = await response.json();
          if (mode === "edit") {
            // Capture the current profile ID before async operations
            const profileId = editingHRProfile?._id;
            setEditingHRProfile((prev) => ({
              ...prev,
              avatarUrl: uploaded.url,
            }));

            // If editing and profile exists, auto-save avatar change
            if (profileId) {
              try {
                console.log(`📸 Auto-saving avatar for profile: ${profileId}`);
                const updateRes = await fetch(apiUrl(`/api/hr/${profileId}`), {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...editingHRProfile,
                    avatarUrl: uploaded.url,
                    userId: resolveHRScopeUserId(),
                  }),
                });

                if (!updateRes.ok) {
                  const err = await updateRes.json().catch(() => ({}));
                  console.warn(
                    `⚠️ Auto-save failed:`,
                    err?.msg || updateRes.status,
                  );
                } else {
                  console.log(`✅ Avatar auto-saved successfully`);
                  // Refresh local profiles list
                  const listRes = await fetch(apiUrl("/api/hr"));
                  if (listRes.ok) {
                    const list = await listRes.json();
                    setHRProfiles(list.map(withAvatarMeta));
                  }
                }
              } catch (e) {
                console.warn("Auto-save avatar failed", e);
                showNotification(
                  "Note: Avatar uploaded but profile save requires manual click",
                  "info",
                );
              }
            }
          } else {
            setNewHRProfile((prev) => ({ ...prev, avatarUrl: uploaded.url }));
          }
        } catch (err) {
          showNotification(err.message || "Could not upload image", "error");
        }
      };
      img.onerror = () => showNotification("Invalid image file", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      showNotification("Please enter a message", "error");
      return;
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
      let openedChannels = 0;

      if (selectedPlatforms.includes("whatsapp") && scheduleType === "now") {
        const recipients =
          selectedContacts.length > 0
            ? selectedContacts
            : [
                {
                  number: companyConfig.phone,
                  name: companyConfig.companyName,
                },
              ];

        const waResult = openWhatsAppForContacts(recipients, message);
        if (waResult.total === 0) {
          showNotification("No valid WhatsApp number found", "error");
        } else if (waResult.opened < waResult.total) {
          showNotification(
            `Opened ${waResult.opened}/${waResult.total} chats. Please allow popups for full send.`,
            "info",
          );
          openedChannels += waResult.opened;
        } else {
          showNotification(
            `Opened ${waResult.total} WhatsApp chat(s). Press send in WhatsApp.`,
            "success",
          );
          openedChannels += waResult.opened;
        }
      }

      if (selectedPlatforms.includes("sms") && scheduleType === "now") {
        const normalizedNumber = normalizePhoneNumber(companyConfig.phone);
        if (normalizedNumber) {
          const url = `sms:${normalizedNumber}?body=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
          openedChannels += 1;
        }
      }

      if (selectedPlatforms.includes("email") && scheduleType === "now") {
        const url = `mailto:${companyConfig.email}?subject=${encodeURIComponent(companyConfig.companyName)}&body=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        openedChannels += 1;
      }

      // Do not auto-open all other platforms on Publish.
      // Users can use each platform's Share button for manual posting.

      const data = {
        message,
        platforms: selectedPlatforms,
        platformMetrics: buildPlatformMetricsSnapshot(),
        scheduleType,
        scheduleDate,
        scheduleTime,
        status: scheduleType === "now" ? "sent" : "scheduled",
      };

      // ✅ BACKEND SAVE
      const postResponse = await fetch(apiUrl("/api/posts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, userId: resolveHRScopeUserId() }),
      });

      if (!postResponse.ok) {
        const err = await postResponse.json().catch(() => ({}));
        throw new Error(
          err?.msg || `Failed to save post (${postResponse.status})`,
        );
      }

      // ✅ FETCH UPDATED DATA
      const res = await fetch(
        apiUrl(
          `/api/posts?userId=${encodeURIComponent(resolveHRScopeUserId())}`,
        ),
      );
      if (!res.ok) {
        throw new Error("Failed to fetch updated posts");
      }
      const updated = await res.json();
      const normalizedHistory = Array.isArray(updated)
        ? updated
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((post, index) => ({
              id: post._id || index + 1,
              message: post.message || "Social media post",
              platforms: Array.isArray(post.platforms)
                ? post.platforms
                : ["whatsapp"],
              sentAt: post.createdAt
                ? new Date(post.createdAt).toLocaleString()
                : new Date().toLocaleString(),
              status: post.status || "sent",
              engagement: {
                likes: Array.isArray(post.platformMetrics)
                  ? post.platformMetrics.reduce(
                      (sum, metric) => sum + (Number(metric.engagement) || 0),
                      0,
                    )
                  : 0,
                comments: 0,
                shares: 0,
              },
            }))
        : [];

      setPostHistory(normalizedHistory);
      addPlatformAnalyticsCounts(selectedPlatforms);

      // ✅ RESET
      setMessage("");
      setSelectedPlatforms(["whatsapp"]);
      setScheduleDate("");
      setScheduleTime("");
      setScheduleType("now");
      setSelectedContacts([]);
      setContactSearch("");

      // ✅ SUCCESS
      if (scheduleType === "scheduled") {
        showNotification(
          "Message scheduled and saved successfully! 📅",
          "success",
        );
      } else if (openedChannels > 0) {
        showNotification(
          `Post saved. ${openedChannels} channel(s) opened for sending.`,
          "success",
        );
      } else {
        showNotification(
          "Post saved successfully! Use platform Share button to publish.",
          "info",
        );
      }
    } catch (err) {
      showNotification("Server error ❌", "error");
    }
  };
  const duplicatePost = (post) => {
    setMessage(post.message);
    const firstPlatform =
      Array.isArray(post.platforms) && post.platforms.length > 0
        ? [post.platforms[0]]
        : ["whatsapp"];
    setSelectedPlatforms(firstPlatform);
    setActiveTab("compose");
    showNotification("Post content loaded for editing");
  };

  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPostHistory((prev) => prev.filter((p) => p.id !== postId));
      showNotification("Post deleted!");
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.content.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter history
  const filteredHistory = postHistory.filter((p) =>
    p.message.toLowerCase().includes(searchHistory.toLowerCase()),
  );

  const filteredContacts = contacts.filter((contact) => {
    const keyword = contactSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      contact.name.toLowerCase().includes(keyword) ||
      String(contact.number).toLowerCase().includes(keyword)
    );
  });

  // ========== RENDER FUNCTIONS ==========

  // Dashboard View
  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>

          <p>Welcome back! Here's your social media performance at a glance.</p>
        </div>
        <button
          className="refresh-btn"
          onClick={fetchAnalyticsData}
          disabled={loadingAnalytics}
        >
          <Icons.History />
          {loadingAnalytics ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loadingAnalytics ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card platform-performance">
              <h3>📈 Platform Performance</h3>
              <p className="platform-performance-description">
                Live post counts for every connected social channel.
              </p>
              <div className="platform-stats-list">
                {allPlatforms.map((platform) => (
                  <div className="platform-stat-item" key={platform.id}>
                    <div
                      className="platform-icon-box"
                      style={{
                        background: platform.color,
                      }}
                    >
                      {React.createElement(PlatformIcons[platform.icon])}

                      <div className="platform-right">
                        {platformAnalytics[platform.id] || 0}
                      </div>
                    </div>

                    <div className="platform-name">{platform.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card recent-posts">
              <h3>📝 Recent Posts</h3>
              {postHistory.length === 0 ? (
                <div className="empty-state">
                  <p>No posts yet. Create your first post!</p>
                </div>
              ) : (
                <>
                  <div className="recent-posts-list">
                    {postHistory.length === 0 ? (
                      <div className="empty-state">
                        <p>No recent activity found.</p>
                      </div>
                    ) : (
                      postHistory.slice(0, 6).map((post, index) => (
                        <div key={index} className="recent-post-item">
                          <div className="recent-post-top">
                            <div className="recent-platform">
                              <div
                                className="recent-platform-icon"
                                style={{
                                  background: post.platformColor || "#6366f1",
                                }}
                              >
                                {React.createElement(
                                  PlatformIcons[post.platformIcon],
                                )}
                              </div>

                              <div className="recent-post-info">
                                <h4>{post.platform}</h4>

                                <span>Posted by {post.author}</span>
                              </div>
                            </div>

                            <div className={`recent-status ${post.status}`}>
                              {post.status}
                            </div>
                          </div>

                          <p className="recent-message">{post.message}</p>

                          <div className="recent-time">
                            <span>{post.date}</span>

                            <span>{post.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    className="view-all-btn"
                    onClick={() => setActiveTab("history")}
                  >
                    View All Posts →
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="dashboard-grid"></div>
        </>
      )}
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
                <label
                  className="toolbar-btn image-upload-btn"
                  title="Add Image"
                >
                  <Icons.Image />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                <button
                  className="toolbar-btn"
                  title="Add Link"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                >
                  <Icons.Link />
                </button>
              </div>
            </div>

            {/* Link Input */}
            {showLinkInput && (
              <div className="link-input-container">
                <input
                  type="text"
                  placeholder="Enter URL (e.g., technosthan.com)"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addLink()}
                />
                <button className="add-link-btn" onClick={addLink}>
                  Add
                </button>
                <button
                  className="cancel-link-btn"
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkInput("");
                  }}
                >
                  <Icons.Close />
                </button>
              </div>
            )}

            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="image-preview">
                <img src={attachedImage} alt="Attached" />
                <button className="remove-image-btn" onClick={removeImage}>
                  <Icons.Close />
                </button>
              </div>
            )}

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
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            <div className="character-counter">
              <span className={isOverLimit ? "over-limit" : ""}>
                {characterCount} characters
                {characterLimit && ` / ${characterLimit} limit`}
              </span>
              {isOverLimit && (
                <span className="warning">
                  ⚠️ Exceeds limit for selected platform
                </span>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="compose-card platforms-card">
            <div className="card-header">
              <h3>📱 Select Platform</h3>
              <button
                className="select-all-btn"
                onClick={clearSelectedPlatform}
              >
                Clear
              </button>
            </div>

            <div className="platform-manager-row">
              <input
                type="text"
                placeholder="New platform name"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Platform id"
                value={newPlatformId}
                onChange={(e) => setNewPlatformId(e.target.value)}
              />
              <input
                type="color"
                value={newPlatformColor}
                onChange={(e) => setNewPlatformColor(e.target.value)}
                title="Platform color"
              />
              <button className="add-platform-btn" onClick={addPlatformOption}>
                Add
              </button>
            </div>

            <div className="platforms-grid">
              {platformOptions.map((platform) => {
                const IconComponent =
                  PlatformIcons[platform.icon] || PlatformIcons.Link;
                return (
                  <div
                    key={platform._id || platform.id}
                    className={`platform-item ${selectedPlatforms.includes(platform.id) ? "selected" : ""}`}
                    onClick={() => togglePlatform(platform.id)}
                    style={{ "--platform-color": platform.color }}
                  >
                    <button
                      type="button"
                      className="remove-platform-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePlatformOption(platform);
                      }}
                      title="Remove platform"
                    >
                      ×
                    </button>

                    <div
                      className="platform-icon-wrapper"
                      style={{ background: platform.color }}
                    >
                      {IconComponent && <IconComponent />}
                    </div>
                    <span className="platform-name">{platform.name}</span>
                    <span className="platform-limit">
                      {platform.charLimit.toLocaleString()} chars
                    </span>
                    {selectedPlatforms.includes(platform.id) && (
                      <span className="check-mark">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="16"
                          height="16"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </span>
                    )}

                    <div className="platform-actions">
                      <button
                        className="copy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessage(platform.name);
                        }}
                        title="Copy message"
                      >
                        <Icons.Copy />
                      </button>

                      <button
                        className="share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToPlatform(platform.id);
                        }}
                        title="Share"
                      >
                        <Icons.Share />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="compose-card schedule-card">
            <h3>⏰ When to Post</h3>

            <div className="schedule-options">
              <label
                className={`schedule-option ${scheduleType === "now" ? "active" : ""}`}
              >
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

              <label
                className={`schedule-option ${scheduleType === "scheduled" ? "active" : ""}`}
              >
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
                    min={new Date().toISOString().split("T")[0]}
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

          {/* 📱 Contacts Card - WhatsApp Only */}
          {selectedPlatforms.includes("whatsapp") && (
            <div className="compose-card contacts-card">
              <h3>📱 Send to Contacts</h3>
              <p className="contacts-hint">
                Filter by name/number, select contacts for preview, then send
                from your own WhatsApp.
              </p>
              <div className="contacts-actions">
                <button type="button" onClick={toggleAllContacts}>
                  {filteredContacts.length > 0 &&
                  filteredContacts.every((contact) =>
                    selectedContacts.some(
                      (selected) => selected.number === contact.number,
                    ),
                  )
                    ? "Unselect All"
                    : "Select All"}
                </button>
                <button type="button" onClick={openWhatsAppComposer}>
                  Open My WhatsApp
                </button>
              </div>

              <div className="contact-search-row">
                <input
                  type="text"
                  placeholder="Search by name or number"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>

              <div className="contacts-list">
                {filteredContacts.map((contact, index) => (
                  <div
                    key={index}
                    className={`contact-item ${selectedContacts.some((c) => c.number === contact.number) ? "selected" : ""}`}
                    onClick={() => toggleContact(contact)}
                  >
                    <div className="contact-avatar">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-number">{contact.number}</span>
                    </div>
                    {selectedContacts.some(
                      (c) => c.number === contact.number,
                    ) && <span className="contact-check">✓</span>}
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="no-contact-found">
                    No contact found for this keyword.
                  </div>
                )}
              </div>

              {/* Add New Contact */}
              <div className="add-contact-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Number"
                  value={newContactNumber}
                  onChange={(e) => setNewContactNumber(e.target.value)}
                />
                <button className="add-contact-btn" onClick={addContact}>
                  + Add
                </button>
              </div>

              {selectedContacts.length > 0 && (
                <div className="selected-contacts-summary">
                  <span>Selected: {selectedContacts.length} contact(s)</span>
                  <button onClick={() => setSelectedContacts([])}>Clear</button>
                </div>
              )}

              {selectedContacts.length > 0 && (
                <div className="selected-recipients-preview">
                  <strong>Will Send To:</strong>
                  <div className="recipient-chips">
                    {selectedContacts.map((contact) => (
                      <span key={contact.number} className="recipient-chip">
                        {contact.name} ({contact.number})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="compose-card dispatch-card">
            <div className="card-header">
              <h3>🚀 API Dispatch (LinkedIn/Facebook/Telegram/WhatsApp)</h3>
              <button
                className="select-all-btn"
                onClick={toggleAllDispatchPlatforms}
              >
                {dispatchPlatforms.length === dispatchPlatformOptions.length
                  ? "Unselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="dispatch-platform-list">
              {dispatchPlatformOptions.map((platform) => (
                <label key={platform.id} className="dispatch-platform-item">
                  <input
                    type="checkbox"
                    checked={dispatchPlatforms.includes(platform.id)}
                    onChange={() => toggleDispatchPlatform(platform.id)}
                  />
                  <span className="dispatch-platform-name">
                    {platform.name}
                  </span>
                  <span
                    className={`dispatch-status ${platformConnections[platform.id] ? "connected" : "disconnected"}`}
                  >
                    {platformConnections[platform.id]
                      ? "Connected"
                      : "Not Connected"}
                  </span>
                </label>
              ))}
            </div>

            <div className="dispatch-actions">
              <button
                className="dispatch-btn post"
                onClick={() => handleSocialApiSend("post")}
                disabled={sendingType !== null}
              >
                {sendingType === "post" ? "Posting..." : "Post"}
              </button>
              <button
                className="dispatch-btn message"
                onClick={() => handleSocialApiSend("message")}
                disabled={sendingType !== null}
              >
                {sendingType === "message" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>

          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={
              !message.trim() || selectedPlatforms.length === 0 || isOverLimit
            }
          >
            <Icons.Send />
            {scheduleType === "now" ? "Publish" : "Schedule"}
          </button>
        </div>

        {/* Sidebar - Preview & Templates */}
        <div className="compose-sidebar">
          {/* Preview */}
          <div className="compose-card preview-card">
            <h3>👁️ Preview</h3>
            <div className="preview-content">
              {message ? (
                <div className="preview-message">
                  {message.split("\n").map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>
              ) : (
                <p className="preview-placeholder">
                  Start typing to see preview...
                </p>
              )}
            </div>
            {selectedPlatforms.length > 0 && (
              <div className="preview-platforms">
                <span>To: {selectedPlatforms.length} platforms</span>
                <div className="platform-tags">
                  {selectedPlatforms.slice(0, 5).map((id) => {
                    const platform = allPlatforms.find((p) => p.id === id);
                    const IconComponent = platform
                      ? PlatformIcons[platform.icon]
                      : null;
                    return (
                      <span
                        key={id}
                        className="platform-tag"
                        style={{ borderColor: platform?.color }}
                      >
                        {IconComponent && <IconComponent />}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="compose-card quick-templates-card">
            <h3>⚡ Templates</h3>
            <div className="quick-templates-list">
              {templates.slice(0, 4).map((template) => (
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
            setNewTemplate({
              title: "",
              content: "",
              category: "custom",
              tags: [],
            });
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
                {
                  templateCategories.find((c) => c.id === template.category)
                    ?.icon
                }
                {templateCategories.find((c) => c.id === template.category)
                  ?.name || "Custom"}
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
                      tags: template.tags,
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
                <span key={i} className="tag">
                  #{tag}
                </span>
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
        <div
          className="modal-overlay"
          onClick={() => setShowTemplateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <button
                className="close-btn"
                onClick={() => setShowTemplateModal(false)}
              >
                <Icons.Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="template-title">Template Title</label>
                <input
                  id="template-title"
                  name="templateTitle"
                  type="text"
                  placeholder="e.g., Job Opening Announcement"
                  value={newTemplate.title}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="template-category">Category</label>
                <select
                  id="template-category"
                  name="templateCategory"
                  value={newTemplate.category}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, category: e.target.value })
                  }
                >
                  {templateCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="template-content">Template Content</label>
                <textarea
                  id="template-content"
                  name="templateContent"
                  placeholder="Write your template message here..."
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                  rows={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="template-tags">Tags (comma separated)</label>
                <input
                  id="template-tags"
                  name="templateTags"
                  type="text"
                  placeholder="e.g., hiring, jobs, careers"
                  value={newTemplate.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
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
              <button className="save-btn" onClick={saveTemplate}>
                {editingTemplate ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Settings Modal */}
      {showCompanySettings && (
        <div
          className="modal-overlay"
          onClick={() => setShowCompanySettings(false)}
        >
          <div
            className="modal-content company-settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🏢 Company Settings</h2>
              <button
                className="close-btn"
                onClick={() => setShowCompanySettings(false)}
              >
                <Icons.Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="settings-section">
                <h3>Company Information</h3>
                <div className="settings-grid">
                  <div className="input-group">
                    <label htmlFor="company-name-modal">Company Name</label>
                    <input
                      id="company-name-modal"
                      name="companyName"
                      type="text"
                      value={companyConfig.companyName}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          companyName: e.target.value,
                        })
                      }
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-tagline-modal">Tagline</label>
                    <input
                      id="company-tagline-modal"
                      name="companyTagline"
                      type="text"
                      value={companyConfig.tagline}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          tagline: e.target.value,
                        })
                      }
                      placeholder="Your Tagline"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-phone-modal">📱 Phone Number</label>
                    <input
                      id="company-phone-modal"
                      name="companyPhone"
                      type="text"
                      value={companyConfig.phone}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          phone: e.target.value,
                        })
                      }
                      placeholder="9477288288"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-email-modal">📧 Email</label>
                    <input
                      id="company-email-modal"
                      name="companyEmail"
                      type="email"
                      value={companyConfig.email}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          email: e.target.value,
                        })
                      }
                      placeholder="hr@company.com"
                    />
                  </div>
                  <div className="input-group full-width">
                    <label htmlFor="company-website-modal">🌐 Website</label>
                    <input
                      id="company-website-modal"
                      name="companyWebsite"
                      type="url"
                      value={companyConfig.website}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          website: e.target.value,
                        })
                      }
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div className="input-group full-width">
                    <label htmlFor="company-address-modal">📍 Address</label>
                    <input
                      id="company-address-modal"
                      name="companyAddress"
                      type="text"
                      value={companyConfig.address}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          address: e.target.value,
                        })
                      }
                      placeholder="Your Address"
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>🔗 Social Media Links</h3>
                <div className="settings-grid">
                  <div className="input-group">
                    <label htmlFor="company-facebook-modal">Facebook</label>
                    <input
                      id="company-facebook-modal"
                      name="companyFacebook"
                      type="url"
                      value={companyConfig.socialLinks.facebook}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          socialLinks: {
                            ...companyConfig.socialLinks,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-instagram-modal">Instagram</label>
                    <input
                      id="company-instagram-modal"
                      name="companyInstagram"
                      type="url"
                      value={companyConfig.socialLinks.instagram}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          socialLinks: {
                            ...companyConfig.socialLinks,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-linkedin-modal">LinkedIn</label>
                    <input
                      id="company-linkedin-modal"
                      name="companyLinkedIn"
                      type="url"
                      value={companyConfig.socialLinks.linkedin}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          socialLinks: {
                            ...companyConfig.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-twitter-modal">Twitter/X</label>
                    <input
                      id="company-twitter-modal"
                      name="companyTwitter"
                      type="url"
                      value={companyConfig.socialLinks.twitter}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          socialLinks: {
                            ...companyConfig.socialLinks,
                            twitter: e.target.value,
                          },
                        })
                      }
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-youtube-modal">YouTube</label>
                    <input
                      id="company-youtube-modal"
                      name="companyYouTube"
                      type="url"
                      value={companyConfig.socialLinks.youtube}
                      onChange={(e) =>
                        setCompanyConfig({
                          ...companyConfig,
                          socialLinks: {
                            ...companyConfig.socialLinks,
                            youtube: e.target.value,
                          },
                        })
                      }
                      placeholder="https://youtube.com/@yourcompany"
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>📊 Platform Benchmarks</h3>
                <div className="settings-grid">
                  {[
                    { id: "facebook", label: "Facebook" },
                    { id: "instagram", label: "Instagram" },
                    { id: "linkedin", label: "LinkedIn" },
                    { id: "twitter", label: "Twitter/X" },
                    { id: "youtube", label: "YouTube" },
                    { id: "telegram", label: "Telegram" },
                    { id: "pinterest", label: "Pinterest" },
                    { id: "tiktok", label: "TikTok" },
                  ].map((platform) => (
                    <div key={platform.id} className="input-group">
                      <label htmlFor={`benchmark-followers-${platform.id}`}>
                        {platform.label} Followers
                      </label>
                      <input
                        id={`benchmark-followers-${platform.id}`}
                        name={`benchmarkFollowers${platform.id}`}
                        type="number"
                        min="0"
                        value={
                          companyConfig.platformBenchmarks?.[platform.id]
                            ?.followers ?? 0
                        }
                        onChange={(e) =>
                          setCompanyConfig({
                            ...companyConfig,
                            platformBenchmarks: {
                              ...companyConfig.platformBenchmarks,
                              [platform.id]: {
                                followers: Number(e.target.value) || 0,
                                engagement:
                                  companyConfig.platformBenchmarks?.[
                                    platform.id
                                  ]?.engagement || 0,
                              },
                            },
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  ))}

                  {[
                    { id: "facebook", label: "Facebook" },
                    { id: "instagram", label: "Instagram" },
                    { id: "linkedin", label: "LinkedIn" },
                    { id: "twitter", label: "Twitter/X" },
                    { id: "youtube", label: "YouTube" },
                    { id: "telegram", label: "Telegram" },
                    { id: "pinterest", label: "Pinterest" },
                    { id: "tiktok", label: "TikTok" },
                  ].map((platform) => (
                    <div key={`${platform.id}-eng`} className="input-group">
                      <label htmlFor={`benchmark-engagement-${platform.id}`}>
                        {platform.label} Engagement/Post
                      </label>
                      <input
                        id={`benchmark-engagement-${platform.id}`}
                        name={`benchmarkEngagement${platform.id}`}
                        type="number"
                        min="0"
                        value={
                          companyConfig.platformBenchmarks?.[platform.id]
                            ?.engagement ?? 0
                        }
                        onChange={(e) =>
                          setCompanyConfig({
                            ...companyConfig,
                            platformBenchmarks: {
                              ...companyConfig.platformBenchmarks,
                              [platform.id]: {
                                followers:
                                  companyConfig.platformBenchmarks?.[
                                    platform.id
                                  ]?.followers || 0,
                                engagement: Number(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <h3>📱 Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Check out ${companyConfig.companyName}! ${companyConfig.website}`,
                      );
                      window.open(
                        `https://wa.me/${companyConfig.phone}?text=${text}`,
                        "_blank",
                      );
                    }}
                  >
                    <span>💬</span> Test WhatsApp
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Check out ${companyConfig.companyName}! ${companyConfig.website}`,
                      );
                      window.open(
                        `mailto:${companyConfig.email}?subject=Contact&body=${text}`,
                        "_blank",
                      );
                    }}
                  >
                    <span>📧</span> Test Email
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Check out ${companyConfig.companyName}! ${companyConfig.website}`,
                      );
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(companyConfig.website)}`,
                        "_blank",
                      );
                    }}
                  >
                    <span>📘</span> Test Facebook
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Check out ${companyConfig.companyName}! ${companyConfig.website}`,
                      );
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(companyConfig.website)}`,
                        "_blank",
                      );
                    }}
                  >
                    <span>💼</span> Test LinkedIn
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowCompanySettings(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => {
                  showNotification("Company settings saved! ✅");
                  setShowCompanySettings(false);
                }}
              >
                Save Settings
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
        {postHistory.filter((p) => p.status === "scheduled").length === 0 ? (
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
            .filter((p) => p.status === "scheduled")
            .map((post) => (
              <div key={post.id} className="scheduled-post-card">
                <div className="post-time">
                  <Icons.Calendar />
                  <span>{post.sentAt}</span>
                </div>
                <div className="post-message">{post.message}</div>
                <div className="post-platforms">
                  {post.platforms.map((id) => {
                    const platform = allPlatforms.find((p) => p.id === id);
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
                  <button
                    className="delete"
                    onClick={() => deletePost(post.id)}
                  >
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
                {post.platforms.map((id) => {
                  const platform = allPlatforms.find((p) => p.id === id);
                  return (
                    <span
                      key={id}
                      className="platform-badge"
                      title={platform?.name}
                    >
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
          <div className="stat-icon blue">
            <Icons.Send />
          </div>
          <div className="stat-info">
            <h3>{analyticsData.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon green">
            <Icons.Heart />
          </div>
          <div className="stat-info">
            <h3>{analyticsData.totalEngagement.toLocaleString()}</h3>
            <p>Total Engagement</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon purple">
            <Icons.TrendUp />
          </div>
          <div className="stat-info">
            <h3>+{analyticsData.weeklyGrowth}%</h3>
            <p>Weekly Growth</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon orange">
            <Icons.Star />
          </div>
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
            {analyticsData.platformStats.map((stat, index) => {
              const platformMeta =
                allPlatforms.find((p) => p.name === stat.platform) ||
                allPlatforms.find(
                  (p) =>
                    p.id.toLowerCase() === String(stat.platform).toLowerCase(),
                ) ||
                null;
              const maxEngagement = Math.max(
                ...analyticsData.platformStats.map(
                  (s) => Number(s.engagement) || 0,
                ),
                1,
              );
              const width =
                ((Number(stat.engagement) || 0) / maxEngagement) * 100;
              return (
                <div key={index} className="platform-bar-row">
                  <div className="bar-label">
                    {platformMeta ? platformMeta.icon : "🌐"}
                    {stat.platform}
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${width}%`,
                        backgroundColor: platformMeta?.color || "#6366f1",
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">
                    {(Number(stat.engagement) || 0).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="analytics-card">
          <h3>📊 Monthly Post Activity</h3>
          <div className="bar-chart">
            {analyticsData.monthlyPosts.map((value, index) => (
              <div key={index} className="bar-item">
                <div
                  className="bar"
                  style={{
                    height: `${(value / Math.max(...analyticsData.monthlyPosts, 1)) * 100}%`,
                  }}
                >
                  <span className="bar-tooltip">{value}</span>
                </div>
                <span className="bar-label">
                  {
                    [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ][index]
                  }
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
            {dispatchPlatformOptions.map((platform) => (
              <div key={platform.id} className="account-item">
                <span className="account-icon">
                  {platform.name.slice(0, 1)}
                </span>
                <span className="account-name">{platform.name}</span>
                <span
                  className={`dispatch-status ${platformConnections[platform.id] ? "connected" : "disconnected"}`}
                >
                  {platformConnections[platform.id]
                    ? "Connected"
                    : "Not Connected"}
                </span>
                {platformConnections[platform.id] ? (
                  <button
                    className="connect-btn"
                    onClick={() => handleDisconnectAccount(platform.id)}
                    disabled={connectingPlatform === platform.id}
                  >
                    {connectingPlatform === platform.id
                      ? "Please wait..."
                      : "Disconnect"}
                  </button>
                ) : (
                  <button
                    className="connect-btn"
                    onClick={() => handleConnectAccount(platform.id)}
                    disabled={connectingPlatform === platform.id}
                  >
                    {connectingPlatform === platform.id
                      ? "Connecting..."
                      : "Connect"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3>🔔 Notifications</h3>
          <div className="settings-options">
            <label
              className="setting-option"
              htmlFor="settings-notify-email-scheduled"
            >
              <input
                id="settings-notify-email-scheduled"
                name="settingsNotifyEmailScheduled"
                type="checkbox"
                checked={settingsNotifications.emailScheduled}
                onChange={(e) =>
                  setSettingsNotifications((prev) => ({
                    ...prev,
                    emailScheduled: e.target.checked,
                  }))
                }
              />
              <span>Email notifications for scheduled posts</span>
            </label>
            <label
              className="setting-option"
              htmlFor="settings-notify-push-engagement"
            >
              <input
                id="settings-notify-push-engagement"
                name="settingsNotifyPushEngagement"
                type="checkbox"
                checked={settingsNotifications.pushEngagement}
                onChange={(e) =>
                  setSettingsNotifications((prev) => ({
                    ...prev,
                    pushEngagement: e.target.checked,
                  }))
                }
              />
              <span>Push notifications for engagement alerts</span>
            </label>
            <label
              className="setting-option"
              htmlFor="settings-notify-weekly-report"
            >
              <input
                id="settings-notify-weekly-report"
                name="settingsNotifyWeeklyReport"
                type="checkbox"
                checked={settingsNotifications.weeklyReport}
                onChange={(e) =>
                  setSettingsNotifications((prev) => ({
                    ...prev,
                    weeklyReport: e.target.checked,
                  }))
                }
              />
              <span>Weekly analytics report</span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h3>👤 Profile</h3>
          <div className="profile-settings">
            <div className="form-group">
              <label htmlFor="settings-company-name">Company Name</label>
              <input
                id="settings-company-name"
                name="settingsCompanyName"
                type="text"
                value={companyConfig.companyName}
                onChange={(e) =>
                  setCompanyConfig({
                    ...companyConfig,
                    companyName: e.target.value,
                  })
                }
                placeholder="Your Company"
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-company-email">Email</label>
              <input
                id="settings-company-email"
                name="settingsCompanyEmail"
                type="email"
                value={companyConfig.email}
                onChange={(e) =>
                  setCompanyConfig({ ...companyConfig, email: e.target.value })
                }
                placeholder="hr@company.com"
              />
            </div>
            <button
              className="save-settings-btn"
              onClick={() => showNotification("Settings saved", "success")}
            >
              Save Changes
            </button>
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
    { id: "help", label: "Help", icon: <Icons.Help /> },
  ];

  // Render active view
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "compose":
        return renderCompose();
      case "templates":
        return renderTemplates();
      case "schedule":
        return renderSchedule();
      case "history":
        return renderHistory();
      case "analytics":
        return renderAnalytics();
      case "settings":
        return renderSettings();
      case "help":
        return renderHelp();
      default:
        return renderDashboard();
    }
  };

  return (
    <div
      className={`hr-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileSidebarOpen ? "mobile-sidebar-open" : ""}`}
    >
      <Helmet>
        <title>HR Social Dashboard | WhatsApp & Multi Platform Publisher</title>
        <meta
          name="description"
          content="Compose and publish social posts with WhatsApp contact selection, scheduling, templates, and analytics."
        />
      </Helmet>
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

        <div className="sidebar-scroll">
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            {!sidebarCollapsed ? (
              <div className="hr-profile-section">
                <div
                  className="current-hr-profile"
                  onClick={() => setShowHRProfileModal(true)}
                >
                  <div
                    className="hr-avatar"
                    style={{ background: currentHR.color }}
                  >
                    {renderHRAvatarContent(currentHR)}
                  </div>
                  <div className="hr-details">
                    <span className="hr-name">{currentHR.name}</span>
                    <span className="hr-role">{currentHR.role}</span>
                  </div>
                  <span className="switch-profile-icon">🔄</span>
                </div>
                {hrProfiles.length > 1 && (
                  <div className="hr-profiles-dropdown">
                    {hrProfiles
                      .filter(
                        (p) =>
                          (p._id || p.id) !== (currentHR._id || currentHR.id),
                      )
                      .map((profile) => (
                        <button
                          key={profile._id || profile.id}
                          className="hr-profile-option"
                          onClick={() => switchHRProfile(profile)}
                        >
                          <div
                            className="hr-avatar small"
                            style={{ background: profile.color }}
                          >
                            {renderHRAvatarContent(profile)}
                          </div>
                          <span>{profile.name}</span>
                        </button>
                      ))}
                    <button
                      className="add-new-hr-btn"
                      onClick={() => {
                        setEditingHRProfile(null);
                        setShowHRProfileModal(true);
                      }}
                    >
                      <Icons.Plus /> Add New HR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="collapsed-hr-avatar"
                onClick={() => openHRProfileModal("signin")}
                style={{ background: currentHR.color }}
              >
                {renderHRAvatarContent(currentHR)}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              type="button"
              className="mobile-menu-btn" // This class is already defined in FullyResponsive.css
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <h2>{navItems.find((n) => n.id === activeTab)?.label}</h2>
          </div>
          <div className="top-bar-right">
            {/* Company Info Badge */}
            <div
              className="company-badge"
              onClick={() => setShowCompanySettings(true)}
            >
              <div className="company-badge-icon">
                <img
                  src={logo}
                  alt="logo"
                  style={{
                    width: "40px !important",
                    height: "40px !important",
                    maxWidth: "60px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="company-badge-info">
                <span className="company-name">
                  {companyConfig.companyName}
                </span>
                <span className="company-tagline">{companyConfig.tagline}</span>
              </div>
            </div>
            <button className="notification-btn">
              <Icons.Bell />
              <span className="notification-badge">3</span>
            </button>
            <button
              className="user-menu profile-trigger"
              onClick={() => openHRProfileModal("signin")}
            >
              <div
                className="user-avatar small"
                style={{ background: currentHR.color }}
              >
                {renderHRAvatarContent(currentHR)}
              </div>
              <div className="user-menu-text">
                <span className="user-menu-name">{currentHR.name}</span>
                <span className="user-menu-role">{currentHR.role}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {renderActiveView()}
          <WhatsAppChat />
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === "success"
            ? "✅"
            : notification.type === "error"
              ? "❌"
              : "ℹ️"}{" "}
          {notification.message}
        </div>
      )}

      {mobileSidebarOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* HR Profile Modal */}
      {showHRProfileModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowHRProfileModal(false)}
        >
          <div
            className="modal hr-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>👤 HR Profile Center</h2>
              <button
                className="modal-close modal-cancel-btn"
                onClick={() => setShowHRProfileModal(false)}
              >
                Cancel
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-tab-switcher">
                <button
                  className={profileModalTab === "signin" ? "active" : ""}
                  onClick={() => setProfileModalTab("signin")}
                >
                  Sign In
                </button>
                <button
                  className={profileModalTab === "signup" ? "active" : ""}
                  onClick={() => setProfileModalTab("signup")}
                >
                  Sign Up
                </button>
                {currentHR?._id && (
                  <button
                    className={profileModalTab === "edit" ? "active" : ""}
                    onClick={() => setProfileModalTab("edit")}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {profileModalTab === "signin" && (
                <div className="profile-auth-panel premium-signin-panel">
                  <input
                    type="email"
                    placeholder="Enter HR email"
                    value={profileLoginEmail}
                    onChange={(e) => setProfileLoginEmail(e.target.value)}
                  />
                  <button className="auth-btn" onClick={signInHRProfile}>
                    Sign In Profile
                  </button>
                  <button
                    type="button"
                    className="signin-link-btn"
                    onClick={() => setProfileModalTab("signup")}
                  >
                    No account? Sign Up
                  </button>
                  {hrProfiles.length > 0 ? (
                    <div className="quick-signin-list">
                      {hrProfiles.map((profile) => (
                        <button
                          key={profile._id || profile.id}
                          className="quick-profile-chip"
                          onClick={() => switchHRProfile(profile)}
                        >
                          <span
                            className="chip-avatar"
                            style={{ background: profile.color }}
                          >
                            {renderHRAvatarContent(profile)}
                          </span>
                          <span>{profile.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-profile-state">
                      No HR account yet. Use Sign Up to create your profile.
                    </div>
                  )}
                </div>
              )}

              {profileModalTab === "signup" && (
                <div className="add-hr-form modal-signup-form">
                  <div className="profile-image-block">
                    <div className="profile-image-preview">
                      {newHRProfile.avatarUrl ? (
                        renderHRAvatarContent({
                          avatarUrl: newHRProfile.avatarUrl,
                          name: newHRProfile.name,
                        })
                      ) : (
                        <span>No image selected</span>
                      )}
                    </div>
                    <label className="avatar-upload-btn">
                      <Icons.Image />
                      Upload HR Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleHRAvatarUpload(e, "new")}
                      />
                    </label>
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newHRProfile.name}
                      onChange={(e) =>
                        setNewHRProfile({
                          ...newHRProfile,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Role *"
                      value={newHRProfile.role}
                      onChange={(e) =>
                        setNewHRProfile({
                          ...newHRProfile,
                          role: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="email"
                      placeholder="Email *"
                      value={newHRProfile.email}
                      onChange={(e) =>
                        setNewHRProfile({
                          ...newHRProfile,
                          email: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newHRProfile.phone}
                      onChange={(e) =>
                        setNewHRProfile({
                          ...newHRProfile,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="color"
                      value={newHRProfile.color}
                      onChange={(e) =>
                        setNewHRProfile({
                          ...newHRProfile,
                          color: e.target.value,
                        })
                      }
                      title="Avatar Color"
                    />
                    <button
                      className="add-hr-submit-btn"
                      onClick={addHRProfile}
                    >
                      <Icons.Plus /> Create Profile
                    </button>
                  </div>
                </div>
              )}

              {currentHR?._id && (
                <div
                  className="current-profile-editor compact-editor"
                  style={{
                    display: profileModalTab === "edit" ? "block" : "none",
                  }}
                >
                  <div className="editor-header">
                    <h3>Edit Current Profile</h3>
                    {!editingHRProfile && (
                      <button
                        className="connect-btn"
                        onClick={startEditCurrentProfile}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingHRProfile ? (
                    <div className="form-row form-grid">
                      <div className="profile-image-block editor-image-block">
                        <div className="profile-image-preview">
                          {editingHRProfile.avatarUrl ? (
                            renderHRAvatarContent({
                              avatarUrl: editingHRProfile.avatarUrl,
                              name: editingHRProfile.name,
                            })
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>
                        <label className="avatar-upload-btn">
                          <Icons.Image />
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHRAvatarUpload(e, "edit")}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Name"
                        value={editingHRProfile.name}
                        onChange={(e) =>
                          setEditingHRProfile({
                            ...editingHRProfile,
                            name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={editingHRProfile.role}
                        onChange={(e) =>
                          setEditingHRProfile({
                            ...editingHRProfile,
                            role: e.target.value,
                          })
                        }
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editingHRProfile.email}
                        onChange={(e) =>
                          setEditingHRProfile({
                            ...editingHRProfile,
                            email: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={editingHRProfile.phone}
                        onChange={(e) =>
                          setEditingHRProfile({
                            ...editingHRProfile,
                            phone: e.target.value,
                          })
                        }
                      />
                      <input
                        type="color"
                        value={editingHRProfile.color}
                        onChange={(e) =>
                          setEditingHRProfile({
                            ...editingHRProfile,
                            color: e.target.value,
                          })
                        }
                      />
                      <div className="editor-actions">
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingHRProfile(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="save-btn"
                          onClick={saveCurrentProfile}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="editor-placeholder">
                      Click Edit to update your active profile.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialForm;
