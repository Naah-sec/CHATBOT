import requests
import logging
from typing import Generator, Optional

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    def generate_response(self, prompt: str, stream: bool = False) -> str | Generator[str, None, None]:
        """
        Generate a response from the Ollama model.
        Args:
            prompt: The input text
            stream: Whether to stream the response
        Returns:
            Either a complete response string or a generator of response chunks
        """
        try:
            url = f"{self.base_url}/api/generate"
            payload = {
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": stream,
            }

            if stream:
                return self._stream_response(url, payload)
            else:
                return self._complete_response(url, payload)

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise

    def _complete_response(self, url: str, payload: dict) -> str:
        """Get a complete response from the model"""
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()["response"]

    def _stream_response(self, url: str, payload: dict) -> Generator[str, None, None]:
        """Stream the response from the model"""
        import json
        with requests.post(url, json=payload, stream=True) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    try:
                        chunk = line.decode()
                        data = json.loads(chunk)
                        if "response" in data:
                            yield data["response"]
                    except Exception as e:
                        logger.error(f"Streaming parse error: {e}")
