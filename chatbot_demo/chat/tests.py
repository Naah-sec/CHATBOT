from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Chat, Message

class ChatAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.chat = Chat.objects.create()

    def test_create_chat(self):
        response = self.client.post('/api/chats/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Chat.objects.filter(id=response.data['id']).exists())

    def test_send_message(self):
        response = self.client.post(
            f'/api/chats/{self.chat.id}/send_message/',
            {'message': 'Hello, bot!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('response', response.data)
        
        # Check that messages were saved
        self.assertTrue(
            Message.objects.filter(
                chat=self.chat,
                role='user',
                content='Hello, bot!'
            ).exists()
        )
