from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['created_at']

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField()
