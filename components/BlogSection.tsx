"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedHeading from "./AnimatedHeading";
import { BLOG_POSTS, BlogPost } from "@/src/data/blogs";

export interface BlogSectionProps {
  posts?: BlogPost[];
  className?: string;
}

export default function BlogSection({
  posts = BLOG_POSTS.slice(0, 3),
  className = "",
}: BlogSectionProps) {
  return (
    <section
      id="blog"
      className={`relative py-20 md:py-28 bg-transparent text-neutral-900 overflow-x-hidden ${className}`}
    >
      {/* Subtle geometric cross grid background accent */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="blog-section-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M16 12.5v7M12.5 16h7"
                stroke="#94A3B8"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeOpacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blog-section-grid)" />
        </svg>
      </div>

      {/* Ambient background pastel blurs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            {/* Badge / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Eventizer Insights</span>
            </div>

            {/* Title */}
            <AnimatedHeading>
              <h2
                className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-slate-900 leading-[1.2]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Ideas & Inspiration for Unforgettable Events
              </h2>
            </AnimatedHeading>

            {/* Subtitle */}
            <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
              Tips, design trends, and planning advice to make your invitations and gatherings stand out.
            </p>
          </div>

          {/* View All Articles CTA Header Link */}
          <div className="shrink-0">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 text-sm font-semibold text-slate-800 hover:text-blue-600 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Responsive Blog Cards Grid (3 Columns on Desktop, 1 on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.12)] hover:border-blue-200/80 transition-all duration-300 overflow-hidden"
            >
              <Link href={`/blog/${post.slug}`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl">
                {/* Cover Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient Overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Tag / Category Badge */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/95 text-slate-800 shadow-md backdrop-blur-md border border-white/80">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Reading Time & Publish Date */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.readTime}</span>
                    <span className="text-slate-300">•</span>
                    <span>{post.publishedAt}</span>
                  </div>

                  {/* Blog Title */}
                  <h3
                    className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 leading-snug line-clamp-2 mb-3"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt Snippet (Clamped to 2 lines) */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-6">
                    {post.excerpt}
                  </p>

                  {/* Card Footer: Read Story Link + Author Mini */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                        {post.author.name}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
