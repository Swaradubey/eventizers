"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS, getAllBlogCategories } from "@/src/data/blogs";
import { Sparkles, Clock, ArrowRight, Search, BookOpen, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogListingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = useMemo(() => getAllBlogCategories(), []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCat =
        selectedCategory === "All" || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen invitation-bg invitation-pattern text-slate-900 antialiased overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      <section className="pt-6 pb-14 md:pt-8 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 flex-1">
        {/* Back Link */}
        <div className="mb-4 md:mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 px-3 rounded-full bg-white/80 border border-slate-200/80 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Eventizer Editorial</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-[1.15]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Latest Blogs &amp; Event Guides
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Expert event production advice, digital stationery inspiration, and host guides designed to elevate every gathering you plan.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, or etiquette tips..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white/70 rounded-3xl border border-slate-200/60 p-8 max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No articles found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/95 text-slate-800 shadow-md backdrop-blur-md border border-white/80">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.readTime}</span>
                      <span className="text-slate-300">•</span>
                      <span>{post.publishedAt}</span>
                    </div>

                    <h2
                      className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 leading-snug line-clamp-2 mb-3"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-6">
                      {post.excerpt}
                    </p>

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
        )}
      </section>

      <Footer />
    </main>
  );
}
