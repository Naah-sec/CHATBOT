import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Container,
  Typography,
  CircularProgress,
  useTheme,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const Message = ({ role, content }) => {
  const theme = useTheme();
  const isUser = role === 'user';
  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2.2,
        }}
      >
        <Paper
          elevation={isUser ? 6 : 2}
          sx={{
            p: 2,
            px: 2.5,
            maxWidth: { xs: '90%', sm: '70%' },
            borderRadius: isUser
              ? '22px 22px 6px 22px'
              : '22px 22px 22px 6px',
            bgcolor: isUser
              ? 'linear-gradient(90deg, #4f8cff 0%, #6ee7b7 100%)'
              : 'rgba(255,255,255,0.85)',
            color: isUser ? '#222' : '#222',
            fontSize: { xs: '1.08rem', sm: '1.13rem' },
            boxShadow: isUser
              ? '0 4px 18px 0 rgba(79,140,255,0.13)'
              : '0 1px 8px 0 rgba(60,60,60,0.07)',
            wordBreak: 'break-word',
            border: isUser ? 'none' : '1.5px solid #e3e3e3',
            transition: 'background 0.3s',
            position: 'relative',
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</Typography>
        </Paper>
      </Box>
    </Fade>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chats/`);
      setChatId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageContent = input;
    setInput('');
    setLoading(true);

    try {
      // Create a new chat if none exists
      const currentChatId = chatId || await createNewChat();

      // Add user message to the UI
      setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
      await Promise.resolve(); // Let React render the user message first

      // Add a placeholder for the assistant's streaming response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Use fetch for streaming SSE
      const response = await fetch(
        `${API_BASE_URL}/chats/${currentChatId}/stream_message/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: messageContent }),
        }
      );

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // SSE: split by double newlines
          const events = chunk.split(/\n\n+/);
          for (const event of events) {
            if (event.startsWith('data:')) {
              try {
                const data = JSON.parse(event.replace('data: ', '').replace('data:', ''));
                if (data.response) {
                  assistantText += data.response;
                  setMessages(prev => {
                    // Update the last assistant message, but never allow empty user message
                    const updated = [...prev];
                    if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                      updated[updated.length - 1] = { role: 'assistant', content: assistantText || '...' };
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove the placeholder assistant message
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: `'Inter', 'Segoe UI', 'Arial', sans-serif`,
        // Inspiring, vibrant background
        background: `linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 40%, #fbc2eb 100%), url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 0, sm: 4 },
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" disableGutters sx={{
        fontFamily: `'Inter', 'Segoe UI', 'Arial', sans-serif`,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        borderRadius: 5,
        overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.97)',
        minHeight: { xs: '100vh', sm: 600 },
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 0, sm: 2 },
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{
          px: { xs: 2, sm: 4 },
          pt: { xs: 3, sm: 4 },
          pb: 1,
          borderBottom: '1.5px solid #e3e3e3',
          bgcolor: 'transparent',
        }}>
          <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 0.5, color: '#1976d2', letterSpacing: 1.5, textShadow: '0 2px 12px #c2e9fb' }}>
            DeepSeek Chat
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Your private AI assistant, running locally.
          </Typography>
        </Box>
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: { xs: 2, sm: 4 },
          py: 2,
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: `'Inter', 'Segoe UI', 'Arial', sans-serif`,
        }}>
          {messages.map((message, index) => (
            <Message key={index} {...message} />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={28} thickness={5} color="primary" />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          sx={{
            borderTop: '1.5px solid #e3e3e3',
            bgcolor: 'rgba(255,255,255,0.99)',
            px: { xs: 2, sm: 4 },
            py: 2,
            position: { xs: 'sticky', sm: 'static' },
            bottom: 0,
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              sx={{
                bgcolor: '#f4f8fd',
                borderRadius: 2,
                '& .MuiInputBase-root': {
                  fontSize: { xs: '1.08rem', sm: '1.13rem' },
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: 'linear-gradient(135deg, #4f8cff 60%, #6ee7b7 100%)',
                color: 'white',
                borderRadius: 2,
                width: 48,
                height: 48,
                boxShadow: '0 2px 8px 0 rgba(79,140,255,0.13)',
                '&:hover': {
                  bgcolor: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                },
                transition: 'background 0.2s',
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ChatInterface;
