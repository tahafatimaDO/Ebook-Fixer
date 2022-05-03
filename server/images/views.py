from rest_framework import viewsets
from .serializers import ImageSerializer
from .models import Image

# Create your views here.


class ImageView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all()
