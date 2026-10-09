"use client";

import React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/Footer";
import { getBlogPostBySlug, BLOG_POSTS } from "@/src/data/blogs";
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, Wand2, ArrowRight } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen invitation-bg invitation-pattern text-slate-900 antialiased overflow-x-hidden flex flex-col justify-between">
      <Navbar />

      <article className="pt-6 pb-14 md:pt-8 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10 flex-1">
        {/* Back Link */}
        <div className="mb-4 md:mb-5">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-3.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Category & Date Metadata Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-100 text-blue-700">
            {post.category}
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.publishedAt}</span>
          </div>
        </div>

        {/* Article Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-slate-900 leading-[1.2] mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {post.title}
        </h1>

        {/* Author Bio Bar & Share Button */}
        <div className="flex items-center justify-between py-4 border-y border-slate-200/70 mb-8">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">{post.author.name}</div>
              <div className="text-xs text-slate-500">{post.author.role}</div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Cover Hero Image */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-xl mb-10 border border-slate-200/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Excerpt Callout */}
        <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-800 text-base md:text-lg italic font-serif leading-relaxed mb-8">
          &ldquo;{post.excerpt}&rdquo;
        </div>

        {/* Body Content */}
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-base sm:text-lg">
          {post.content ? (
            post.content.trim().split("\n\n").map((block, idx) => {
              if (block.startsWith("### ")) {
                return (
                  <h3
                    key={idx}
                    className="text-2xl font-bold text-slate-900 mt-8 mb-3"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {block.replace("### ", "")}
                  </h3>
                );
              }
              if (block.startsWith("* ")) {
                const items = block.split("\n* ").map((item) => item.replace("* ", ""));
                return (
                  <ul key={idx} className="list-disc pl-6 space-y-2 text-slate-700">
                    {items.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </ul>
                );
              }
              if (block.match(/^\d+\.\s/)) {
                const items = block.split(/\n\d+\.\s/).map((item) => item.replace(/^\d+\.\s/, ""));
                return (
                  <ol key={idx} className="list-decimal pl-6 space-y-2 text-slate-700">
                    {items.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </ol>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {block}
                </p>
              );
            })
          ) : (
            <p>{post.excerpt}</p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-8 mt-10 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Topics:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* In-article CTA Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bring This Event to Life</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Ready to create your invitation in under 60 seconds?
            </h3>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 font-sans">
              Choose from designer templates or let our AI build your event page, digital RSVP form, and reminder schedule automatically.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-blue-600" />
              <span>Create Event with AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: "Georgia, serif" }}>
              More from Eventizer Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-1 line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
