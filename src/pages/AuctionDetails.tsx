import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ImageMagnifier } from "@/components/ui/image-magnifier";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockApi, type Auction, type Comment } from "@/services/mockApi";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldQuestion,
  Calendar,
  ExternalLink,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  User,
  ShieldCheck
} from "lucide-react";

export function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [votingState, setVotingState] = useState<"authentic" | "fake" | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const auctionId = parseInt(id);
      
      Promise.all([
        mockApi.getAuctionById(auctionId),
        mockApi.getComments(auctionId)
      ])
        .then(([auctionData, commentsData]) => {
          setAuction(auctionData || null);
          setComments(commentsData);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!auction || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      // Randomly assign expert status for demo purposes (50% chance)
      const isExpert = Math.random() > 0.5;
      const comment = await mockApi.addComment(auction.id, newComment, isExpert);
      setComments(prev => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVote = async (type: "authentic" | "fake") => {
    if (!auction || votingState) return; // Prevent multiple votes in this demo
    
    try {
      const newCounts = await mockApi.voteAuction(auction.id, type);
      setAuction(prev => prev ? {
        ...prev,
        votes_authentic: newCounts.authentic,
        votes_fake: newCounts.fake,
        votes: newCounts.authentic - newCounts.fake // Update net score
      } : null);
      setVotingState(type);
    } catch (error) {
      console.error("Failed to vote", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Nie znaleziono oferty</h2>
        <Link to="/">
          <Button>Wróć na stronę główną</Button>
        </Link>
      </div>
    );
  }

  // Mock multiple images for the gallery (using the main image + some placeholders if needed)
  const images = [
    auction.image,
    // Add more mock images if needed, or just use the one we have
    "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&auto=format&fit=crop&q=60",
  ];

  const score = auction.ai_score_authenticity
    ? Math.round(auction.ai_score_authenticity * 100)
    : 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do listy
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {auction.title}
              </h1>
              <Badge variant="outline" className="text-sm">
                ID: {auction.id}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Dodano:{" "}
                {new Date(auction.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Koniec za: {auction.timeLeft}
              </span>
              <a
                href={auction.external_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Link do oferty (
                {auction.platform})
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-muted/60 shadow-sm">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <ImageMagnifier
                src={images[selectedImageIndex]}
                alt="Main view"
              />
              <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center"
                  showCloseButton={false}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={images[selectedImageIndex]}
                      alt="Fullscreen view"
                      className="max-w-full max-h-full object-contain p-4"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                      onClick={() => setIsLightboxOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>

                    {images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            );
                          }}
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            );
                          }}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                      </>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-4 gap-2 p-2 bg-muted/20">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                    selectedImageIndex === i
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-primary/50"
                  )}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opis przedmiotu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {auction.description_text}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Komentarze ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment Form */}
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>TY</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    placeholder="Dodaj komentarz..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? "Wysyłanie..." : (
                        <>
                          <Send className="mr-2 h-3 w-3" /> Wyślij
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Brak komentarzy. Bądź pierwszy!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={comment.user_avatar} />
                        <AvatarFallback>
                          {comment.user_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.user_name}</span>
                          {comment.is_expert && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                              <ShieldCheck className="mr-1 h-3 w-3" /> Ekspert
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis & Details */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Cena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {auction.price} {auction.currency}
              </div>
            </CardContent>
          </Card>

          {/* Community Verdict / Voting */}
          <Card className="border-muted shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Głos społeczności
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button 
                  variant={votingState === "authentic" ? "default" : "outline"} 
                  className={cn(
                    "flex-1 gap-2", 
                    votingState === "authentic" ? "bg-green-600 hover:bg-green-700" : "hover:border-green-500 hover:text-green-600"
                  )}
                  onClick={() => handleVote("authentic")}
                  disabled={!!votingState}
                >
                  <ThumbsUp className="h-4 w-4" /> 
                  Oryginał ({auction.votes_authentic})
                </Button>
                <Button 
                  variant={votingState === "fake" ? "default" : "outline"}
                  className={cn(
                    "flex-1 gap-2",
                    votingState === "fake" ? "bg-red-600 hover:bg-red-700" : "hover:border-red-500 hover:text-red-600"
                  )}
                  onClick={() => handleVote("fake")}
                  disabled={!!votingState}
                >
                  <ThumbsDown className="h-4 w-4" /> 
                  Falsyfikat ({auction.votes_fake})
                </Button>
              </div>
              
              {/* Voting Progress Bar */}
              {(auction.votes_authentic + auction.votes_fake) > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Oryginał</span>
                    <span>Falsyfikat</span>
                  </div>
                  <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ 
                        width: `${(auction.votes_authentic / (auction.votes_authentic + auction.votes_fake)) * 100}%` 
                      }}
                    />
                    <div className="h-full bg-red-500 flex-1" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Card */}
          <Card className="border-primary/20 shadow-md overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-primary/10">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <ShieldQuestion className="h-5 w-5" /> Analiza AI
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-sm text-muted-foreground">
                  Wskaźnik autentyczności
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      score >= 80
                        ? "text-green-600"
                        : score >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    )}
                  >
                    {score}%
                  </span>
                </div>
                <Progress
                  value={score}
                  className="h-3"
                  style={
                    {
                      "--primary":
                        score >= 80
                          ? "142.1 76.2% 36.3%"
                          : score >= 50
                          ? "45.4 93.4% 47.5%"
                          : "0 84.2% 60.2%",
                    } as React.CSSProperties
                  }
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    score >= 80
                      ? "text-green-600"
                      : score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {score >= 80
                    ? "Wysokie prawdopodobieństwo"
                    : score >= 50
                    ? "Niejednoznaczny"
                    : "Wysokie ryzyko"}
                </p>
              </div>

              {auction.ai_uncertainty_message && (
                <>
                  <Separator />
                  <div className="flex gap-3 text-sm bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/30">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <span className="text-yellow-800 dark:text-yellow-200">
                      {auction.ai_uncertainty_message}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status weryfikacji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {auction.verification_status === "expert_verified" && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Zweryfikowany
                    przez eksperta
                  </Badge>
                )}
                {auction.verification_status === "ai_verified_authentic" && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Zweryfikowany
                    przez AI
                  </Badge>
                )}
                {auction.verification_status === "ai_verified_fake" && (
                  <Badge variant="destructive">
                    <ShieldAlert className="mr-1 h-3 w-3" /> Oznaczony jako
                    falsyfikat
                  </Badge>
                )}
                {(auction.verification_status === "pending_ai" ||
                  auction.verification_status ===
                    "needs_human_verification") && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    <Clock className="mr-1 h-3 w-3" /> W trakcie weryfikacji
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
