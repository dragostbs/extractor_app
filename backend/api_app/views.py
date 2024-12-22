import re
import os
import cv2
import numpy as np
from pytesseract import pytesseract

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import File
from .serializer import FileSerializer


class MainAPIView(APIView):
    tesseract_path = os.path.join(os.path.dirname(__file__), 'tesseract', 'tesseract.exe')
    pytesseract.tesseract_cmd = tesseract_path

    def process_img(self, file):
        file.seek(0)
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        return img

    def extract_text(self, img):
        return pytesseract.image_to_string(img)

    def delete_img(self, existing_file):
        if existing_file.file:
            file_path = existing_file.file.path
            if os.path.isfile(file_path):
                os.remove(file_path)

    def get(self, request):
        files = File.objects.all()
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            if 'clear' in request.data:
                last_file = File.objects.last()
                if last_file:
                    self.delete_img(last_file)
                    last_file.delete()
                return Response({'message': 'Last file deleted.'}, status=status.HTTP_200_OK)

            serializer = FileSerializer(data=request.data)

            if serializer.is_valid():
                uploaded_file = request.FILES['file']
                img = self.process_img(uploaded_file)
                messy_text = self.extract_text(img)
                text = messy_text.replace('\n', '')

                file_instance = serializer.save(
                    text=text if text else None)

                self.delete_img(file_instance)

                return Response(FileSerializer(file_instance).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk=None):
        try:
            file_instance = get_object_or_404(File, pk=pk)
            self.delete_img(file_instance)
            file_instance.delete()
            return Response({'message': 'File deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
