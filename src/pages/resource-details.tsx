
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchResourceById, upvoteResource, downvoteResource } from "@/state/slices/resourceSlice";
import { checkResourceBookmarked, createResourceBookmark, deleteResourceBookmark } from "@/state/slices/resourceBookmarkSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Share2, Bookmark, ThumbsUp, ThumbsDown, ExternalLink, Eye, Star, Users, Calendar, Clock, Globe } from "lucide-react";

// RelatedResources component
function RelatedResources() {
  const relatedResources = [
    {
      id: 1,
      title: "React Performance Optimization",
      type: "article",
      difficulty: "intermediate",
    },
    {
      id: 2,
      title: "TypeScript Advanced Patterns",
      type: "course",
      difficulty: "advanced",
    },
    {
      id: 3,
      title: "CSS Modern Techniques",
      type: "video",
      difficulty: "beginner",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Related Resources</h3>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="space-y-2">
        {relatedResources.map((rel) => (
          <div
            key={rel.id}
            className="group p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-border/80 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground capitalize">{rel.type}</span>
                  <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">{rel.difficulty}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ResourceActions component
interface ResourceActionsProps {
  resource: any;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  isBookmarked: boolean;
  onAddBookmark: () => void;
  onRemoveBookmark: () => void;
  bookmarkLoading: boolean;
}
function ResourceActions({ resource, hasUpvoted, hasDownvoted, onUpvote, onDownvote, isBookmarked, onAddBookmark, onRemoveBookmark, bookmarkLoading }: ResourceActionsProps) {
  const handleOpenResource = () => {
    window.open(resource.url, "_blank");
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Resource link copied to clipboard!");
  };
  return (
    <div className="space-y-3">
      <Button
        onClick={handleOpenResource}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 rounded-lg transition-all hover:shadow-lg"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Resource
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onUpvote}
          variant={hasUpvoted ? "default" : "outline"}
          className={`rounded-lg py-5 ${
            hasUpvoted
              ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              : "hover:bg-muted border-border/50"
          }`}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          <span className="text-xs">{resource.upvotes?.length || 0}</span>
        </Button>
        <Button
          onClick={onDownvote}
          variant={hasDownvoted ? "default" : "outline"}
          className={`rounded-lg py-5 ${
            hasDownvoted
              ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              : "hover:bg-muted border-border/50"
          }`}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          <span className="text-xs">{resource.downvotes?.length || 0}</span>
        </Button>
      </div>
      <Button
        onClick={handleShare}
        variant="outline"
        className="w-full rounded-lg border-border/50 hover:bg-muted hover:border-border/80 bg-transparent"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      {!isBookmarked ? (
        <Button
          variant="outline"
          className="w-full rounded-lg border-border/50 hover:bg-muted hover:border-border/80 bg-transparent"
          onClick={onAddBookmark}
          disabled={bookmarkLoading}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Add Bookmark
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full rounded-lg border-border/50 hover:bg-muted hover:border-border/80 bg-transparent text-red-500 border-red-500/40 hover:text-red-400"
          onClick={onRemoveBookmark}
          disabled={bookmarkLoading}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Remove Bookmark
        </Button>
      )}
    </div>
  );
}

// ResourceHeader component
interface ResourceHeaderProps {
  resource: any;
}
function ResourceHeader({ resource }: ResourceHeaderProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "paid":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "freemium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "subscription":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
          {resource.difficulty}
        </Badge>
        <Badge variant="outline" className={getContentTypeColor(resource.contentType)}>
          {resource.contentType}
        </Badge>
        {resource.isApproved && (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            ✓ Verified
          </Badge>
        )}
      </div>
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 text-balance">
          {resource.title}
        </h1>
        <p className="text-lg text-white/80 leading-relaxed">{resource.description}</p>
      </div>
    </div>
  );
}

// ResourceMetadata component
interface ResourceMetadataProps {
  resource: any;
}
function ResourceMetadata({ resource }: ResourceMetadataProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const metadataItems = [
    { icon: Users, label: "Author", value: resource.author || "Unknown" },
    { icon: Calendar, label: "Published", value: formatDate(resource.publishedDate) },
    { icon: Clock, label: "Duration", value: resource.duration?.value && resource.duration?.unit ? `${resource.duration.value} ${resource.duration.unit}` : "N/A" },
    { icon: Globe, label: "Language", value: resource.language ? resource.language.toUpperCase() : "N/A" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Resource Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {metadataItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-border/50 transition-colors"
              >
                <Icon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-white/80">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag: string, idx: number) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-accent/10 text-accent border-accent/20 hover:border-accent/40 transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ResourceStats component
interface ResourceStatsProps {
  resource: any;
}
function ResourceStats({ resource }: ResourceStatsProps) {
  const stats = [
    {
      icon: Eye,
      label: "Views",
      value: resource.stats?.views?.toLocaleString() || 0,
      color: "text-blue-400",
    },
    {
      icon: Star,
      label: "Rating",
      value: resource.stats?.rating?.toFixed(1) || "0.0",
      color: "text-yellow-400",
    },
    {
      icon: ThumbsUp,
      label: "Upvotes",
      value: resource.upvotes?.length || 0,
      color: "text-green-400",
    },
    {
      icon: Users,
      label: "Reviews",
      value: resource.stats?.ratingCount || 0,
      color: "text-purple-400",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 border border-border/50 rounded-lg hover:border-border/80 transition-colors">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-white/80">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold text-white">{stat.value}</span>
          </div>
        );
      })}
    </div>
  );
}


const ResourceDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { resource, loading, error } = useAppSelector((state) => state.resource);
  const user = useAppSelector((state) => state.auth.user);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [isFavoriteInput, setIsFavoriteInput] = useState<boolean>(false);

  useEffect(() => {
    if (id) dispatch(fetchResourceById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (resource?._id && user?._id) {
      dispatch(checkResourceBookmarked(resource._id)).unwrap().then((res) => {
        setIsBookmarked(res.isBookmarked);
      });
    }
  }, [resource?._id, user?._id, dispatch]);

  if (loading || !resource) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-96 w-full bg-[#101828]" />
      </div>
    );
  }

  const handleUpvote = () => {
    if (user && resource._id) {
      dispatch(upvoteResource({ resourceId: resource._id, userId: user._id }));
      setHasUpvoted(!hasUpvoted);
      if (hasDownvoted) setHasDownvoted(false);
    }
  };

  const handleDownvote = () => {
    if (user && resource._id) {
      dispatch(downvoteResource({ resourceId: resource._id, userId: user._id }));
      setHasDownvoted(!hasDownvoted);
      if (hasUpvoted) setHasUpvoted(false);
    }
  };

  const handleAddBookmark = () => {
    if (!resource._id || !user?._id) return;
    setBookmarkLoading(true);
    setIsBookmarkModalOpen(false);
    setIsBookmarked(true);
    const payload = {
      resource: resource._id,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      notes: notesInput?.trim() || undefined,
      isFavorite: isFavoriteInput,
    };
    dispatch(createResourceBookmark(payload as any))
      .unwrap()
      .then(() => {
        setTagsInput("");
        setNotesInput("");
        setIsFavoriteInput(false);
      })
      .catch(() => {
        setIsBookmarked(false);
      })
      .finally(() => {
        setBookmarkLoading(false);
      });
  };

  const handleRemoveBookmark = () => {
    if (!resource._id) return;
    setBookmarkLoading(true);
    setIsRemoveConfirmOpen(false);
    setIsBookmarked(false);
    dispatch(deleteResourceBookmark(resource._id))
      .unwrap()
      .then(() => {})
      .catch(() => {
        setIsBookmarked(true);
      })
      .finally(() => {
        setBookmarkLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#0a1020] flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="flex flex-col items-center justify-center w-full">
          {/* Breadcrumb & Navigation */}
          <div className="mb-8 flex items-center gap-2 text-sm text-white/80">
            <a href="#" className="hover:text-[#3b82f6] transition-colors">Resources</a>
            <span>/</span>
            <span className="text-[#3b82f6]">{resource.resourceType}</span>
          </div>
          <div className="space-y-8 w-full">
            {/* Header Section */}
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{resource.title}</h1>
            <ResourceHeader resource={resource} />
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Thumbnail */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#2563eb] bg-[#101828]/60 backdrop-blur-xl shadow-2xl">
                  <img
                    src={resource.thumbnail?.url || "/placeholder.svg"}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">About this resource</h2>
                  <p className="text-white/80 leading-relaxed">{resource.description}</p>
                </div>
                {/* Metadata */}
                <div className="bg-[#101828]/60 border border-[#2563eb] rounded-xl p-6 backdrop-blur-xl shadow-2xl text-white">
                  <ResourceMetadata resource={resource} />
                </div>
                {/* Related Resources */}
                <div className="bg-[#101828]/60 border border-[#2563eb] rounded-xl p-6 backdrop-blur-xl shadow-2xl text-white">
                  <RelatedResources />
                </div>
              </div>
              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Stats Card */}
                  <div className="bg-[#101828]/60 border border-[#2563eb] rounded-xl p-6 backdrop-blur-xl shadow-2xl text-white">
                    <ResourceStats resource={resource} />
                  </div>
                  {/* Action Buttons */}
                  <div className="bg-[#101828]/60 border border-[#2563eb] rounded-xl p-6 backdrop-blur-xl shadow-2xl text-white">
                    <ResourceActions
                      resource={resource}
                      hasUpvoted={hasUpvoted}
                      hasDownvoted={hasDownvoted}
                      onUpvote={handleUpvote}
                      onDownvote={handleDownvote}
                      isBookmarked={isBookmarked}
                      onAddBookmark={() => setIsBookmarkModalOpen(true)}
                      onRemoveBookmark={() => setIsRemoveConfirmOpen(true)}
                      bookmarkLoading={bookmarkLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Error state */}
          {error && (
            <div className="mt-8 text-center text-white font-semibold">{error}</div>
          )}
        </div>
      </div>
      {/* Bookmark Modal */}
      <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to bookmarks</DialogTitle>
            <DialogDescription>
              Provide optional details before saving this resource to your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="frontend, react, learning"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Why this resource is useful or how you'll approach it..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="favorite">Mark as favorite</Label>
              <Switch id="favorite" checked={isFavoriteInput} onCheckedChange={setIsFavoriteInput} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookmarkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBookmark} disabled={bookmarkLoading || !resource._id}>
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Remove Bookmark Confirm */}
      <AlertDialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This resource will be removed from your bookmarks. You can add it again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveBookmark} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceDetails;
