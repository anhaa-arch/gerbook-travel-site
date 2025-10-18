"use client";

import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trash2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GET_COMMENTS = gql`
  query GetComments($yurtId: ID!) {
    comments(yurtId: $yurtId) {
      id
      user {
        id
        name
      }
      rating
      comment
      createdAt
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

interface CommentSectionProps {
  yurtId: string;
}

export function CommentSection({ yurtId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data, loading, refetch } = useQuery(GET_COMMENTS, {
    variables: { yurtId },
    fetchPolicy: "cache-and-network",
  });

  const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      toast({
        title: "✅ Амжилттай",
        description: "Сэтгэгдэл амжилттай нэмэгдлээ",
      });
      setComment("");
      setRating(5);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Алдаа",
        description: error.message || "Сэтгэгдэл нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      toast({
        title: "✅ Амжилттай",
        description: "Сэтгэгдэл устгагдлаа",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Алдаа",
        description: error.message || "Сэтгэгдэл устгахад алдаа гарлаа",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Анхааруулга",
        description: "Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Анхааруулга",
        description: "Сэтгэгдэл бичнэ үү",
        variant: "destructive",
      });
      return;
    }

    await createComment({
      variables: {
        input: {
          yurtId,
          rating,
          comment: comment.trim(),
        },
      },
    });
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm("Сэтгэгдлийг устгах уу?")) {
      await deleteComment({
        variables: { id: commentId },
      });
    }
  };

  const comments = data?.comments || [];
  const averageRating =
    comments.length > 0
      ? (
          comments.reduce((sum: number, c: any) => sum + c.rating, 0) /
          comments.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Сэтгэгдэл ({comments.length})
          </h2>
          {comments.length > 0 && (
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-lg font-semibold">{averageRating}</span>
              <span className="text-sm text-gray-600 ml-2">
                ({comments.length} үнэлгээ)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Үнэлгээ
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                      aria-label={`${star} од`}
                      title={`${star} од өгөх`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Сэтгэгдэл
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Таны туршлагыг хуваалцана уу..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={creating}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {creating ? "Илгээж байна..." : "Сэтгэгдэл үлдээх"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Сэтгэгдэл үлдээхийн тулд{" "}
              <a href="/login" className="text-emerald-600 hover:underline">
                нэвтэрнэ үү
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Ачааллаж байна...</p>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                Одоогоор сэтгэгдэл байхгүй байна. Эхний сэтгэгдлийг та үлдээнэ үү!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {c.user?.name || "Хэрэглэгч"}
                        </p>
                        <div className="flex items-center">
                          {[...Array(c.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(parseInt(c.createdAt)).toLocaleDateString(
                          "mn-MN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-gray-700">{c.comment}</p>
                    </div>
                  </div>

                  {/* Delete button (only for comment owner or admin) */}
                  {user && (user.id === c.user?.id || user.role === "admin") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="Устгах"
                      title="Сэтгэгдэл устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

