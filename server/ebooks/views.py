from .serializers import EbookSerializer
from .models import Ebook
from .utils import inject_image_annotations, zip_ebook
from images.models import Image
from annotations.models import Annotation

from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework import status
import os
# import json


def ebook_detail_view(request, uuid):
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        serializer = EbookSerializer(ebook)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    try:
        ebook = Ebook.objects.all().filter(uuid=uuid).get()
        ebook_uuid = ebook.uuid
    except Ebook.DoesNotExist:
        return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                            status=status.HTTP_404_NOT_FOUND)
    images = Image.objects.all().filter(ebook=ebook).all()
    annotations = [a for a in Annotation.objects.all()
                   if a.image in images
                   if a.type == 'HUM']

    # Get the html files from the storage
    storage_path = f"test-books/{ebook_uuid}"
    html_files = []
    for folder_name, sub_folders, filenames in os.walk(storage_path):
        for filename in filenames:
            if filename.endswith(".html"):
                html_files.append(filename)

    # Inject image annotations into the html files
    inject_image_annotations(ebook_uuid, html_files, images, annotations)

    # Zip contents
    print(f"Zipping: {ebook_uuid}")
    zip_file_name = zip_ebook(ebook_uuid)
    print(zip_file_name)

    # Return zipped contents
    with open(zip_file_name, 'r') as file:
        print(file)
        response = HttpResponse(file, content_type='application/epub+zip')
        response['Content-Disposition'] = f'attachment; filename={zip_file_name}'
        return response


def ebook_upload_view(request):
    pass
