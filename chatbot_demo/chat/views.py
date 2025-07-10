from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import StreamingHttpResponse
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer, ChatMessageSerializer
from .services.ollama_service import OllamaService
import json

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def _process_chat_message(self, chat, message_content: str, stream: bool = False):
        # Save user message
        Message.objects.create(
            chat=chat,
            role='user',
            content=message_content
        )

        # Gather last 10 messages for memory
        history = Message.objects.filter(chat=chat).order_by('created_at')
        history = list(history)[-20:]  # last 20 messages (user+assistant)
        prompt = ""
        for msg in history:
            if msg.role == 'user':
                prompt += f"User: {msg.content}\n"
            else:
                prompt += f"Assistant: {msg.content}\n"
        # Add the current user message at the end (redundant, but safe)
        prompt += f"User: {message_content}\nAssistant:"

        # Get response from Ollama
        ollama_service = OllamaService()
        try:
            if stream:
                return ollama_service.generate_response(prompt, stream=True)
            else:
                response_content = ollama_service.generate_response(prompt)
                # Save assistant message
                Message.objects.create(
                    chat=chat,
                    role='assistant',
                    content=response_content
                )
                return response_content
        except Exception as e:
            return str(e)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        serializer = ChatMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            response = self._process_chat_message(chat, serializer.validated_data['message'])
            return Response({'response': response})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def stream_message(self, request, pk=None):
        chat = self.get_object()
        serializer = ChatMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            response_stream = self._process_chat_message(
                chat, 
                serializer.validated_data['message'],
                stream=True
            )
            
            def stream_response():
                for chunk in response_stream:
                    yield f"data: {json.dumps({'response': chunk})}\n\n"
                
            response = StreamingHttpResponse(
                streaming_content=stream_response(),
                content_type='text/event-stream'
            )
            response['Cache-Control'] = 'no-cache'
            return response
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
