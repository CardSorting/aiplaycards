import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Comment {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
  username?: string;
}

interface CommentsSectionProps {
  cardId: number;
  commentCount?: number;
}

export default function CommentsSection({
  cardId,
  commentCount = 0,
}: CommentsSectionProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadedComments, setLoadedComments] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!userId || !newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cards/${cardId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded && !loadedComments) {
      fetchComments();
      setLoadedComments(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: 1,
        }}
        onClick={handleToggleExpand}
      >
        <CommentIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {userId && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitComment}
                  disabled={loading || !newComment.trim()}
                  sx={{ px: 3 }}
                >
                  Post
                </Button>
              </Stack>
            </Box>
          )}

          {!userId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please sign in to add comments.
            </Typography>
          )}

          <Stack spacing={2}>
            {comments.map(comment => (
              <Box key={comment.id}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {(comment.username || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {comment.username || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(comment.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>

          {commentCount === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2 }}
            >
              No comments yet. Be the first to share your thoughts!
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
