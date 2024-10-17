from django.urls import path
from .views import MainAPIView

urlpatterns = [
    path('', MainAPIView.as_view(), name='post_file'),
    path('delete/<int:pk>/', MainAPIView.as_view(), name='delete_file')
]
